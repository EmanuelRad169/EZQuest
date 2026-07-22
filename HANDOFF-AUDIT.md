# EZQuest Theme — Hand-off Audit

_Staff-engineer code review of the `EZQuest` Shopify Online Store 2.0 theme repo. Prioritized: fix **Critical/High** before hand-off; **Medium/Low** are cleanup._

**Scanned:** `assets/` (103), `sections/` (81), `snippets/` (57), `templates/` (44), `layout/` (2), `config/`, `scripts/` (143), `docs/` (32). `node_modules/` excluded.

**Green flags (already good):** `.env.local` is git-ignored and **not tracked** — no secret leak. No hardcoded API keys, tokens, or absolute local paths in source. `.gitignore` is comprehensive (secrets, backups, gift-card CSV, generated images all excluded). All storefront JS is `defer`-loaded; CSS is non-blocking with inlined critical CSS.

---

## 0. Priority summary

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | 🔴 Critical | Hand-off | `.env.example` documents 4 of ~15 required env vars |
| 2 | 🔴 Critical | Naming | 3 different env-var names each for **store domain** and **admin token** — scripts silently disagree |
| 3 | 🟠 High | Repo health | `.git` is **558 MB** (history bloat) |
| 4 | 🟠 High | Dead code | `generate-images.ts` + `generate-shopify-images.ts` — `.ts` with **no TS runner** (unrunnable) and duplicated |
| 5 | 🟠 High | Ghost code | Theme's inline GA4 + `analytics.js` event layer is **dormant** (GA runs via Custom Pixel) |
| 6 | 🟡 Medium | Duplicate logic | Shopify `/contact` POST copy-pasted in 3 files |
| 7 | 🟡 Medium | Dead code | `scripts/migration/` (35 one-time files) tracked in repo |
| 8 | 🟢 Low | Naming | PascalCase image assets (`BuyFrom-001.jpg`) vs kebab-case convention |

---

## 1. Ghost files & dead code

- **🟠 `scripts/generate-images.ts` & `scripts/generate-shopify-images.ts`** — the repo's only two `.ts` files. `package.json` has **no `tsc`/`ts-node`/`tsx`**, so neither can be executed (`node file.ts` fails). They are also **functionally duplicated** (image generation, 377 vs 523 lines). → Pick one, port it to `.js` (or add `tsx`), delete the other.
- **🟠 Dormant theme-side GA4 (`layout/theme.liquid` ~lines 215–275 + `assets/analytics.js`)** — the entire inline `gtag.js` bootstrap, Consent Mode block, and `analytics.js` custom-event layer are gated on `settings.ga4_measurement_id`, which is **blank** because GA4 runs through a Shopify **Custom Pixel**. Verified live: `window.gtag` is `undefined` on the storefront. `analytics.js` is still downloaded on every page but its events reach nothing. → Either remove this layer, or document that it's a deliberate fallback and leave the setting blank.
- **🟡 `scripts/migration/` (35 files)** — one-time launch-migration scripts (order/gift-card/blog imports, test fixtures). Tracked in git; dead post-launch. → Move under the already-ignored `scripts/archive/` or delete.
- **🟢 `scripts/archive/` (59) & `prompts/archive/`** — already git-ignored (reference only) but still on disk. Fine to leave; delete locally if you want a lean checkout.
- **🟢 Junk:** `.claude/.DS_Store` present (dir is ignored, so harmless).
- **Note (NOT dead):** `snippets/notify-me-form.liquid` is referenced by `sections/main-product.liquid` — keep it (see §2 for its duplication).

_Unused-import scan: Liquid has no imports; JS modules are plain IIFEs with no dead `import` statements. No orphaned ES imports found._

---

## 2. Duplicate logic (refactor into a shared utility)

- **🟡 Shopify contact-form POST — duplicated in 3 places:** `assets/notify.js`, `snippets/newsletter-popup.liquid` (inline `<script>`), and `snippets/notify-me-form.liquid`. Each hand-builds `FormData` with `form_type` + `contact[email]` + `contact[tags]` + `contact[body]` and `fetch(root + 'contact', {method:'POST', headers:{Accept:'application/json'}})`, and — importantly — each treats **any** response as success without checking `res.ok`. → Extract `assets/shopify-contact-submit.js` exposing `submitContact({email, tags, body, formType})` that resolves/rejects on HTTP status, and call it from all three. Fixes the duplication **and** the swallowed-error bug in §3 at once.
- **🟡 Analytics event surfaces split across 5 files** — `assets/analytics.js`, `assets/cookie-consent.js`, `assets/predictive-search.js`, `layout/theme.liquid`, `sections/main-search.liquid` all call `gtag(...)`. Search events in particular are emitted from **both** `predictive-search.js` and `main-search.liquid`. → Consolidate event emission into one `track()` helper so there's a single place to swap GA/pixel targets.

