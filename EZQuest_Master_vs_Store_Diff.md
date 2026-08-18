# EZQuest — Master Sheet vs. Live Store: What's Different

**Source:** Google Sheet "EZQuest Products Master" (16 tabs: README, PRODUCTS, KEY_FEATURES, SPECS, COMPATIBILITY, FAQS, DOWNLOADS, IMAGES, VIDEOS, SHIPPING, INVENTORY, MARKETPLACE_LINKS, TAGS, BUNDLES, QR_REDIRECTS, STATUS_TRACKER) vs. the live Shopify catalog (65 active products).

All tabs were consulted. A full cell-by-cell text diff of all ~57 shared SKUs was **not** performed (see §6) — this covers the structural and asset-level differences, which are the substantive ones.

---

## 1. Catalog membership

The master and the live store overlap on the ~57 standard current SKUs.

## 2. Fields the STORE has that the master doesn't

- **`ezquest.best_for`** — I populated all 65 products this session. The master has **no Best-For column**, so these are net-new (no conflict).
- The richer compare/architecture fields (`ezquest.spec_rows` metaobjects, `ezquest.compare_*`, `ezquest.compatibility_summary`, `ezquest.downloads`) — the store's architecture is more built-out than the master's simpler mapping.
- All kit content authored this session.

## 3. "Mapping mismatch" = the master's README doc is stale, NOT a storefront bug

The master's README names some fields that don't exist in Shopify. But after checking the live data, the store already stores this content under its **own** canonical field names — and the theme renders all of it. So there is **no storefront breakage**; the discrepancy is only that the README guide is out of date.

| Concept | Master README says | Live store actually uses | Populated & rendered? |
|---|---|---|---|
| Tagline | `custom.short_description` | `custom.short_description` | ✅ |
| Kicker | `custom.kicker` | `custom.kicker` | ✅ |
| Key features | `custom.key_features` | `custom.key_features` | ✅ |
| MPN | `custom.mpn` | `custom.mpn` | ✅ |
| Warranty | `custom.warranty_years` | `custom.warranty_years` | ✅ |
| Amazon | `custom.amazon_asin` | `custom.amazon_asin` + `ezquest.amazon_url` | ✅ (sparse coverage) |
| Hero video | `custom.hero_video` | **`custom.product_video_url`** | ✅ rendered; on products that have a video |
| FAQs | `custom.faqs` | **`ezquest.faq_items`** (metaobjects) | ✅ ~63/65 populated, rendered |
| Compatibility | `custom.compatibility` | **`ezquest.compatibility_summary` / `_entries` / `custom.product_compatibility_html`** | ✅ populated, rendered |
| Related/Bundles | `custom.related` | **`ezquest.use_cases` + `product-bundle-upsell` section** | ✅ rendered |

**Correct fix:** update the master **README mapping** to point at the live field names above, so future data entry lands in the right place. Do **not** create `hero_video` / `faqs` / `related` metafields — that would duplicate working fields and break the locked single-source architecture.

## 4. Genuine coverage gaps (verified against live data)

- **Warranty — FIXED.** All 8 kits + one non-kit (USB-C to DisplayPort 4K 60Hz Cable) were missing `warranty_years`; set to **1 yr** (the master default). All other non-kit products already carry specific terms (1 / 1.5 / 2 yr) — left untouched (more specific than the default).
- **FAQs — FIXED.** `USB-C Dual HDMI Multimedia Hub 5 Ports` (X40225) and `USB-C Multimedia Hub 8 Ports 4K 60Hz` (X40228) had no `faq_items`; added 6 FAQs each, authored strictly from each product's own verified spec sheet (resolution, PD wattage, port speeds, Ethernet, card readers, Thunderbolt, warranty). Now every active non-kit product has FAQs.
- **Downloads — 1 fixed, 2 legitimately empty.** `DuraGuard 3.5mm 90°` (C59920) had an official manual in the master (`c59920-c59930-manual.pdf`) — **added**. `SuperSpeed Gen 1 USB-C→USB-A 2-Pack` (X40079) and `DuraGuard 6.35mm 3m` (C63530) have **no** manual in the master's DOWNLOADS tab (simple passive accessories) — left empty, which is correct (tab hides). *Note: a `DuraGuard-C63530-Spec.docx` exists in local uploads but is not a published customer asset; add it as a download only if you want it public.*
- **Videos — partial by design.** Hubs, chargers and a few flagships have `product_video_url`; most cables/adapters don't (no demo video exists). Not a defect.
- **Amazon — sparse.** Only products actually listed on Amazon have `amazon_asin`/`amazon_url`. Expected.

## 5. Warranty (done)

Master default = **1 year**. Applied to the 8 kits and the one non-kit that was blank. If kits should instead carry the longest bundled-component term, adjust those 8 values — but 1 yr is the safe master default and is now live.

## 6. Not diffed at the cell level

Per-SKU **text** (short_description, highlight, key_features, specs, compatibility) exists in both places and may differ word-for-word. A full 57-row textual comparison was not done (the sheet is a single 560 KB block that can't be reliably chunked through the Drive reader). I can go SKU-by-SKU on request, or diff precisely if you export each tab as CSV into the project folder.

---

## Recommended reconciliation

1. **Update the master README mapping** (§3) to the live field names — the real "mapping fix." I can write this into the sheet if you want.
2. **Add FAQs** to the 2 products missing them, from the master's FAQS tab.
3. **Row-level content diff** — optional; on request.

Everything else the store already handles correctly under its own schema.
