# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 ListFlowable, ListItem, HRFlowable, PageBreak)
from reportlab.platypus.tableofcontents import TableOfContents

NAVY = colors.HexColor("#1F3864"); BLUE = colors.HexColor("#2E74B5")
GREY = colors.HexColor("#595959"); HEADBG = colors.HexColor("#1F3864")
LTGREY = colors.HexColor("#EDEDED"); AMBER = colors.HexColor("#FCE4D6"); GREEN = colors.HexColor("#E2EFDA")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("H1c", parent=styles["Heading1"], textColor=NAVY, fontSize=15, spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle("H2c", parent=styles["Heading2"], textColor=BLUE, fontSize=11.5, spaceBefore=8, spaceAfter=3))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=9.5, leading=13.5, spaceAfter=6))
styles.add(ParagraphStyle("Small", parent=styles["Normal"], fontSize=8.5, leading=12, textColor=GREY))
styles.add(ParagraphStyle("Cell", parent=styles["Normal"], fontSize=8.5, leading=11.5))
styles.add(ParagraphStyle("CellH", parent=styles["Normal"], fontSize=8.5, leading=11.5, textColor=colors.white, fontName="Helvetica-Bold"))
styles.add(ParagraphStyle("TitleBig", parent=styles["Title"], textColor=NAVY, fontSize=26, spaceAfter=2, alignment=1))
styles.add(ParagraphStyle("SubC", parent=styles["Normal"], textColor=BLUE, fontSize=14, fontName="Helvetica-Bold", spaceAfter=8, alignment=1))

def P(t, s="Body"): return Paragraph(t, styles[s])
def bl(items, s="Body"):
    return ListFlowable([ListItem(Paragraph(i, styles[s]), value="•") for i in items],
                        bulletType="bullet", start="•", leftIndent=14, spaceAfter=6)
