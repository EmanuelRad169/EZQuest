# EZQuest — Project Brief (handoff for Cowork / fresh Claude sessions)

Read this first. It captures the non-obvious, hard-won context that isn't derivable from the code. Complements `.claude/CLAUDE.md` (→ `.claude/SKILL.md`, the design/code standards) and `AGENTS.md` (working rules).

## What this is

Custom Shopify Online Store 2.0 theme for EZQuest (consumer tech / chargers-docks brand).

- **Repo:** `EmanuelRad169/EZQuest`, branch `main` (GitHub)
- **Store:** `ezquest-4.myshopify.com` (preview password: `rtaoch`)
- **Live theme:** connected to this repo via the Shopify GitHub integration — pushes to `main` deploy to the live theme, and edits made in the Shopify admin come back as `Update from Shopify for theme EZQuest/main` commits.
- **Stack:** Liquid + JSON templates, Tailwind CSS (PostCSS) compiled to `assets/theme.css`, vanilla JS custom elements. No frameworks.

## Deploy pipeline — the #1 gotcha

1. **GitHub → Shopify deploy lag.** After pushing to `main`, the Shopify GitHub integration can take several minutes to sync — and occasionally silently stalls. Don't assume the live theme reflects the last commit.
2. **Recovery when the integration lags/stalls:** push directly with the CLI: `npm run push` (runs the production CSS build, then `shopify theme push` to the connected theme). Verify on the storefront afterwards.
3. **Two-way sync hazard:** admin/theme-editor changes commit back to `main`. Always `git pull` before working, and expect occasional sync commits that overwrite theme content (this has wiped section blocks before — e.g. the compare table had to be restored after a live-theme sync).

## Build rules (Tailwind)

- Source of truth is `src/styles/theme.css`; **never hand-edit `assets/theme.css`**.
- Production build: `npm run build` (= `tailwindcss -i src/styles/theme.css -o assets/theme.css --minify`). Always run it before pushing/committing CSS changes.
- **Kill the dev watcher first.** `npm run dev` runs a Tailwind `--watch` (non-minified). If it's still running when you `npm run build`, the watcher can overwrite the minified output with a dev build. One process writing `assets/theme.css` at a time.
- Dev preview: `npm run dev` → `http://127.0.0.1:9292` (Shopify CLI, **not** MAMP — the folder just lives in htdocs).
- QA: `npm run check` (Theme Check — keep at 0 offenses), `npm run qa`, Playwright tests in `tests/`.

## ComparExpert (product compare)

- Compare page is `/pages/compare` (`templates/page.compare.json`), powered by the **ComparExpert / Helptochoose** app widget (`#htc-page`).
- CSS customizations: free-tier "Powered by Helptochoose" branding is hidden, widget padding added, and **compare buttons are hidden everywhere except `/pages/compare`**.
- `compare-share.js` is scoped to the compare section only — don't let it load site-wide again.
- A no-app "dynamic product compare" was tried and reverted; the static compare table blocks (4 chargers × 6 spec rows) also exist (`sections/product-compare-table.liquid`) and were once wiped by a live-theme sync — check them after big syncs.

## Bundle / upsell flow

- `sections/product-bundle-upsell.liquid` drives the PDP bundle offer; the PDP "Complete your setup" row uses Shopify complementary-products (cards were forced visible because the motion-fade-up reveal left them at opacity 0 after a JS swap — keep that fix).
- Cart flow is AJAX drawer (Sections API refresh: `cart-drawer-body` / `cart-drawer-footer`); ATC opens the drawer, never redirects to `/cart`.

## Content & data

- Product content lives in **metafields**, seeded via `scripts/shopify-admin/` (`npm run shopify:seed:*`; `:dry` for dry-run). Normalized product data: `docs/ezquest-product-sheet-normalized.json`.
- Store connectors: use Shopify MCP/GraphQL for metafields, bundles, prices — same store `ezquest-4.myshopify.com`.
- Image generation follows `brand/image-style.md` + `prompts/templates/` — reuse the established visual style; no text baked into images.

## Open items (as of 2026-07-07)

- [ ] **C59920 shows $0 price** — variant price never set in Shopify admin; fix the price on the product, not in the theme.
- [ ] **"In the box" metafields** — rendered by `sections/main-product.liquid` / `product-resource.liquid`, but content not populated for all products.
- [ ] **Product video metafields** — `sections/shoppable-video.liquid` exists; video metafield content still missing for most products.

## Key docs in `docs/`

`deployment-checklist.md`, `launch-playbook.md`, `frontend-architecture.md` (the hybrid Tailwind/shared-CSS rule), `shopify-admin-automation.md`, `theme-settings.md`, `qa-release-checklist.md`.

## Ground rules recap

- Mobile-first, conversion-first; font weights only 400/500; pill buttons; section rhythm dark→white→grey (`.section--grey`, not `surface-muted`).
- No inline `style=""`, no arbitrary Tailwind values, keep Liquid lean.
- Surgical edits only; run `npm run build` + `npm run check` after significant changes.
