# EZQuest — Next Phase: Product Content Enrichment Plan

**Date:** 2026-08-17 · **Prerequisite:** Metafield architecture is complete (see `EZQuest_Content_Architecture_Report.md`). The theme now reads one canonical source per field and hides anything empty. That means enrichment is now purely a **data** exercise — fill and polish metafields in Admin, and the storefront updates itself. No further theme work is required to benefit from better content.

The goal of this phase is to move from "every field is technically wired" to "every product has strong, consistent, complete content" — so no PDP looks thin, every compare row is meaningful, and structured data / SEO is fully fed.

---

## 1. Where the catalog stands today (audit of 65 active products)

Presence audit (does the metafield exist and hold a value), run across all active products:

| Field | Coverage | Read |
|---|---|---|
| `custom.short_description` (tagline) | 57/57 non-kit + 8/8 kits | Complete — polish for quality/consistency |
| `custom.product_highlight` (Overview) | 57/57 non-kit | Complete (non-kit); **0/8 kits** |
| `custom.key_features` (buybox + compare) | 65/65 | Complete |
| `custom.product_features` (read-more) | 57/57 non-kit | Complete (non-kit); **0/8 kits** |
| `ezquest.spec_rows` (specs table) | 57/57 non-kit | Complete (non-kit); **0/8 kits** |
| `ezquest.compatibility_summary` | 57/57 non-kit | Complete (non-kit); **0/8 kits** |
| `custom.warranty_years` | 57/57 non-kit | Complete (non-kit); **0/8 kits** |
| `ezquest.downloads` | ~50/57 non-kit | A handful of small accessories missing |
| **`ezquest.best_for`** | **~9/65** | **Biggest gap — mostly empty** |
| **`reviews.rating`** | **1/65** | **Essentially empty — no social proof** |

**Bottom line:** the core PDP fields are in great shape for standard products. The real enrichment work is three things, in priority order: (1) fill **Best For** everywhere, (2) build out the **8 kits** to full depth, (3) seed **reviews**. Then a quality pass over the copy that already exists.

---

## 2. Priorities (do them in this order)

### Priority 1 — `ezquest.best_for` for all 65 products
This is the single highest-leverage gap. It powers a compare-table row and the mega-menu use-case eyebrow, and it's the field most often blank. It's a short single-line phrase (2–5 words) describing the ideal buyer/use.

Standard: a concrete audience or scenario, not a feature. Examples by category:

- Chargers → "Travel & everyday charging", "Powering laptops on the go"
- Multi-port hubs / docks → "Single-cable desk setups", "Home-office docking"
- Display adapters / cables → "Connecting to an external monitor", "4K presentations"
- Data adapters / card readers → "Photographers & video editors", "Legacy USB devices"
- Kits → the bundle's audience, e.g. "Traveling professionals", "Content creators"

### Priority 2 — Build the 8 kits to full PDP depth
Kits currently have tagline, key features, MPN, and compare connector/form factor. To match standard-product depth, add per kit:

| Field | What to write |
|---|---|
| `custom.product_highlight` | 1–2 sentence Overview: what the bundle is and who it's for |
| `custom.product_features` | The read-more detail — what each included item does |
| `custom.in_the_box` | The exact list of included products (kits are bundles — this is the key kit field) |
| `ezquest.compatibility_summary` | Combined compatibility of the bundled items |
| `custom.warranty_years` | Warranty term (confirm the correct value — components may differ) |
| `ezquest.best_for` | Bundle audience (Priority 1) |
| `ezquest.compare_charging_power` / `compare_portability` | Where a compare row applies |

Kits legitimately have no `spec_rows` or `downloads` of their own — leave those empty; the tabs stay hidden, which is correct.

### Priority 3 — Seed reviews
Only one product currently has a rating. Reviews drive both conversion and the JSON-LD star snippet in Google (which is wired and will light up automatically once `reviews.rating` / `reviews.rating_count` are populated with genuine data). Decide the source — the native Shopify Product Reviews metafields, or your review app — and backfill genuine ratings. Do **not** import placeholder/AliExpress-style reviews; the structured-data markup is intentionally gated to first-party data only.

### Priority 4 — Fill the missing downloads
A few small accessories (some audio cables and mini adapters) have no download assets. If a spec sheet or manual exists, add it to `ezquest.downloads`; if not, leaving it empty is fine (the tab hides).

---

## 3. Quality pass (after the gaps are filled)

Presence isn't quality. Once fields are populated, run a consistency pass over the copy that already exists:

- **Taglines (`short_description`)** — one line, benefit-led, no trailing period inconsistency, consistent voice. They now appear directly under every product title, so they're highly visible.
- **Overview (`product_highlight`)** — 1–3 sentences, benefit-first, no duplication of the raw feature bullets (the architecture now keeps these separate, so the copy should stay distinct in tone too).
- **Key features (`key_features`)** — 4–6 scannable bullets, parallel phrasing, lead with the outcome. These feed both the buybox and the compare table, so they should read well out of context.
- **Specifications** — confirm the structured `spec_rows` are the ones showing (they are, when present); the legacy HTML is now only a fallback and can eventually be retired per product once you trust the structured rows.

---

## 4. Recommended workflow

1. **I generate a content-completeness spreadsheet** — one row per product, a column per field, marked filled / empty / needs-review, sorted so the gaps are obvious. This becomes your worklist and progress tracker.
2. **Draft `best_for` for all 65** in that sheet (I can propose values per product from their existing specs; you approve/edit).
3. **Bulk-write** the approved values to metafields via the Admin API (same safe, additive method used for the kit fields — no commerce impact).
4. **Kit deep-dive** — one pass to author the 7 kit fields above, then bulk-write.
5. **Quality pass** on taglines/overview/key features, product by product or in themed batches (chargers, hubs, cables, adapters, kits).
6. **Reviews** — decide the source and backfill.

Everything here is metafield data only. It can be done incrementally after launch without any theme change or storefront risk — the architecture already renders whatever you fill in and hides whatever you don't.

---

## 5. Suggested first step

The fastest way to start is the completeness spreadsheet + proposed `best_for` values for all 65 products, ready for your review. Say the word and I'll generate it.
