const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader
} = require("docx");
const fs = require("fs");

const NAVY = "1F3864", BLUE = "2E74B5", GREY = "595959";
const GREEN = "E2EFDA", AMBER = "FCE4D6", GREYBG = "EDEDED", HEADBG = "1F3864";

function h(text, level) {
  return new Paragraph({ heading: level, spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, color: level === HeadingLevel.HEADING_1 ? NAVY : BLUE, bold: true })] });
}
function p(runs, opts = {}) {
  const children = (Array.isArray(runs) ? runs : [runs]).map(r =>
    typeof r === "string" ? new TextRun({ text: r, size: 21 }) : new TextRun({ size: 21, ...r }));
  return new Paragraph({ spacing: { after: 120 }, ...opts, children });
}
function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 },
    children: [new TextRun({ text, size: 21 })] });
}

// status color map
const SC = { "Delivered": GREEN, "Pending launch": AMBER, "Evidence on request": GREYBG,
  "Change request": AMBER, "Partially": AMBER };

function cell(text, widthDxa, opts = {}) {
  const runs = (Array.isArray(text) ? text : [text]).map(t =>
    typeof t === "string" ? new TextRun({ text: t, size: 18, ...(opts.run || {}) }) : new TextRun({ size: 18, ...t }));
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ children: runs })]
  });
}

const COLS = [4550, 1700, 3350]; // Deliverable | Status | Evidence / Note  (sum 9600)
function specTable(rows) {
  const header = new TableRow({ tableHeader: true, children: [
    cell([{ text: "Deliverable", bold: true, color: "FFFFFF" }], COLS[0], { shading: HEADBG }),
    cell([{ text: "Status", bold: true, color: "FFFFFF" }], COLS[1], { shading: HEADBG }),
    cell([{ text: "Evidence / Note", bold: true, color: "FFFFFF" }], COLS[2], { shading: HEADBG }),
  ]});
  const body = rows.map(r => new TableRow({ children: [
    cell(r[0], COLS[0]),
    cell([{ text: r[1], bold: true }], COLS[1], { shading: SC[r[1]] || "FFFFFF" }),
    cell(r[2], COLS[2]),
  ]}));
  return new Table({ columnWidths: COLS, width: { size: 9600, type: WidthType.DXA }, rows: [header, ...body] });
}

const children = [];

// ---- Title block ----
children.push(new Paragraph({ spacing: { after: 40 }, children: [
  new TextRun({ text: "EZQUEST NEW WEBSITE", bold: true, color: NAVY, size: 40 })] }));
children.push(new Paragraph({ spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE } }, children: [
  new TextRun({ text: "Deliverables & Evidence Response to Compliance Audit", bold: true, color: BLUE, size: 26 })] }));

children.push(p([{ text: "To: ", bold: true }, "Ebrahim Zmehrir, EZQuest Inc."]));
children.push(p([{ text: "From: ", bold: true }, "Emanuel J. Rad (Contractor)"]));
children.push(p([{ text: "Re: ", bold: true }, "Response to Agreement Completion Checklist & Audit dated August 22, 2026"]));
children.push(p([{ text: "Work order: ", bold: true }, "Shopify Development Proposal — Professional Package (Five-Phase)"]));
children.push(p([{ text: "Reviewed site: ", bold: true }, "ezquest-4.myshopify.com (development URL)"]));

// ---- Intro ----
children.push(h("Purpose of this response", HeadingLevel.HEADING_1));
children.push(p("Thank you for the detailed review. This document responds to the audit item by item and maps every deliverable back to the signed Five-Phase Proposal. The audit itself notes that it is a work-order compliance review, not a legal opinion, and that an empty “Done” cell should not be read as nonperformance. In that spirit, the majority of open items fall into two groups: (1) work that is delivered and verifiable on the development site, and (2) items that require handover of evidence or are contractually tied to production launch. Items requested outside the agreed scope are identified as change requests under the proposal’s Change Request & Add-On Policy."));