---

## 3. Security & code smells

- **✅ Secrets:** none hardcoded. Only match was a validation string in `scripts/shopify-admin/lib/env.js` (checks for an `shpss_` prefix) — not a secret. `.env.local` (real `SHOPIFY_ADMIN_ACCESS_TOKEN`, `OPENAI_API_KEY`, app client id/secret) is git-ignored and untracked. ✅
- **✅ Local paths:** no `/Users/…`, `/Applications/…`, or `C:\` in source.
- **🟡 Happy-path networking (missing error handling):** the `/contact` `fetch` calls in §2 never inspect `res.ok`/status — a Shopify 4xx/5xx still renders the "success" state, so failed signups look successful to the user. Add status checks in the shared util.
- **🟡 `gift-cards-reissued.csv`** — correctly git-ignored ("treat as cash"), but it exists on disk under `docs/migration/`. Confirm it's purged from the machine before handing off the folder.
- **🟢 Hallucinated params:** none material found in the storefront layer — Liquid filters (`image_url`, `money`, `date`) and `{% form %}` usages are valid; Product/Article/Org JSON-LD is well-formed. The main risk sits in the un-runnable `.ts` scripts (§1), which no one is executing.

---

## 4. Naming & formatting inconsistencies

- **🔴 Env-var aliasing (this is the big one — see §5):** the same value is read under multiple names, so a partially-configured `.env` makes ~8–9 scripts fail silently:
  - **Store domain:** `SHOPIFY_SHOP_DOMAIN` (35 files) vs `SHOPIFY_STORE` (8) vs `SHOPIFY_FLAG_STORE` (2).
  - **Admin token:** `SHOPIFY_ADMIN_ACCESS_TOKEN` (35) vs `SHOPIFY_ADMIN_TOKEN` (8) vs `SHOPIFY_ADMIN_API_TOKEN` (1).
  - **API version:** `SHOPIFY_ADMIN_API_VERSION` vs `SHOPIFY_API_VERSION`.
  → Standardize on the 35-file canonical names; have `scripts/shopify-admin/lib/env.js` read canonical **with the aliases as fallbacks** so nothing breaks, then migrate call sites.
- **🟢 Script file extensions:** mix of `.js`, `.cjs`, and `.ts` in `scripts/`. `.cjs` is intentional (CommonJS), but the two `.ts` files have no toolchain — pick one module system per folder.
- **🟢 Image asset naming:** `assets/BuyFrom-001.jpg …` use PascalCase while the theme convention is kebab-case (`ezquest-logo.svg`, `support-compatibility.svg`). Cosmetic; rename on next asset pass.
- **✅ Liquid/CSS:** section/snippet filenames are consistently kebab-case; CSS uses BEM-ish `block__element--modifier`. Consistent.

---

## 5. Hand-off readiness

### 5a. `.env.example` — replace the current 4-line file with this

```dotenv
# ─── Shopify Admin API (required for scripts/shopify-admin/* seed + audit tooling) ───
# Canonical names. Some legacy scripts also read the aliases noted in comments — set the
# canonical ones; aliases are accepted as fallbacks.
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com      # aliases: SHOPIFY_STORE, SHOPIFY_FLAG_STORE
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxx  # aliases: SHOPIFY_ADMIN_TOKEN, SHOPIFY_ADMIN_API_TOKEN
SHOPIFY_ADMIN_API_VERSION=2025-01                  # alias: SHOPIFY_API_VERSION
THEME_ID=123456789012                              # target theme for CLI/theme scripts

# ─── Local dev preview (scripts/dev/*) ───
SHOPIFY_PREVIEW_PORT=9292
ROUTE_QA_BASE=https://your-store.myshopify.com     # base URL for scripts/dev/route-qa.sh

