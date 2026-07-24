# EZQuest — Go-Live Handoff Checklist

**Purpose:** everything to verify before pointing the live domain at this store.
**Legend:** ✅ done/verified · ⚠️ needs a quick verify · 🔴 action required before launch · 🟡 recommended (not blocking)

Live audit run against `ezquest-4.myshopify.com` on the date of handoff. Overall the theme, content, SEO, and forms are in strong shape. The remaining blockers are almost entirely **merchant settings** (analytics, domain, favicon) rather than code.

---

## A. Ship the code (do this first)

- 🔴 **Push all local commits.** A batch of theme fixes is committed but must be deployed. On your Mac:
  ```
  cd /Applications/MAMP/htdocs/EZQuest
  git pull --rebase origin main
  git push origin main
  ```
  Then confirm in Shopify **Online Store → Themes** that the GitHub-connected theme updated. Included in this batch: locale-text contrast, hero autoplay, removed yellow highlights, solid-triangle nav carets, bigger/transparent Compare images, centered Shop mega-menu + top-gap match, contact-input 16px fix, form conversion tracking, honeypots, and the ticket-form event.
- ⚠️ **Hard-refresh and click through** the homepage, a product, a collection, cart, and the nav menus once after deploy to confirm the visual changes rendered.

## B. Analytics & conversion tracking

- 🔴 **GA4 is not currently loading on the storefront.** The tracking code is wired (a `generate_lead` event fires on every form success), but nothing sends until GA4 is live. Connect GA4 via **Settings → Customer events** (or the Google & YouTube channel), then open **GA4 → DebugView**, submit a form, and confirm the event arrives.
- 🟡 **Meta Pixel** is not installed. If you run Meta ads, add the Pixel (the code already fires a `Lead` event when `fbq` is present). Verify with the Meta Pixel Helper extension.
- ⚠️ Once live, mark the form event(s) as **conversions/key events** in GA4 so they show in reports.
- ✅ Shopify's native analytics (`ShopifyAnalytics`) is active.

## C. Store settings & brand assets

- 🔴 **Upload a favicon** in **Theme settings → favicon.** Right now the site uses an SVG fallback for the browser tab, and the iOS home-screen icon (`apple-touch-icon`) only renders once a favicon is set. Uploading one fixes both.
- ✅ **Product image alt text** — audited all 66 products; only 2 had blank alt (15 images total) and I set descriptive alt on every one. All product images now have alt.
- ✅ **Remaining empty-alt images are correct, not defects.** Verified the images that scanners flag on the homepage are **decorative by design**: the hero banners are background images with the headline as real HTML text, and the Shop-menu thumbnails sit inside `aria-hidden="true"` links that already carry an `aria-label`. Empty `alt=""` is the WCAG-correct treatment for decorative images, so Lighthouse/axe pass them — no change needed (adding alt would be redundant and worse for screen readers).
- ⚠️ Confirm the social share image (`og:image`) is the intended brand image (it's present and valid).
- ✅ Title tags, meta descriptions, canonical, Open Graph, Twitter card, `lang`, and viewport are all present and well-formed.

## D. Commerce readiness

- ⚠️ **Payments:** you ran successful test orders (#1001/#1002) and turned test mode off — re-confirm the live gateway is enabled and test mode is **off** right before launch.
- ✅ **Shipping:** rates configured; free shipping over $90 threshold verified.
- 🔴 **Taxes:** confirm tax regions/rates are set for where you sell (Settings → Taxes).
- ✅ **Inventory — never shows sold out (done).** Per your choice, every variant is now set to **continue selling** with tracking off, so no product can display as sold out. (9 kit products were still on "deny" and were switched to "continue".) Finale remains not-syncing, which is fine under this model — revisit only if you later want true stock counts.
- ⚠️ **Checkout:** confirm contact/customer accounts setting, and that order confirmation + shipping notification emails are enabled.

## E. Apps & integrations

- ✅ **Reviews — Judge.me removed (verified clean).** Uninstalling it left **no broken storefront output**: the theme never rendered its stub, and the review-stars setting (`reviews_app`) isn't referenced anywhere, so product pages simply show no reviews — no empty boxes or errors. The store will launch with **zero product reviews**, which is fine functionally but reduces social proof; decide later whether to add Shopify's native product reviews (the theme already has a "native" option) or another review app. 🟡 Optional hygiene: delete the inert `snippets/judgeme_widgets.liquid` stub and the disabled Judge.me app block in `config/settings_data.json` (both are ignored by Shopify now).
- 🔴 **Finale Inventory:** installed but not actively syncing (0 products mapped). Either complete the connection/stock push or disable it cleanly so it doesn't cause confusion. Tie this to the inventory decision in section D.
- ✅ **ShipStation:** connected and active.
- ✅ **Tidio live chat:** "Talk to Expert" widget present and active.

## F. Content & SEO — verified this pass

- ✅ Product titles, descriptions, and all content-page bodies copyedited (broken glyphs, spacing, placeholder copy fixed).
- ✅ Structured data present and valid: Organization, WebSite, BreadcrumbList on all pages; CollectionPage on collections; **Product (with price + availability) and FAQPage on product pages.**
- ✅ Single `<h1>` per page; clean titles/descriptions across home, collection, and product.
- ✅ Legal pages (Privacy, Terms, Refund, Cookie) present, styled, and returning 200.
- ✅ All key nav/footer/policy routes return **200** (no broken links found).
- ✅ Forms audited: correct email keyboard, labels, real error handling, honeypots on custom forms, 16px inputs (no iOS zoom).

## G. Domain cutover — recommended order

1. Complete sections A–D above (deploy + analytics + settings + commerce).
2. In **Settings → Domains**, connect the custom domain and let SSL provision (can take up to 48h).
3. Set the custom domain as **primary**; keep "redirect all traffic to primary."
4. If migrating from an existing live site, add **301 redirects** (Settings → Navigation → URL redirects) for any changed URLs so you keep SEO equity.
5. Remove the storefront **password** only when you're ready to be public (it's currently open — set a password if you want a soft pre-launch).
6. Submit the sitemap (`/sitemap.xml`) in **Google Search Console** for the new domain.
7. Update the domain anywhere it's hardcoded: GA4 stream URL, Meta Pixel domain, Judge.me email logo, any app callbacks.

## H. Post-launch smoke test (first 30 minutes)

- [ ] Place one real (small) order on the live domain, then refund/cancel it.
- [ ] Confirm order confirmation email arrives and looks right.
- [ ] Submit the contact form and the newsletter popup → check Shopify **Customers** + notification inbox, and GA4 DebugView for the event.
- [ ] Load the site on a real iPhone and Android: header, menus, PDP, add-to-cart, checkout.
- [ ] Check `https://yourdomain/` has the padlock (SSL) and the `.myshopify.com` URL redirects to it.
- [ ] Spot-check 3–4 products for correct price, images, and stock state.

---

### Audit snapshot (this pass)

| Area | Result |
|---|---|
| SEO meta (home/collection/product) | ✅ title, description, canonical, OG, Twitter |
| Structured data | ✅ Org, WebSite, Breadcrumb, Collection, Product+offers, FAQ |
| Broken links (18 key routes) | ✅ all 200 |
| Console errors | ✅ none observed |
| GA4 / Meta Pixel loaded | 🔴 not present yet |
| Favicon / apple-touch-icon | 🔴 no favicon uploaded (SVG fallback only) |
| Product image alt text | ✅ complete (theme UI images minor) |
| Inventory / sold-out state | ✅ all variants continue-selling |
| Forms (keyboard, labels, errors, spam, 16px) | ✅ fixed this engagement |