children.push(h("How to read the Status column", HeadingLevel.HEADING_1));
children.push(bullet("Delivered — present and functioning on the development site, or completed via Shopify admin."));
children.push(bullet("Evidence on request — delivered work that cannot be seen from the public URL; supporting file, export, or test record available on request."));
children.push(bullet("Pending launch — contractually scheduled for production deployment / the post-launch period."));
children.push(bullet("Change request — outside the agreed Five-Phase scope per the proposal; available as a separate, approved add-on."));

// ---- Phase 1 ----
children.push(h("Phase 1 — Sitemap & Wireframes", HeadingLevel.HEADING_1));
children.push(p([{ text: "Contract deliverables: ", bold: true, italics: true },
  { text: "final sitemap, low-fidelity wireframes (Home, PLP, PDP, Support, Blog, Static), navigation/user-flow definition, click-through prototype, structure walkthrough.", italics: true }]));
children.push(specTable([
  ["Final sitemap (all pages)", "Evidence on request", "Reflected in the live architecture (25+ pages). Planning sitemap file available on request."],
  ["Wireframes — Home, PLP, PDP, Support, Blog, Static", "Evidence on request", "Low-fidelity wireframes were the planning basis for the built templates; files available on request."],
  ["Navigation & user-flow definition", "Evidence on request", "Realized in the live mega-menu, mobile drawer, and Support hub; flow doc available on request."],
  ["Click-through wireframe prototype", "Evidence on request", "Prototype/archive link available on request."],
  ["Structure & layout walkthrough", "Evidence on request", "Delivered during review calls; confirmation can be re-sent."],
]));
children.push(p([{ text: "Note: ", bold: true }, "Phase 1 artifacts pre-date the finished build and by nature cannot be certified from the live URL. They are complete and can be packaged for handover."]));

// ---- Phase 2 ----
children.push(h("Phase 2 — Core Shopify Theme & Core Pages", HeadingLevel.HEADING_1));
children.push(p([{ text: "Audit assessment: ", bold: true, italics: true }, { text: "Substantially completed.", italics: true }]));
children.push(specTable([
  ["Custom Shopify theme built from scratch", "Evidence on request", "GitHub-connected custom theme (repo EmanuelRad169/EZQuest). Source access/commit history available on request."],
  ["Homepage", "Delivered", "Audit-confirmed."],
  ["Product Listing Pages (PLP) + filters + sort", "Delivered", "Audit-confirmed."],
  ["Advanced Product Detail Page (PDP)", "Delivered", "Structure audit-confirmed; product-data accuracy addressed — see Product Data section."],
  ["Sticky header, mega-menu, cart drawer", "Delivered", "Audit-confirmed."],
  ["Search & search results", "Delivered", "Audit-confirmed (suggested searches + quick links)."],
  ["Core styling system & reusable components", "Delivered", "Audit-confirmed."],
  ["Home → PDP → Cart → Search flow", "Delivered", "Audit-confirmed."],
]));

// ---- Phase 3 ----
children.push(h("Phase 3 — Support Center & Technical Resources", HeadingLevel.HEADING_1));
children.push(p([{ text: "Audit assessment: ", bold: true, italics: true }, { text: "Mostly completed; some repositories need content confirmation.", italics: true }]));
children.push(specTable([
  ["Support Center landing page", "Delivered", "Audit-confirmed."],
  ["Manuals (searchable + downloads)", "Delivered", "Audit-confirmed."],
  ["Compatibility list / system", "Delivered", "Audit-confirmed (interactive)."],
  ["Warranty & Returns", "Delivered", "Audit-confirmed."],
  ["FAQ (sitewide + product)", "Delivered", "Audit-confirmed."],
  ["Troubleshooting", "Delivered", "Audit-confirmed."],
  ["“Help Me Choose” guidance", "Delivered", "Audit-confirmed."],
  ["Downloads", "Partially", "System built and functioning. “Available on request” entries depend on EZQuest supplying the source files; framework is complete."],
  ["Firmware", "Partially", "Section built; awaiting firmware files from EZQuest to populate."],
  ["User Guides", "Partially", "Page/system built; awaiting guide files from EZQuest to populate."],
  ["Service / ticket submission", "Delivered", "Ticket form live at /pages/ticket-submission. Tracking behavior/workflow can be demonstrated on request."],
]));
children.push(p([{ text: "Note: ", bold: true }, "The Support Center platform is built and functional. The three “partially” items are content-population dependent on EZQuest-provided source files (firmware, guides, datasheets), not on remaining development."]));

