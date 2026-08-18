/* ============================================================
   EZQuest — Native product comparison (enterprise UX)
   - Compare icon next to the wishlist heart on product cards
   - Header compare icon (links to /pages/compare) with live count
   - /pages/compare: sticky headers, add-to-cart, add-product search
     (by name / SKU), difference highlight, market-aware pricing +
     spec metafields (server-rendered index). Stored in localStorage.
   Self-contained; remove ez-compare.css + ez-compare.js to revert.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'ez_compare_v1';
  var MAX = 3;
  var COMPARE_URL = '/pages/compare';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/>' +
    '<circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/></svg>';

  /* ---- toast (also replaces any stray Compareder native alert) ---- */
  var toast;
  function showToast(msg) {
    if (!toast) { toast = document.createElement('div'); toast.className = 'ez-compare-toast'; document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('is-visible');
    clearTimeout(showToast._t); showToast._t = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }
  var origAlert = window.alert;
  window.alert = function (m) { var s = String(m); if (/compar|product|at least|maximum/i.test(s)) { showToast(s); } else { origAlert.call(window, m); } };

  /* ---- list storage ---- */
  function getList() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function setList(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} document.dispatchEvent(new CustomEvent('ez-compare:change')); }
  function has(id) { return getList().indexOf(String(id)) !== -1; }
  function add(id) { id = String(id); var a = getList(); if (a.indexOf(id) !== -1) return true; if (a.length >= MAX) { showToast('You can compare up to ' + MAX + ' products.'); return null; } a.push(id); setList(a); return true; }
  function remove(id) { id = String(id); var a = getList(); var i = a.indexOf(id); if (i !== -1) { a.splice(i, 1); setList(a); } }
  function toggle(id) { return has(id) ? (remove(id), false) : add(id); }

  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- header icon ---- */
  function ensureHeaderBtn() {
    if (document.querySelector('[data-ez-compare-link]')) return;
    var wl = document.querySelector('a[href="/pages/wishlist"].site-header-icon-button, a[href*="wishlist"].site-header-icon-button');
    if (!wl) return;
    var a = document.createElement('a');
    a.href = COMPARE_URL; a.className = 'site-header-icon-button site-header-compare-button';
    a.setAttribute('aria-label', 'Compare products'); a.setAttribute('data-ez-compare-link', '');
    a.innerHTML = ICON + '<span class="site-header-compare-count" data-ez-compare-count hidden>0</span>';
    wl.parentNode.insertBefore(a, wl.nextSibling);
  }
  function syncBadge() { var b = document.querySelector('[data-ez-compare-count]'); if (!b) return; var n = getList().length; b.textContent = n; b.hidden = n <= 0; }

  /* ---- per-card icons ---- */
  function decorate() {
    document.querySelectorAll('.product-card__wishlist').forEach(function (wrap) {
      if (wrap.querySelector('.ez-card-compare')) return;
      var heart = wrap.querySelector('[data-wishlist-id]');
      var pid = heart && heart.getAttribute('data-wishlist-id');
      if (!pid) return;
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'ez-card-compare'; btn.setAttribute('aria-label', 'Add to compare'); btn.setAttribute('data-ez-compare-id', pid);
      btn.innerHTML = ICON;
      btn.classList.toggle('is-active', has(pid));
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var r = toggle(pid); if (r !== null) btn.classList.toggle('is-active', has(pid)); });
      wrap.appendChild(btn);
    });
  }
  function refreshCardStates() { document.querySelectorAll('.ez-card-compare[data-ez-compare-id]').forEach(function (b) { b.classList.toggle('is-active', has(b.getAttribute('data-ez-compare-id'))); }); }

  /* ---- compare page ---- */
  var INDEX = null;
  function getIndex() {
    if (INDEX) return INDEX;
    var el = document.getElementById('ez-compare-index');
    try { INDEX = el ? JSON.parse(el.textContent) : {}; } catch (e) { INDEX = {}; }
    return INDEX;
  }

  var ROWS = [
    ['Price', function (p) { return '<span class="ezc-price">' + (p.price || '') + '</span>' + (p.compareAt ? ' <s class="ezc-was">' + p.compareAt + '</s>' : ''); }, function (p) { return (p.price || '') + '|' + (p.compareAt || ''); }],
    ['SKU / Part #', function (p) { return p.sku || '—'; }],
    ['Type', function (p) { return p.type || '—'; }],
    ['Connector', function (p) { return p.connector || '—'; }],
    ['Key features', function (p) { return (Array.isArray(p.features) && p.features.length) ? '<ul class="ezc-features">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '—'; }, function (p) { return Array.isArray(p.features) ? p.features.join('|') : ''; }],
    ['Form factor', function (p) { return p.form || '—'; }],
    ['Charging power', function (p) { return p.power || '—'; }],
    ['Portability', function (p) { return p.portability || '—'; }],
    ['Warranty', function (p) { return p.warranty ? ('' + p.warranty).replace(/\.0+$/, '') + '-year' : '—'; }],
    ['Best for', function (p) { return p.bestfor || '—'; }]
  ];

  function renderComparePage() {
    var root = document.getElementById('ez-compare-root');
    if (!root) return;
    var index = getIndex();
    var ids = getList().filter(function (id) { return index[id]; });

    if (ids.length === 0) {
      root.innerHTML =
        '<div class="ez-compare-empty">' +
          '<span class="ez-compare-empty__icon">' + ICON + '</span>' +
          '<h2 class="ez-compare-empty__title">Nothing to compare yet</h2>' +
          '<p>Add products with the compare icon while you browse, then line them up side by side here.</p>' +
          '<a class="ez-compare-empty__btn" href="/collections/all">Browse products</a>' +
        '</div>';
      return;
    }

    var addCol = ids.length < MAX
      ? '<th class="ezc-col ezc-col--add"><button type="button" class="ezc-addslot" data-ezc-addopen aria-label="Add a product to compare"><span class="ezc-addslot__plus">+</span><span>Add product</span></button></th>'
      : '';

    var h = '<div class="ez-compare-bar">' +
      '<span class="ez-compare-bar__count">' + ids.length + ' selected</span>' +
      '<div class="ez-compare-bar__actions">' +
      '<button type="button" class="ez-compare-hl" data-ezc-hl aria-pressed="false">Highlight differences</button>' +
      '<button type="button" class="ez-compare-clear" data-ezc-clear>Clear all</button>' +
      '</div></div>';

    h += '<div class="ez-compare-scroll"><table class="ez-compare-table" style="--cols:' + ids.length + '"><thead><tr>';
    h += '<th class="ezc-corner"></th>';
    ids.forEach(function (id) {
      var p = index[id];
      var buy = (p.available && p.vid)
        ? '<button type="button" class="ezc-buy" data-ezc-add-cart="' + p.vid + '">Add to cart</button>'
        : '<span class="ezc-soldout">Sold out</span>';
      h += '<th class="ezc-col">' +
        '<button type="button" class="ezc-remove" data-ezc-remove="' + id + '" aria-label="Remove ' + esc(p.title) + '">&times;</button>' +
        '<a href="' + p.url + '" class="ezc-col__media">' + (p.img ? '<img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy">' : '') + '</a>' +
        '<a href="' + p.url + '" class="ezc-col__title">' + esc(p.title) + '</a>' +
        '<div class="ezc-col__price"><span class="ezc-price">' + (p.price || '') + '</span>' + (p.compareAt ? ' <s class="ezc-was">' + p.compareAt + '</s>' : '') + '</div>' +
        buy +
        '</th>';
    });
    h += addCol + '</tr></thead><tbody>';

    ROWS.forEach(function (row) {
      var vals = ids.map(function (id) { return (row[2] || row[1])(index[id]); });
      var diff = vals.some(function (v) { return v !== vals[0]; });
      h += '<tr class="' + (diff ? 'ezc-diff' : '') + '"><th class="ezc-rowlabel" scope="row">' + row[0] + '</th>';
      ids.forEach(function (id) { h += '<td>' + row[1](index[id]) + '</td>'; });
      if (addCol) h += '<td class="ezc-col--add"></td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';

    // add-product search panel
    h += '<div class="ezc-add-panel" data-ezc-add-panel hidden>' +
      '<div class="ezc-add-panel__inner">' +
      '<button type="button" class="ezc-add-panel__close" data-ezc-addclose aria-label="Close">&times;</button>' +
      '<label class="ezc-add-panel__label" for="ezc-add-input">Add a product to compare</label>' +
      '<input id="ezc-add-input" class="ezc-add-panel__input" type="search" placeholder="Search by name or part number (SKU)…" autocomplete="off" data-ezc-add-input>' +
      '<ul class="ezc-add-panel__results" data-ezc-add-results></ul>' +
      '</div></div>';

    root.innerHTML = h;
  }

  function renderAddResults(q) {
    var ul = document.querySelector('[data-ezc-add-results]'); if (!ul) return;
    q = (q || '').trim().toLowerCase();
    if (!q) { ul.innerHTML = ''; return; }
    var index = getIndex(), list = getList();
    var matches = Object.keys(index).filter(function (id) {
      if (list.indexOf(id) !== -1) return false;
      var p = index[id];
      return (p.title || '').toLowerCase().indexOf(q) !== -1 || (p.sku || '').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
    ul.innerHTML = matches.length ? matches.map(function (id) {
      var p = index[id];
      return '<li><button type="button" class="ezc-add-result" data-ezc-add="' + id + '">' +
        '<span class="ezc-add-result__thumb">' + (p.img ? '<img src="' + p.img + '" alt="">' : '') + '</span>' +
        '<span class="ezc-add-result__info"><span class="ezc-add-result__name">' + esc(p.title) + '</span>' +
        '<span class="ezc-add-result__meta">' + (p.sku ? esc(p.sku) + ' · ' : '') + (p.price || '') + '</span></span></button></li>';
    }).join('') : '<li class="ezc-add-result--none">No products found</li>';
  }

  function addToCart(vid, btn) {
    if (!vid) return;
    var orig = btn.textContent; btn.disabled = true; btn.textContent = 'Adding…';
    fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: vid, quantity: 1 }) })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function () {
        btn.textContent = 'Added ✓'; showToast('Added to cart');
        fetch('/cart.js').then(function (r) { return r.json(); }).then(function (c) {
          document.querySelectorAll('[data-cart-count-badge], [data-cart-count]').forEach(function (b) { b.textContent = c.item_count; if ('hidden' in b) b.hidden = c.item_count === 0; });
          document.dispatchEvent(new CustomEvent('cart:refresh', { detail: c }));
        });
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1500);
      })
      .catch(function () { btn.textContent = orig; btn.disabled = false; showToast('Could not add to cart'); });
  }

  /* ---- events ---- */
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-ezc-remove]'); if (rm) { remove(rm.getAttribute('data-ezc-remove')); return; }
    if (e.target.closest('[data-ezc-clear]')) { setList([]); return; }
    var buy = e.target.closest('[data-ezc-add-cart]'); if (buy) { addToCart(buy.getAttribute('data-ezc-add-cart'), buy); return; }
    var hl = e.target.closest('[data-ezc-hl]'); if (hl) { var t = document.querySelector('.ez-compare-table'); if (t) { var on = t.classList.toggle('ezc-hl'); hl.setAttribute('aria-pressed', on ? 'true' : 'false'); } return; }
    if (e.target.closest('[data-ezc-addopen]')) { var pn = document.querySelector('[data-ezc-add-panel]'); if (pn) { pn.hidden = false; var i = pn.querySelector('[data-ezc-add-input]'); if (i) i.focus(); } return; }
    if (e.target.closest('[data-ezc-addclose]')) { var pn2 = document.querySelector('[data-ezc-add-panel]'); if (pn2) pn2.hidden = true; return; }
    var addr = e.target.closest('[data-ezc-add]'); if (addr) { add(addr.getAttribute('data-ezc-add')); var pn3 = document.querySelector('[data-ezc-add-panel]'); if (pn3) pn3.hidden = true; return; }
  });
  document.addEventListener('input', function (e) { if (e.target.closest('[data-ezc-add-input]')) renderAddResults(e.target.value); });
  document.addEventListener('ez-compare:change', function () { syncBadge(); refreshCardStates(); renderComparePage(); });

  function tick() { ensureHeaderBtn(); decorate(); syncBadge(); }
  function init() { tick(); renderComparePage(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  var scheduled = false;
  new MutationObserver(function () { if (scheduled) return; scheduled = true; requestAnimationFrame(function () { scheduled = false; tick(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { syncBadge(); refreshCardStates(); renderComparePage(); } });
})();