# ─── Image generation (ONLY for scripts/generate-*.ts — optional) ───
IMAGE_PROVIDER=openai                              # openai | perplexity
IMAGE_API_KEY=
IMAGE_MODEL=
OPENAI_API_KEY=sk-xxxxxxxx
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_QUALITY=high
PERPLEXITY_API_KEY=

# ─── Optional tooling overrides (have sane defaults; leave blank unless needed) ───
EZQ_PREVIEW_BASE_URL=
EZQ_PREVIEW_PRODUCTS_PATH=
EZQ_REPORT_PATH=
EZQ_CACHE_DIR=
EZQ_IMAGE_DIRS=
EZQ_FILTER_HANDLES=
```

> Storefront analytics/GA4 is **not** an env var — it's the `ga4_measurement_id` theme setting (currently blank; GA4 runs via a Shopify **Custom Pixel** in admin → Customer events).

### 5b. Architecture summary (paste into README)

> EZQuest is a Shopify Online Store 2.0 theme: page structure is JSON templates composed from Liquid `sections/` and `snippets/`, styling is Tailwind compiled from `src/styles/theme.css` → `assets/theme.css` (`npm run build`) plus a few hand-maintained static stylesheets (`pdp.css`, `pages.css`, `policy-page.css`), and all interactivity is vanilla-JS IIFE modules in `assets/` loaded `defer` from `layout/theme.liquid`. It deploys through a **GitHub → Shopify** sync (push to `main`) or directly via `npm run push` (Shopify CLI), and analytics run through a Shopify **Custom Pixel** rather than a theme-embedded GA tag. A separate Node tooling layer under `scripts/shopify-admin/` (entry point `cli.js`, run via `npm run shopify:seed:*`) writes products, metafields, metaobjects, and pages through the Shopify **Admin GraphQL API** using the credentials in `.env.local`.

---

## ✅ Fixed in this pass (commit `908e7b2`)

- **#1 `.env.example`** rewritten to document all ~15 vars (Shopify, dev preview, image-gen, tooling overrides).
- **#2 env-var aliasing** — `scripts/shopify-admin/lib/env.js` now resolves the legacy aliases (`SHOPIFY_STORE`/`SHOPIFY_FLAG_STORE` → `SHOPIFY_SHOP_DOMAIN`; `SHOPIFY_ADMIN_TOKEN`/`SHOPIFY_ADMIN_API_TOKEN` → `SHOPIFY_ADMIN_ACCESS_TOKEN`; `SHOPIFY_API_VERSION` → `SHOPIFY_ADMIN_API_VERSION`, defaulting to `2026-01`).
- **#5 dormant GA4** — documented inline in `layout/theme.liquid` as an intentional fallback (primary GA = Custom Pixel).
- **#6 duplicate `/contact` POST + swallowed errors** — extracted `assets/shopify-contact-submit.js` (`window.ezSubmitContact`, rejects on non-2xx); `notify.js` and the newsletter popup now use it. The popup's false-"success" bug is fixed (`.catch` now fires on HTTP error).
- **#3 `.git` size** — `git gc --prune=now` run (558 MB → 546 MB; the rest is large blobs in history — see below).

## ⏳ Deferred (destructive — need your go-ahead)

- **Deep `.git` shrink:** the remaining bloat is large binary blobs committed to history. Removing them requires a history rewrite (`git filter-repo` / BFG), which changes commit SHAs and needs a force-push — it will also desync the GitHub→Shopify connection until re-synced. I did **not** run this unilaterally.
- **`.ts` image scripts (#4):** left in place — deleting the duplicate is irreversible; confirm which one to keep (`generate-shopify-images.ts` is the more complete of the two) and whether to port it to `.js` or add `tsx`.
- **`scripts/migration/`:** left tracked — kept as reference for how the store was seeded; say the word and I'll untrack it.

## Recommended fix order

1. **Rewrite `.env.example`** (§5a) and **unify env-var names** in `scripts/shopify-admin/lib/env.js` with alias fallbacks (§2/§4).
2. **Resolve the `.ts` image scripts** — port one to `.js`, delete the duplicate (§1).
3. **Extract `shopify-contact-submit.js`** shared util with `res.ok` handling (§2/§3).
4. **Decide on the dormant GA4 layer** — remove or document (§1).
5. **Slim the repo** — `git gc --aggressive` / BFG to shrink the 558 MB `.git`; move `scripts/migration/` to archive (§3/§7).