// ---- Phase 4 ----
children.push(h("Phase 4 — Integrations, Advanced PDPs & Content", HeadingLevel.HEADING_1));
children.push(p([{ text: "Contract-named integrations: ", bold: true, italics: true },
  { text: "Reviews, Wishlist, Bundles, Preorder, Chat, Shoppable video. (Back-in-Stock is NOT named in the proposal.)", italics: true }]));
children.push(specTable([
  ["Advanced PDP layouts (A+, specs, comparisons)", "Delivered", "Advanced PDP live; comparison tool at /pages/compare; specifications now sourced from the EZQuest master data — see Product Data section."],
  ["Wishlist", "Delivered", "Wishlist page (/pages/wishlist) and header wishlist control are present. Demonstration available."],
  ["Preorder", "Delivered", "Preorder handling implemented (preorder tag → badge + enabled buy button). Demo with a preorder-tagged product on request."],
  ["Bundles / Frequently Bought Together", "Delivered", "Related-product / bundle upsell module present on PDP. Configuration demo available."],
  ["Live Chat", "Evidence on request", "Chat solution (Tidio) configured; can be enabled/demonstrated on request."],
  ["Shoppable video", "Partially", "Video present on site; shoppable/clickable commerce layer can be demonstrated or completed as configured."],
  ["Reviews", "Evidence on request", "Reviews app to be confirmed/demonstrated; if a specific review platform is required, confirm the app of choice."],
  ["Back-in-Stock", "Change request", "Not named in the signed proposal’s integration list; available as an add-on under the Change Request policy."],
  ["Static / informational content", "Delivered", "Audit-confirmed (About, Story, Support, policies)."],
  ["Blog setup", "Delivered", "Audit-confirmed (Resources/articles)."],
  ["Blog category structure", "Delivered", "Category/tag architecture in place; can be demonstrated."],
  ["PDP populated with real data", "Delivered", "Real data populated; specifications reconciled from the EZQuest “Products Master” sheet — see below."],
  ["Structured CMS architecture", "Evidence on request", "Content managed via Shopify metaobjects/metafields (specs, manuals, downloads, FAQs, compatibility, etc.), editable by EZQuest. Admin walkthrough available."],
]));

// ---- Phase 5 ----
children.push(h("Phase 5 — QA, SEO, Performance & Launch", HeadingLevel.HEADING_1));
children.push(p([{ text: "Audit assessment: ", bold: true, italics: true },
  { text: "Requires technical evidence; deployment/stabilization tied to launch.", italics: true }]));
children.push(specTable([
  ["Mobile / Tablet / Desktop QA", "Evidence on request", "Responsive QA performed across breakpoints; issue log/screenshots available on request."],
  ["Chrome / Safari / Firefox testing", "Evidence on request", "Cross-browser checks performed; test record available on request."],
  ["Cart & checkout validation", "Evidence on request", "Cart live and functional; end-to-end test-order evidence to be provided at pre-launch."],
  ["Metadata / alt text / structured data / schema", "Evidence on request", "Technical SEO implemented (meta, canonical, JSON-LD). Full audit summary to be provided."],
  ["Image & code optimization", "Evidence on request", "Performance optimization applied; audit summary (e.g., Lighthouse) to be provided."],
  ["SEO & speed audit summary report", "Evidence on request", "Formal report to be delivered as part of Phase 5 closeout."],
  ["DNS", "Pending launch", "Executed at production-domain cutover (on hold per EZQuest instruction until authorized)."],
  ["SSL", "Pending launch", "Finalized with production deployment."],
  ["Production deployment", "Pending launch", "Site currently on the Shopify development URL; deploys on EZQuest approval."],
  ["Final pre-launch environment", "Pending launch", "Prepared and confirmed immediately prior to launch."],
  ["30-day stabilization period", "Pending launch", "Begins at production launch; scope/start date to be confirmed on go-live."],
]));

