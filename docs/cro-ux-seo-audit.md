# EZQuest — Ruthless CRO / UX / SEO Audit

*Store: ezquest-4.myshopify.com · Audited live, desktop + mobile + full purchase-flow interaction · Analysis only — no product copy was changed.*

## Store context (filled to match the site)

- **Target audience:** Mac-first creative professionals and prosumers — photographers, videographers, editors, plus remote/hybrid workers and frequent travelers who need reliable USB-C connectivity for laptops, iPads, and phones.
- **Main product / niche:** Premium USB-C connectivity accessories — multiport hubs & docks, GaN wall/car chargers, DuraGuard™ cables, display adapters, and card readers. Established brand ("Trusted since 1994").
- **Current biggest struggle:** Pre-launch. Zero conversion history, so the priority is a storefront that converts launch-day traffic on the first visit — no second chances, no retargeting history to lean on.

A note on scope: several friction points found earlier this week are **already fixed** (blurry gallery images, buy-box fade-in, Add-to-Cart redirecting instead of opening the drawer, the chat that wouldn't open, $0-priced items, bundle SKUs/weights, free-shipping number mismatch). Those are marked ✅ below so you don't re-chase them. The rest is still open.

---

## 1. First impressions & trust (0–3 seconds)

**UVP clarity — WEAK.** The hero reads "USB-C hubs, docks, chargers, and cables for modern devices." That's a *category label*, not a reason to buy from **you** instead of Anker or UGREEN. Your single strongest differentiator — **"Trusted since 1994"** — is buried, not in the hero. A 30-year-old American accessories brand is a genuine trust weapon against the sea of no-name Amazon sellers, and right now it's whispering.

**The hero is an auto-rotating carousel.** It cycled through "USB-C Essentials," "Travel-Ready," etc. while I sat still. Rotating heroes are one of the most reliably documented conversion *losers* — the UVP moves before the eye locks on it, and mobile users almost never see slide 2+. Pick your single best message and make it static.

**Trust signals — present but the wrong kind.** Above the fold you get a clean free-shipping bar ("Free Shipping Over $90") and, on collection/cart, chips for warranty / returns / free shipping — good. But the homepage has **no review count, no star rating, no "as seen in," no customer proof.** The PDP leans on a strip of compliance logos (FC, CE, RoHS, HDMI, USB-C, OTG) — those reassure a compliance officer, not a shopper. Nobody buys because something is RoHS-certified.

**Navigation — clean, slightly abstract.** Shop / Support / Resources / Compare / About is tidy and not overwhelming. But "Resources" and "Compare" as top-level items spend prime real estate on low-intent destinations, while shoppers can't jump straight to "Hubs" or "Chargers" from the bar without opening "Shop." For a catalog this shallow (≈57 products), surfacing the 4–5 real categories in the nav would cut a click out of every journey.

**Trust gap that's actively hurting you: warranty says three different things.** Collection hero chip = "1-year warranty," PDP badge = "1.0-yr," cart order-summary box = "2-year warranty," and the product data now says 2 years for several items. A shopper who notices this (and detail-oriented tech buyers do) reads it as sloppiness. **This is a today fix.**

---

## 2. Mobile & visual UX critique

**Mobile is where you'll lose the most, and the #1 hole is the missing sticky Add-to-Cart.** On the PDP at phone width, once you scroll past the buy box there is **no persistent "Add to Cart" bar.** The shopper reads specs, tabs, FAQs — and to buy has to scroll all the way back up. For a mobile-majority store this is the single highest-leverage fix on the list. (Confirmed: this theme has no sticky mobile ATC.)

**Visual hierarchy — mostly good, one dilution.** The PDP buy box is clean: kicker → title → subtitle → price → highlight box → bullets → yellow "Add to Cart." The yellow CTA has strong contrast against the white card and the eye does land on it. **But** directly under it sits an equally-prominent purple "Buy with Shop" express button plus "More payment options," which competes with your primary CTA and pulls some users into a shortcut before they've absorbed the offer. Keep the express button, but visually subordinate it.

**Visual clutter — the 9-icon feature strip.** Below the gallery you render nine small badge icons (USB-C, HDMI 4K, HDR, OTG, Reversible, EMI, FC, CE, RoHS). On desktop it's busy; on a 390px phone it wraps into rows of tiny, low-legibility glyphs that add noise without adding a single reason to buy. Cut it to the 3–4 that are genuine selling points, or move it below the fold.

**Color contrast — generally fine.** The amber/black/white system is legible. Watch the muted grey subtitle and the light-grey spec labels on white — they hover near the low end of comfortable contrast for small text on mobile.

**Readability — good, but subtitles are spec dumps.** Several PDP subtitles read like a port list ("1 HDMI 4K 60Hz Port, 1 USB-A 3.0 port (5GB/s), 2 USB-C Ports…") rather than a one-line benefit. On mobile that's a wall of abbreviations in the most valuable line of text on the page.

---

## 3. Product page & copywriting audit

**Layout — strong bones.** Sticky gallery on the left, scrolling info column on the right, expandable "Learn more" highlight, tabbed specs/compatibility/FAQ, complementary "Complete your setup," related products. This is a genuinely well-built PDP. The Add-to-Cart button is dominant *within the buy box* — the problem is purely that it disappears on scroll (see §2).

**Copy — feature-led, not benefit-led.** This is the biggest copy gap and it's consistent across the catalog. Your specs are excellent and thorough ("100W PD with FRS," "5Gbps," "30,000-bend lifespan") but they're presented as *what it is*, not *what it does for me*. "One USB-C 4K 60Hz Video Output" is a spec; "Run a second 4K monitor from a single cable — no dock required" is a benefit. The `product_highlight` sections do better ("Strong and Durable," "Right-Angle Convenience") — that benefit voice should lead everywhere. *(Per your instruction, I have not rewritten any of your provided copy — this is a critique only.)*

**Missing information that creates hesitation:**

- **Real customer reviews.** Judge.me is installed but products show effectively no review volume. At launch, zero reviews on a $60–$160 accessory is the biggest single trust deficit — tech buyers cross-shop by review count. Seed reviews (even a modest verified set) before you drive paid traffic.
- **"What's in the box."** Bundles have it; most individual products don't. For a hub, "does it include the USB-C cable?" is a real pre-purchase question.
- **Warranty clarity.** See §1 — it's not just inconsistent, it's a stated hesitation-killer because the shopper can't tell what they're actually getting.
- **Delivery expectation on the PDP.** "Ships free over $90" is shown, but not "arrives in X business days." Amazon has trained buyers to expect a delivery date before they commit.

---

## 4. The 15 biggest friction points (ranked, highest severity first)

1. **No sticky Add-to-Cart on mobile PDPs** — mobile is your majority traffic and the primary CTA vanishes on scroll, so intent-to-buy has no button to press.
2. **No/near-zero customer reviews** — a premium-priced accessory with no social proof forces the shopper to take your word on quality, and most won't.
3. **Warranty stated three different ways (1yr / 1.0-yr / 2yr)** — inconsistent trust claims on the same purchase journey read as carelessness and erode confidence at the moment of decision.
4. **Weak, generic hero UVP + auto-rotating carousel** — you never land a single sharp reason to buy before the message rotates away, wasting the 3-second window.
5. **"Trusted since 1994" heritage is hidden** — your strongest differentiator against no-name competitors isn't working because it's not above the fold.
6. **Feature-led copy instead of benefit-led** — shoppers have to translate specs into "what this does for me" themselves, and hesitation grows with every unanswered "so what?"
7. **Express "Buy with Shop" competes with the primary CTA** — a second, equally loud button splits attention and can pull users out before they've absorbed the offer.
8. **Compliance-logo strip masquerading as trust** — nine FC/CE/RoHS-type icons add visual noise and zero persuasion where real trust signals (reviews, guarantee) should be.
9. **Still on the myshopify.com domain** — no branded custom domain undercuts credibility for a premium brand and hurts SEO/brand recall (flagged in the admin audit; still open).
10. **Spec-dump product subtitles** — the highest-value line of PDP text is a comma-list of ports and abbreviations rather than a benefit hook.
11. **Missing "what's in the box" on individual products** — an unanswered basic question ("is the cable included?") is enough to stall a cart.
12. **No delivery-date expectation on PDP** — "free over $90" tells cost but not *when it arrives*, and Amazon has made delivery date a pre-commit expectation.
13. **Nav hides categories behind "Shop"** — every category journey costs an extra click, and low-intent "Resources/Compare" occupy prime nav real estate.
14. **No urgency or savings framing** — most products show a single price with no compare-at, no "save $X," no low-stock cue, so there's no reason to buy *now* vs. later.
15. **Mandatory email gate before you can chat** — the Tidio pre-chat form requires an email before a shopper can ask a pre-sale question, adding friction exactly when they're trying to give you money.

*Already resolved this week (were previously top-5 severity): blurry secondary product images, buy-box taking ~4s to appear, Add-to-Cart hard-redirecting to /cart instead of opening the drawer, chat widget that wouldn't open, $0-priced live variants, bundles with no SKU/weight, and the $70/$90/$100 free-shipping contradiction.*

---

## 5. Immediate today-only action plan (high impact, low effort)

**Do these before you drive any traffic:**

1. **Reconcile the warranty everywhere to one number.** The `warranty_years` metafield already holds the right value per product; make the collection chip, PDP badge, and cart order-summary all read from it (or hard-set them to match). One theme fix + a couple of static strings. *Highest trust ROI for the least effort — I can do this now.*
2. **Add a sticky mobile Add-to-Cart bar to the PDP.** Biggest mobile-conversion lever on the site; it's a contained theme change. *I can build this now.*
3. **Stop the hero from auto-rotating and set one static UVP slide** that leads with heritage + benefit — e.g. "USB-C gear that just works. Trusted since 1994." Static hero = the message actually gets read.
4. **Seed reviews.** Import or request even a small set of verified Judge.me reviews on your hero products so PDPs aren't sitting at zero on launch day.
5. **Trim the 9-icon feature strip to the 3–4 that sell** (e.g. 100W PD, 4K/8K, warranty, reversible) and push it below the fold. Removes mobile clutter in minutes.
6. **Surface real categories in the nav** (Hubs, Chargers, Cables, Adapters) so shoppers reach product one click sooner.
7. **Visually subordinate "Buy with Shop"** to the primary Add-to-Cart (smaller / secondary styling) so the main CTA wins the eye.
8. **Add a one-line delivery expectation to the PDP** near the price ("Ships in 1–2 business days · Free over $90") using your own stated shipping policy.
9. **Drop the mandatory email gate on the chat** (make email optional) so pre-sale questions flow without friction.
10. **Connect the custom domain** (already on your admin punch list) — brand credibility + SEO in one move.

**Fastest wins if you only have an hour:** #1 (warranty), #2 (sticky ATC), #5 (icon trim), #7 (subordinate express button). Those four are low-effort, high-impact, and three of them I can implement in the theme right now on your say-so.
