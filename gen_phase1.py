# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 ListFlowable, ListItem, HRFlowable)

NAVY = colors.HexColor("#1F3864")
BLUE = colors.HexColor("#2E74B5")
GREY = colors.HexColor("#595959")
HEADBG = colors.HexColor("#1F3864")
LTGREY = colors.HexColor("#EDEDED")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("H1c", parent=styles["Heading1"], textColor=NAVY, fontSize=15, spaceBefore=14, spaceAfter=6))
styles.add(ParagraphStyle("H2c", parent=styles["Heading2"], textColor=BLUE, fontSize=12, spaceBefore=10, spaceAfter=4))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=9.5, leading=13.5, spaceAfter=6))
styles.add(ParagraphStyle("Small", parent=styles["Normal"], fontSize=8.5, leading=12, textColor=GREY))
styles.add(ParagraphStyle("Cell", parent=styles["Normal"], fontSize=8.5, leading=11.5))
styles.add(ParagraphStyle("CellH", parent=styles["Normal"], fontSize=8.5, leading=11.5, textColor=colors.white, fontName="Helvetica-Bold"))
styles.add(ParagraphStyle("TitleBig", parent=styles["Title"], textColor=NAVY, fontSize=22, spaceAfter=2, alignment=0))
styles.add(ParagraphStyle("Sub", parent=styles["Normal"], textColor=BLUE, fontSize=13, fontName="Helvetica-Bold", spaceAfter=8))

def P(t, s="Body"): return Paragraph(t, styles[s])

def bullets(items, s="Body"):
    return ListFlowable([ListItem(Paragraph(i, styles[s]), value="•") for i in items],
                        bulletType="bullet", start="•", leftIndent=14, spaceAfter=6)

def tbl(headers, rows, widths):
    data = [[Paragraph(h, "CellH") if False else Paragraph(h, styles["CellH"]) for h in headers]]
    for r in rows:
        data.append([Paragraph(c, styles["Cell"]) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    ts = [("BACKGROUND",(0,0),(-1,0),HEADBG),
          ("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#B7B7B7")),
          ("VALIGN",(0,0),(-1,-1),"TOP"),
          ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
          ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6)]
    for i in range(1,len(data)):
        if i % 2 == 0: ts.append(("BACKGROUND",(0,i),(-1,i),LTGREY))
    t.setStyle(TableStyle(ts))
    return t

story = []
story.append(P("EZQUEST NEW WEBSITE", "TitleBig"))
story.append(P("Phase 1 — Sitemap, Information Architecture &amp; User Flows", "Sub"))
story.append(HRFlowable(width="100%", thickness=1.2, color=BLUE, spaceAfter=8))
story.append(P("<b>Work order:</b> Shopify Development Proposal — Professional Package (Phase 1 deliverable)"))
story.append(P("<b>Prepared by:</b> Emanuel J. Rad &nbsp;&nbsp; <b>Site:</b> ezquest-4.myshopify.com &nbsp;&nbsp; <b>As-built reference</b>"))
story.append(P("This document records the delivered Phase 1 information architecture — the sitemap, template inventory, navigation model, and primary user flows — as realized in the built site. It serves as the Phase 1 evidence artifact for the agreement checklist.", "Small"))

# Sitemap
story.append(P("1. Sitemap (page hierarchy)", "H1c"))
story.append(P("Primary navigation resolves to five menus plus a utility bar (Search, Account, Wishlist, Compare, Language, Cart).", "Body"))

story.append(P("Shop (commerce)", "H2c"))
story.append(bullets([
 "Hubs &nbsp;•&nbsp; Adapters &nbsp;•&nbsp; Pro Series (hubs &amp; adapters)",
 "Cables → USB-C Cables, HDMI Cables &amp; Adapters, DisplayPort Cables &amp; Adapters, Mini DisplayPort Cables, Audio Cables",
 "Chargers → Wall Chargers, Car Chargers",
 "Card Readers (USB-C Card Readers) &nbsp;•&nbsp; Enclosures (USB-C Enclosures) &nbsp;•&nbsp; Bundles",
 "Each collection → Product Listing Page (PLP) → Product Detail Page (PDP)",
]))

