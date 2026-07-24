#!/usr/bin/env node
/**
 * migrate-downloads.mjs
 * ---------------------------------------------------------------------------
 * Migrates per-product download files (manuals, data sheets, drivers) from the
 * old ezq.com (Magento) site into this Shopify store.
 *
 * For every PDF/zip/exe/dmg found on an old product page it:
 *   1. `fileCreate(originalSource: <old url>)`  — Shopify fetches & hosts the file
 *      on its own CDN (so the download keeps working after ezq.com is retired).
 *   2. `metaobjectCreate(type: "ezquest_download")` — title + file + product link,
 *      which the theme's Downloads tab renders.
 *
 * The Shopify product is matched to the old page by PART NUMBER (e.g. X40030),
 * which appears in the download filename/title and in the product's SKU / handle
 * / "Part Number:" spec. Falls back to matching the old URL slug to the handle.
 *
 * It is IDEMPOTENT: it skips a download whose (product + title) already exists,
 * so you can safely re-run it.
 *
 * ── Setup ──────────────────────────────────────────────────────────────────
 *   Requires Node 18+ (global fetch). Reads credentials from .env.local:
 *     SHOPIFY_SHOP_DOMAIN=ezquest-4.myshopify.com
 *     SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx
 *     SHOPIFY_ADMIN_API_VERSION=2026-01           (optional, defaults below)
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *   node scripts/migrate-downloads.mjs --dry-run     # scrape + match, no writes
 *   node scripts/migrate-downloads.mjs               # perform the migration
 *   node scripts/migrate-downloads.mjs --limit 5     # only process 5 products
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OLD_BASE = 'https://ezq.com';
const DL_EXT = /\.(pdf|zip|exe|dmg|inf)(\?|$)/i;
const PART_RE = /\b([A-Z]{1,2}\d{4,5}[A-Z]?)\b/g;   // X40030, C41005, SS103 ...
const DRY = process.argv.includes('--dry-run');
const LIMIT = (() => { const i = process.argv.indexOf('--limit'); return i > -1 ? parseInt(process.argv[i + 1], 10) : Infinity; })();

// ── env ────────────────────────────────────────────────────────────────────
function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();
const SHOP = process.env.SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || '2026-01';
if (!SHOP || !TOKEN) {
  console.error('Missing SHOPIFY_SHOP_DOMAIN / SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(query, variables = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://${SHOP}/admin/api/${VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
      body: JSON.stringify({ query, variables }),
    });
    if (res.status === 429 || res.status >= 500) { await sleep(2000 * (attempt + 1)); continue; }
    const json = await res.json();
    if (json.errors) throw new Error('GraphQL: ' + JSON.stringify(json.errors));
    return json.data;
  }
  throw new Error('GraphQL: too many retries');
}

async function getOld(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ezq-migrate/1.0' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* slow site — retry */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}

function abs(href, base) { try { return new URL(href, base).href; } catch { return null; } }

// ── phase 1: crawl old site for product pages + their downloads ──────────────
async function crawlOldSite() {
  const seen = new Set();
  const queue = [OLD_BASE + '/'];
  const pageDownloads = {}; // url -> [{title, fileUrl}]
  let fetched = 0;
  const MAX_PAGES = 600;

  while (queue.length && fetched < MAX_PAGES) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const html = await getOld(url);
    fetched++;
    if (!html) continue;
    process.stdout.write(`\r  crawled ${fetched} pages, ${Object.keys(pageDownloads).length} with downloads   `);

    // collect same-origin html links to follow
    for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
      const u = abs(m[1], url);
      if (!u) continue;
      if (!u.startsWith(OLD_BASE)) continue;
      if (/\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip|exe|dmg|ico|webp)(\?|$)/i.test(u)) continue;
      if (!seen.has(u) && queue.length < 5000) queue.push(u.split('#')[0]);
    }
    // collect downloads on this page
    const dls = [];
    for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      if (!DL_EXT.test(m[1])) continue;
      const fileUrl = abs(m[1], url);
      const title = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (fileUrl) dls.push({ title: title || path.basename(fileUrl), fileUrl });
    }
    if (dls.length) {
      const uniq = [...new Map(dls.map((d) => [d.fileUrl, d])).values()];
      pageDownloads[url] = uniq;
    }
    await sleep(250); // be polite to the slow old server
  }
  process.stdout.write('\n');
  return pageDownloads;
}

const partsOf = (str) => [...(str || '').toUpperCase().matchAll(PART_RE)].map((m) => m[1]);
function classify(title) {
  const t = title.toLowerCase();
  if (t.includes('manual') || t.includes('guide')) return 'Manual';
  if (t.includes('data') || t.includes('spec')) return 'Data Sheet';
  if (t.includes('driver')) return 'Driver';
  return 'Download';
}