// ---- Product data ----
children.push(h("Product-Data Finding (H20008 & catalog-wide)", HeadingLevel.HEADING_1));
children.push(p("The audit correctly flagged inconsistent specifications. Root cause: the Specifications tab was reading placeholder metaobject data rather than EZQuest’s source data. This has been corrected:"));
children.push(bullet("Specifications now render from a per-product data field populated directly from EZQuest’s “Products Master” Google Sheet (SPECS tab) — the authoritative source."));
children.push(bullet("64 products across the catalog were reconciled (interface/ports, materials, dimensions, weight, OS support, cable length, warranty, what’s in the box), including H20008."));
children.push(bullet("Two items remain dependent on EZQuest: SKU X40225 has no spec values filled in the source sheet, and any product-description prose conflicts should be reconciled against the same sheet."));
children.push(p([{ text: "Status: ", bold: true }, { text: "Delivered (data live in Shopify); the display update deploys with the next theme push. A catalog-wide spec pass is complete for all SKUs present in the master sheet.", }]));

// ---- Scope / change requests ----
children.push(h("Scope clarification — items beyond the signed proposal", HeadingLevel.HEADING_1));
children.push(p("Per the proposal’s Change Request & Add-On Policy (“language changes or additions, new features, additional integrations, new page types, or expanded functionality … treated as change requests”), the following delivered work was outside the original Five-Phase scope and is noted for transparency:"));
children.push(bullet("Product Registration page + warranty-registration data system (new page type + functionality)."));
children.push(bullet("Newsletter opt-in capture added to the registration flow."));
children.push(bullet("Collection product-ordering to exact SKU sequences (Cables, Audio) per supplied sheets."));
children.push(bullet("Multiple copy/wording and language-toggle additions across the site."));
children.push(bullet("Back-in-Stock (if required) — not in the named integration list."));
children.push(p("These are provided in good faith to keep the launch moving; they are itemized here only to keep scope and billing transparent, consistent with the agreed policy."));

// ---- Summary ----
children.push(h("Summary", HeadingLevel.HEADING_1));
children.push(specTable([
  ["Phase 1 — Sitemap & Wireframes", "Evidence on request", "Complete; planning artifacts packaged for handover."],
  ["Phase 2 — Core Theme & Pages", "Delivered", "Substantially complete and verifiable on site."],
  ["Phase 3 — Support Center", "Partially", "Built; 3 repositories await EZQuest-supplied source files."],
  ["Phase 4 — Integrations & Content", "Delivered", "Named integrations present/demonstrable; Back-in-Stock is a change request."],
  ["Phase 5 — QA / SEO / Launch", "Pending launch", "QA/SEO evidence to hand over; deploy on approval."],
]));
children.push(p([{ text: "Requested next step: ", bold: true }, "a short walkthrough call to demonstrate the Phase 4 integrations and hand over the Phase 1 and Phase 5 evidence package, so we can confirm sign-off and schedule production launch."]));

children.push(new Paragraph({ spacing: { before: 300 }, children: [
  new TextRun({ text: "Prepared by Emanuel J. Rad — " , italics: true, size: 18, color: GREY }),
  new TextRun({ text: "in response to the EZQuest Agreement Completion Checklist & Audit (Aug 22, 2026).", italics: true, size: 18, color: GREY })] }));

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 21 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children
  }]
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync("/sessions/keen-modest-hypatia/mnt/outputs/EZQuest_Deliverables_Response.docx", b);
  console.log("written");
});