story.append(P("Support (Support Center)", "H2c"))
story.append(bullets([
 "Support Center (landing) → Downloads, Manuals, Firmware, User Guides",
 "Compatibility checker &nbsp;•&nbsp; FAQ &nbsp;•&nbsp; Troubleshooting",
 "Warranty &amp; Returns &nbsp;•&nbsp; Shipping &amp; Returns &nbsp;•&nbsp; Product Registration",
 "Ticket Submission &nbsp;•&nbsp; Contact Support",
]))

story.append(P("Resources", "H2c"))
story.append(bullets([
 "Blog / Articles (Resources) &nbsp;•&nbsp; Help Me Choose &nbsp;•&nbsp; Compatibility",
]))

story.append(P("Compare", "H2c"))
story.append(bullets(["Product comparison tool (side-by-side, up to 3 products)"]))

story.append(P("About / Company", "H2c"))
story.append(bullets([
 "About EZQuest &nbsp;•&nbsp; Our Story (30 years) &nbsp;•&nbsp; Where to Buy &nbsp;•&nbsp; Become a Reseller",
]))

story.append(P("Account &amp; Utility", "H2c"))
story.append(bullets([
 "Customer account (login, register, order history, addresses) &nbsp;•&nbsp; Cart / Cart drawer &nbsp;•&nbsp; Search &amp; results &nbsp;•&nbsp; Wishlist",
]))

story.append(P("Legal / Policy", "H2c"))
story.append(bullets([
 "Warranty &nbsp;•&nbsp; Shipping &amp; Returns &nbsp;•&nbsp; Cookie Policy &nbsp;•&nbsp; Your Privacy Choices",
]))

# Template inventory
story.append(P("2. Template inventory (wireframe basis)", "H1c"))
story.append(tbl(
 ["Template", "Purpose", "Key structural blocks"],
 [
  ["Home", "Brand entry &amp; merchandising", "Hero, featured collections, feature banners, confidence grid, testimonials, press, email signup"],
  ["Collection (PLP)", "Browse &amp; filter a category", "Collection hero, sort, multi-attribute filters, product grid/cards, pagination"],
  ["Product (PDP)", "Convert on a single product", "Gallery, variant pills, buy box + signals, Overview / Specifications / Compatibility tabs, FAQ, related products"],
  ["Support Center", "Help hub", "Landing + repositories (Downloads, Manuals, Firmware, Guides), CTA rails"],
  ["Blog / Article", "Content &amp; SEO", "Article list, article template, categories/tags"],
  ["Static / Info", "Company &amp; policy", "About, Our Story, Reseller, Where to Buy, Warranty, Shipping, policies"],
 ],
 [1.1*inch, 1.9*inch, 3.9*inch]))

# Navigation & flows
story.append(P("3. Navigation model &amp; user flows", "H1c"))
story.append(P("Global header (sticky): logo, five-menu mega-navigation, and utility icons. Mobile: hamburger drawer mirrors desktop menus, plus language toggle and account. Footer: shop, support, company, and legal link groups.", "Body"))
story.append(P("Primary user flows", "H2c"))
story.append(tbl(
 ["Flow", "Path"],
 [
  ["Browse → Buy", "Home → Shop menu → Collection (PLP) → filter/sort → PDP → select variant → Add to cart → Cart drawer → Checkout"],
  ["Search → Buy", "Search → results (suggested + quick links) → PDP → Add to cart → Checkout"],
  ["Compare → Buy", "Compare menu → add up to 3 products → side-by-side → PDP → Add to cart"],
  ["Get support", "Support menu → Support Center → Compatibility / FAQ / Troubleshooting / Manuals → Ticket Submission or Contact"],
  ["Find the right product", "Resources → Help Me Choose → guided selection → PDP"],
  ["Own a product", "PDP / order → Product Registration → warranty on file; Support for downloads &amp; guides"],
 ],
 [1.5*inch, 5.4*inch]))

story.append(Spacer(1, 8))
story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#B7B7B7"), spaceAfter=6))
story.append(P("As-built Phase 1 reference generated from the live EZQuest development site. Low-fidelity wireframes and the click-through prototype that preceded this build are available on request.", "Small"))

doc = SimpleDocTemplate("/sessions/keen-modest-hypatia/mnt/outputs/EZQuest_Phase1_Sitemap_IA.pdf",
                        pagesize=letter, topMargin=0.7*inch, bottomMargin=0.7*inch,
                        leftMargin=0.75*inch, rightMargin=0.75*inch,
                        title="EZQuest Phase 1 — Sitemap & Information Architecture",
                        author="Emanuel J. Rad")
doc.build(story)
print("written")