def tbl(headers, rows, widths, shade=None):
    data=[[Paragraph(h, styles["CellH"]) for h in headers]]
    for r in rows: data.append([Paragraph(c, styles["Cell"]) for c in r])
    t=Table(data, colWidths=widths, repeatRows=1)
    ts=[("BACKGROUND",(0,0),(-1,0),HEADBG),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#B7B7B7")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6)]
    for i in range(1,len(data)):
        if i%2==0: ts.append(("BACKGROUND",(0,i),(-1,i),LTGREY))
    t.setStyle(TableStyle(ts)); return t

S=[]
# Cover
S.append(Spacer(1, 1.6*inch))
S.append(P("EZQUEST", "TitleBig"))
S.append(P("Website Documentation &amp; Handover Guide", "SubC"))
S.append(Spacer(1, 0.2*inch))
S.append(HRFlowable(width="60%", thickness=1.2, color=BLUE, hAlign="CENTER"))
S.append(Spacer(1, 0.3*inch))
for line in ["Custom Shopify storefront — complete build reference",
             "Prepared by Emanuel J. Rad",
             "Site: ezquest-4.myshopify.com  (development URL)",
             "Catalog: 75 products · 15 collections · 25 pages"]:
    S.append(Paragraph("<para align=center>%s</para>" % line, styles["Body"]))
S.append(PageBreak())

# 1 Overview
S.append(P("1. Overview", "H1c"))
S.append(P("The EZQuest website is a custom-built Shopify Online Store 2.0 storefront for EZQuest Inc., a premium digital-life accessories brand (USB-C hubs, docks, chargers, cables, adapters, and card readers). The build delivers a full commerce experience, a technical Support Center, advanced product pages, and a content system EZQuest can maintain without a developer."))
S.append(P("Platform &amp; stack", "H2c"))
S.append(bl([
 "<b>Platform:</b> Shopify (Online Store 2.0 — JSON templates, sections &amp; blocks).",
 "<b>Theme:</b> Custom theme, coded from scratch, version-controlled on GitHub (repo EmanuelRad169/EZQuest) and auto-deployed to the live theme.",
 "<b>Languages:</b> Liquid templating, HTML/CSS, JavaScript.",
 "<b>Content model:</b> Shopify metaobjects &amp; metafields (structured, merchant-editable).",
 "<b>Design system:</b> shared CSS tokens (colors, radius, spacing) and reusable sections/snippets.",
]))

# 2 IA / sitemap
S.append(P("2. Information Architecture &amp; Sitemap", "H1c"))
S.append(P("Primary navigation resolves to five menus plus a utility bar (Search, Account, Wishlist, Compare, Language, Cart). Footer carries shop, support, company, and legal groups. Full detail is in the companion Phase 1 document."))
S.append(tbl(["Menu","Contents"],[
 ["Shop","Hubs, Adapters, Pro Series; Cables (USB-C, HDMI, DisplayPort, Mini DisplayPort, Audio); Chargers (Wall, Car); Card Readers; Enclosures; Bundles"],
 ["Support","Support Center, Downloads, Manuals, Firmware, User Guides, Compatibility, FAQ, Troubleshooting, Warranty, Product Registration, Ticket Submission, Contact"],
 ["Resources","Blog / Articles, Help Me Choose, Compatibility"],
 ["Compare","Side-by-side product comparison (up to 3)"],
 ["About","About EZQuest, Our Story, Where to Buy, Become a Reseller"],
],[1.0*inch,5.9*inch]))

# 3 Templates
S.append(P("3. Page Templates", "H1c"))
S.append(tbl(["Template","Purpose","Key blocks"],[
 ["Home","Brand entry &amp; merchandising","Hero, featured collections, feature banners, confidence grid, testimonials, press, email signup"],
 ["Collection (PLP)","Browse a category","Collection hero/slider, sort, multi-attribute filters, product cards, pagination"],
 ["Product (PDP)","Convert on a product","Gallery w/ variant image sync, variant pills, buy box + trust signals, Overview / Specifications / Compatibility tabs, FAQ, related products, badges"],
 ["Support Center","Help hub","Landing + repositories, CTA rails, search"],
 ["Blog / Article","Content &amp; SEO","Article list, article template, categories/tags"],
 ["Static / Info","Company &amp; policy","About, Our Story, Reseller, Where to Buy, Warranty, Shipping, policies, Registration"],
],[1.05*inch,1.7*inch,4.15*inch]))

# 4 Commerce features
S.append(P("4. Core Commerce Features", "H1c"))
S.append(bl([
 "<b>Product Listing Pages</b> with sorting and multiple attribute filters.",
 "<b>Advanced PDP</b>: image gallery that swaps with color/variant, styled variant pills (Size/Color/Length), tabbed Overview / Specifications / Compatibility, product &amp; sitewide FAQ, technology badges (USB4, Thunderbolt, GaN, Dual 4K, 100W+), and Pre-Order support.",
 "<b>Cart drawer</b> with trust strip, plus a full cart page.",
 "<b>Search</b> with suggested searches, quick links, and a results template.",
 "<b>Reusable components</b> and a consistent styling system across all templates.",
]))

# 5 Support center
S.append(P("5. Support Center", "H1c"))
S.append(P("A dedicated technical support ecosystem, each section backed by a structured content repository EZQuest can update."))
S.append(bl([
 "Manuals (searchable library with downloads), Downloads, Firmware, User Guides.",
 "Interactive Compatibility checker (search your device / browse by platform).",
 "FAQ (sitewide + per-product) and Troubleshooting.",
 "Warranty &amp; Returns, Shipping &amp; Returns, Product Registration.",
 "Ticket Submission form and Contact Support; “Help Me Choose” guided finder.",
]))

# 6 Integrations
S.append(P("6. Advanced Features &amp; Integrations", "H1c"))
S.append(tbl(["Feature","Notes"],[
 ["Wishlist","Wishlist page + header control."],
 ["Compare","Side-by-side comparison of up to 3 products."],
 ["Bundles / related","Related-product &amp; bundle upsell module on PDP."],
 ["Pre-Order","Tag-driven; shows badge and keeps the buy button active."],
 ["Live Chat","Chat solution (Tidio) configured; enable at launch."],
 ["Shoppable video","Video content present on site."],
 ["Product Registration","Warranty-registration page storing entries in Shopify (metaobject)."],
 ["Newsletter","Opt-in capture (consent + timestamp)."],
],[1.4*inch,5.5*inch]))

# 7 Content model
S.append(P("7. Content Model (how content is managed)", "H1c"))
S.append(P("Product and support content is stored in Shopify <b>metaobjects</b> and <b>metafields</b> — structured records EZQuest edits in the admin, no code required. The theme reads these and renders them automatically."))
S.append(tbl(["Content type","Powers"],[
 ["EZQuest Spec Row / custom.spec_table","Product Specifications tab (sourced from the Products Master sheet)"],
 ["EZQuest Manual","Manuals library"],
 ["EZQuest Download","Downloads section"],
 ["EZQuest Firmware","Firmware section"],
 ["EZQuest User Guide","User Guides section"],
 ["EZQuest Compatibility Entry","Compatibility checker"],
 ["EZQuest Comparison Group","Compare tool groupings"],
 ["EZQuest FAQ Item","FAQ (site + product)"],
 ["EZQuest Troubleshooting Item","Troubleshooting"],
 ["EZQuest Use Case / Decision Guide Entry","Help Me Choose"],
 ["EZQuest Product Registration","Warranty registration submissions"],
],[2.6*inch,4.3*inch]))

# 8 Product data
S.append(P("8. Product Data &amp; Specifications", "H1c"))
S.append(P("Product specifications are driven from EZQuest’s “Products Master” Google Sheet (SPECS tab), the single source of truth. Each product carries a spec-table field populated from that sheet, so the Specifications tab always reflects approved data. To update specs: edit the sheet, then re-sync. 64 SKUs are reconciled; any SKU left blank in the sheet (e.g., X40225) simply needs its rows filled."))

# 9 SEO/perf
S.append(P("9. SEO &amp; Performance", "H1c"))
S.append(bl([
 "Technical SEO: titles, meta descriptions, canonical tags, and JSON-LD structured data.",
 "Semantic headings and image alt text across templates.",
 "Performance: optimized images and code; lazy-loading where appropriate.",
 "A formal SEO + speed audit summary is delivered as part of Phase 5 closeout.",
]))

# 10 QA / accessibility
S.append(P("10. Quality Assurance &amp; Accessibility", "H1c"))
S.append(bl([
 "Responsive QA across mobile, tablet, and desktop breakpoints.",
 "Cross-browser checks (Chrome, Safari, Firefox).",
 "Accessibility patterns: ARIA on navigation, focus management, keyboard support, focus-visible states.",
 "Cart/checkout functional; end-to-end test-order evidence provided at pre-launch.",
]))

# 11 Admin how-to
S.append(P("11. Managing the Site (admin how-to)", "H1c"))
S.append(tbl(["Task","Where / how"],[
 ["Add or edit a product","Shopify admin → Products. Assign to collections; set variants, images, price, tags."],
 ["Update specifications","Edit the Products Master sheet → re-sync the spec-table field."],
 ["Add a manual / download / firmware","Admin → Content → Metaobjects → the matching type; link the file."],
 ["Edit a page’s content","Admin → Online Store → Themes → Customize (for section settings) or Pages (for body)."],
 ["Reorder products in a collection","Admin → Collections → set sort to Manual → drag to order."],
 ["Update navigation","Admin → Online Store → Navigation (and header settings in Customize)."],
 ["View registrations","Admin → Content → Metaobjects → EZQuest Product Registration."],
],[1.9*inch,5.0*inch]))
S.append(P("<b>Important:</b> page-template settings live in the Theme Editor, not in GitHub. Section/CSS/JS changes deploy from GitHub; JSON template settings are edited in Customize.", "Small"))

# 12 Deployment
S.append(P("12. Hosting, Deployment &amp; Launch", "H1c"))
S.append(bl([
 "<b>Hosting:</b> Shopify (fully managed; CDN, SSL, PCI handled by Shopify).",
 "<b>Deployment:</b> theme code is version-controlled on GitHub and auto-syncs to the live theme on push.",
 "<b>Launch steps (pending):</b> connect production domain, finalize SSL, deploy to production, then a 30-day stabilization period.",
]))
S.append(P("Pre-launch checklist", "H2c"))
S.append(bl([
 "Confirm production domain &amp; DNS; verify SSL.",
 "Run end-to-end test orders (payment, shipping, tax, discounts, notifications).",
 "Final cross-device/browser pass; confirm analytics.",
 "Populate remaining Support files (firmware, guides, downloads).",
 "Publish and begin stabilization window.",
]))

S.append(Spacer(1,8))
S.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#B7B7B7"), spaceAfter=6))
S.append(P("EZQuest website documentation — as-built from the live development site. Companion documents: Phase 1 Sitemap &amp; IA; Deliverables &amp; Evidence Response.", "Small"))

doc=SimpleDocTemplate("/sessions/keen-modest-hypatia/mnt/outputs/EZQuest_Website_Documentation.pdf",
    pagesize=letter, topMargin=0.7*inch, bottomMargin=0.7*inch, leftMargin=0.8*inch, rightMargin=0.8*inch,
    title="EZQuest Website Documentation & Handover Guide", author="Emanuel J. Rad")
doc.build(S)
print("written")