// ── phase 2: load Shopify products ───────────────────────────────────────────
async function loadProducts() {
  const products = [];
  let cursor = null;
  do {
    const data = await gql(
      `query($c:String){ products(first:100, after:$c){ pageInfo{hasNextPage endCursor}
        nodes{ id handle title
          variants(first:20){ nodes{ sku } }
          spec: metafield(namespace:"custom", key:"product_specifications"){ value } } } }`,
      { c: cursor }
    );
    for (const p of data.products.nodes) {
      const parts = new Set();
      p.variants.nodes.forEach((v) => partsOf(v.sku).forEach((x) => parts.add(x)));
      partsOf(p.spec?.value).forEach((x) => parts.add(x));
      partsOf(p.handle).forEach((x) => parts.add(x));
      products.push({ id: p.id, handle: p.handle, title: p.title, parts });
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  return products;
}

// ── phase 3: existing downloads (idempotency) ────────────────────────────────
async function loadExisting() {
  const seen = new Set(); // `${productId}::${title}`
  let cursor = null;
  do {
    const data = await gql(
      `query($c:String){ metaobjects(type:"ezquest_download", first:100, after:$c){ pageInfo{hasNextPage endCursor}
        nodes{ title: field(key:"title"){ value } products: field(key:"products"){ references(first:10){ nodes{ ... on Product { id } } } } } } }`,
      { c: cursor }
    );
    for (const n of data.metaobjects.nodes) {
      const title = n.title?.value || '';
      for (const ref of n.products?.references?.nodes || []) seen.add(`${ref.id}::${title}`);
    }
    cursor = data.metaobjects.pageInfo.hasNextPage ? data.metaobjects.pageInfo.endCursor : null;
  } while (cursor);
  return seen;
}

async function hostFile(url, alt) {
  const d = await gql(
    `mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){ files{ id } userErrors{ message } } }`,
    { f: [{ originalSource: url, contentType: 'FILE', alt: alt.slice(0, 250) }] }
  );
  const err = d.fileCreate.userErrors[0];
  if (err) throw new Error('fileCreate: ' + err.message);
  return d.fileCreate.files[0].id;
}

async function createMetaobject(title, type, fileId, productId, order) {
  const d = await gql(
    `mutation($m:MetaobjectCreateInput!){ metaobjectCreate(metaobject:$m){ metaobject{ id } userErrors{ message } } }`,
    { m: { type: 'ezquest_download', fields: [
      { key: 'title', value: title.slice(0, 250) },
      { key: 'download_type', value: type },
      { key: 'file', value: fileId },
      { key: 'products', value: JSON.stringify([productId]) },
      { key: 'sort_order', value: String(order) },
    ] } }
  );
  const err = d.metaobjectCreate.userErrors[0];
  if (err) throw new Error('metaobjectCreate: ' + err.message);
  return d.metaobjectCreate.metaobject.id;
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Store: ${SHOP}  (API ${VERSION})  ${DRY ? '[DRY RUN]' : ''}`);
  console.log('1/4  Crawling old site for downloads (this is slow — the old server is slow)…');
  const pageDownloads = await crawlOldSite();
  const pages = Object.entries(pageDownloads);
  console.log(`     Found downloads on ${pages.length} old pages.`);

  console.log('2/4  Loading Shopify products…');
  const products = await loadProducts();
  const bySku = new Map();
  products.forEach((p) => p.parts.forEach((x) => bySku.set(x, p)));
  const byHandle = new Map(products.map((p) => [p.handle, p]));

  console.log('3/4  Loading existing downloads (for idempotency)…');
  const existing = DRY ? new Set() : await loadExisting();

  console.log('4/4  Migrating…');
  const report = { created: 0, skipped: 0, unmatched: [], errors: [] };
  let processed = 0;

  for (const [pageUrl, dls] of pages) {
    if (processed >= LIMIT) break;
    // match a product: by part number found in any download, else by url slug == handle
    let product = null;
    for (const d of dls) {
      for (const part of [...partsOf(d.title), ...partsOf(path.basename(d.fileUrl))]) {
        if (bySku.has(part)) { product = bySku.get(part); break; }
      }
      if (product) break;
    }
    if (!product) {
      const slug = path.basename(new URL(pageUrl).pathname).replace(/\.html?$/i, '');
      if (byHandle.has(slug)) product = byHandle.get(slug);
    }
    if (!product) { report.unmatched.push(pageUrl); continue; }
    processed++;

    let order = 1;
    for (const d of dls) {
      const key = `${product.id}::${d.title}`;
      if (existing.has(key)) { report.skipped++; order++; continue; }
      console.log(`   • ${product.handle}  ←  ${d.title}`);
      if (DRY) { report.created++; order++; continue; }
      try {
        const fileId = await hostFile(d.fileUrl, d.title);
        await sleep(400); // let the file register
        await createMetaobject(d.title, classify(d.title), fileId, product.id, order++);
        existing.add(key);
        report.created++;
      } catch (e) {
        report.errors.push(`${product.handle} / ${d.title}: ${e.message}`);
      }
    }
  }

  console.log('\n──────── REPORT ────────');
  console.log(`Created:   ${report.created}`);
  console.log(`Skipped:   ${report.skipped} (already migrated)`);
  console.log(`Unmatched old pages: ${report.unmatched.length}`);
  report.unmatched.slice(0, 30).forEach((u) => console.log('   ? ' + u));
  if (report.errors.length) { console.log(`Errors: ${report.errors.length}`); report.errors.forEach((e) => console.log('   ! ' + e)); }
  console.log('\nDone. Push the theme (Downloads tab gate) if you haven\'t: the tab shows automatically once a product has downloads.');
})();
