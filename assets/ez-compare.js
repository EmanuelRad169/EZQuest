/* ============================================================
   EZQuest — Native product comparison
   - Compare icon next to the wishlist heart on product cards
   - Header compare icon (links to /pages/compare) with live count
   - /pages/compare renders a full comparison table (server-rendered
     product index incl. spec metafields + market-aware pricing)
   - Stores the compare list in localStorage (like the wishlist)
   Self-contained; remove ez-compare.css + ez-compare.js to revert.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'ez_compare_v1';
  var MAX = 4;
  var COMPARE_URL = '/pages/compare';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="2.5" y="3.5" width="10" height="13" rx="2"/><rect x="11.5" y="7.5" width="10" height="13" rx="2"/>' +
    '<path d="M5 10h4.5"/><path d="m7.8 8 2.2 2-2.2 2"/><path d="M19 14h-4.5"/><path d="m16.2 12-2.2 2 2.2 2"/></svg>';

  /* ---- list storage ---- */
  function getList() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function setList(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} document.dispatchEvent(new CustomEvent('ez-compare:change')); }
  function has(id) { return getList().indexOf(String(id)) !== -1; }
  function toggle(id) {
    id = String(id);
    var a = getList();
    var i = a.indexOf(id);
    if (i !== -1) { a.splice(i, 1); setList(a); return false; }
    if (a.length >= MAX) { showToast('You can compare up to ' + MAX + ' products.'); return null; }
    a.push(id); setList(a); return true;
  }

  /* ---- toast ---- */
  var toast;
  function showToast(msg) {
    if (!toast) { toast = document.createElement('div'); toast.className = 'ez-compare-toast'; document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('is-visible');
    clearTimeout(showToast._t); showToast._t = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }

  /* ---- header icon ---- */
  function ensureHeaderBtn() {
    if (document.querySelector('[data-ez-compare-link]')) return;
    var wl = document.querySelector('a[href="/pages/wishlist"].site-header-icon-button, a[href*="wishlist"].site-header-icon-button');
    if (!wl) return;
    var a = document.createElement('a');
    a.href = COMPARE_URL;
    a.className = 'site-header-icon-button site-header-compare-button';
    a.setAttribute('aria-label', 'Compare products');
    a.setAttribute('data-ez-compare-link', '');
    a.innerHTML = ICON + '<span class="site-header-compare-count" data-ez-compare-count hidden>0</span>';
    wl.parentNode.insertBefore(a, wl.nextSibling);
  }
  function syncBadge() {
    var b = document.querySelector('[data-ez-compare-count]');
    if (!b) return;
    var n = getList().length;
    b.textContent = n; b.hidden = n <= 0;
  }

  /* ---- per-card icons ---- */
  function decorate() {
    document.querySelectorAll('.product-card__wishlist').forEach(function (wrap) {
      if (wrap.querySelector('.ez-card-compare')) return;
      var heart = wrap.querySelector('[data-wishlist-id]');
      var pid = heart && heart.getAttribute('data-wishlist-id');
      if (!pid) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ez-card-compare';
      btn.setAttribute('aria-label', 'Add to compare');
      btn.setAttribute('data-ez-compare-id', pid);
      btn.innerHTML = ICON;
      btn.classList.toggle('is-active', has(pid));
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var r = toggle(pid);
        if (r !== null) btn.classList.toggle('is-active', r);
      });
      wrap.appendChild(btn);
    });
  }
  function refreshCardStates() {
    document.querySelectorAll('.ez-card-compare[data-ez-compare-id]').forEach(function (b) {
      b.classList.toggle('is-active', has(b.getAttribute('data-ez-compare-id')));
    });
  }

  /* ---- compare page renderer ---- */
  function money(v) { return v || ''; }
  function renderComparePage() {
    var root = document.getElementById('ez-compare-root');
    var dataEl = document.getElementById('ez-compare-index');
    if (!root || !dataEl) return;
    var index; try { index = JSON.parse(dataEl.textContent); } catch (e) { index = {}; }
    var ids = getList().filter(function (id) { return index[id]; });

    if (ids.length === 0) {
      root.innerHTML = '<div class="ez-compare-empty">' +
        '<p>You haven’t added anything to compare yet.</p>' +
        '<p>Browse the collections and tap the compare icon on any product to line them up side by side.</p>' +
        '<a class="ez-compare-empty__btn" href="/collections/all">Browse products</a></div>';
      return;
    }

    // rows: label + accessor
    var rows = [
      ['Price', function (p) { return '<span class="ezc-price">' + money(p.price) + '</span>' + (p.compareAt ? ' <s class="ezc-was">' + money(p.compareAt) + '</s>' : ''); }],
      ['SKU / Part #', function (p) { return p.sku || '—'; }],
      ['Type', function (p) { return p.type || '—'; }],
      ['Connector', function (p) { return p.connector || '—'; }],
      ['Form factor', function (p) { return p.form || '—'; }],
      ['Charging power', function (p) { return p.power || '—'; }],
      ['Portability', function (p) { return p.portability || '—'; }],
      ['Warranty', function (p) { return p.warranty ? ('' + p.warranty).replace(/\.0+$/, '') + '-year' : '—'; }],
      ['Best for', function (p) { return p.bestfor || '—'; }]
    ];

    var h = '<div class="ez-compare-scroll"><table class="ez-compare-table" style="--cols:' + ids.length + '"><thead><tr><th class="ezc-corner"></th>';
    ids.forEach(function (id) {
      var p = index[id];
      h += '<th class="ezc-head">' +
        '<button type="button" class="ezc-remove" data-ezc-remove="' + id + '" aria-label="Remove ' + esc(p.title) + '">&times;</button>' +
        '<a href="' + p.url + '" class="ezc-head__media">' + (p.img ? '<img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy">' : '') + '</a>' +
        '<a href="' + p.url + '" class="ezc-head__title">' + esc(p.title) + '</a>' +
        '<a href="' + p.url + '" class="ezc-head__cta">View product &rarr;</a>' +
        '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function (row) {
      h += '<tr><th class="ezc-rowlabel" scope="row">' + row[0] + '</th>';
      ids.forEach(function (id) { h += '<td>' + row[1](index[id]) + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    h += '<div class="ez-compare-actions"><button type="button" class="ez-compare-clear" data-ezc-clear>Clear all</button></div>';
    root.innerHTML = h;
  }
  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- events ---- */
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-ezc-remove]');
    if (rm) { var a = getList(); var i = a.indexOf(rm.getAttribute('data-ezc-remove')); if (i !== -1) { a.splice(i, 1); setList(a); } return; }
    if (e.target.closest('[data-ezc-clear]')) { setList([]); return; }
  });
  document.addEventListener('ez-compare:change', function () { syncBadge(); refreshCardStates(); renderComparePage(); });

  function tick() { ensureHeaderBtn(); decorate(); syncBadge(); }
  function init() { tick(); renderComparePage(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  var scheduled = false;
  new MutationObserver(function () {
    if (scheduled) return; scheduled = true;
    requestAnimationFrame(function () { scheduled = false; tick(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Cross-tab sync
  window.addEventListener('storage', function (e) { if (e.key === KEY) { syncBadge(); refreshCardStates(); renderComparePage(); } });
})();
