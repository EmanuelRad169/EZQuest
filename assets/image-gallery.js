(() => {
  'use strict';
  const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const mediaURL = (value) => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value, location.origin);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      if (url.hostname === 'cdn.shopify.com' || (url.origin === location.origin && url.pathname.startsWith('/cdn/'))) return url.href;
    } catch (_) { /* Invalid manifest URL. */ }
    return null;
  };
  const productURL = (value) => {
    if (typeof value !== 'string' || !value.startsWith('/products/')) return null;
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin && /^\/products\/[^/]+\/?$/.test(url.pathname) ? url.href : null;
    } catch (_) { return null; }
  };
  const thumbnailURL = (value, width) => {
    const url = new URL(value);
    url.searchParams.set('width', String(width));
    return url.href;
  };
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  function initialize(root) {
    if (root.dataset.initialized) return;
    root.dataset.initialized = 'true';
    document.title = 'Image Gallery | EZQuest';
    const $ = (selector) => root.querySelector(selector);
    const form = $('.ig-filters');
    const search = form.elements.gallery_q;
    const category = form.elements.gallery_category;
    const legacy = form.elements.gallery_legacy;
    const grid = $('.ig-grid');
    const status = $('.ig-status');
    const message = $('.ig-message');
    const retry = $('.ig-retry');
    const clear = $('.ig-clear');
    const dialog = $('.ig-dialog');
    const fullImage = $('.ig-full-image');
    const thumbs = $('.ig-thumbnails');
    const allowedCategories = Array.from(category.options, (option) => option.value);
    let albums = [];
    let activeAlbum = null;
    let imageIndex = 0;
    let returnFocus = null;
    let returnAlbumID = null;
    let filterTimer;
    let openedFromGrid = false;
    let touchStart = null;
    const state = { query: '', category: '', legacy: false };
    function writeURL(method = 'replaceState', albumID = null) {
      const url = new URL(location.href);
      const values = { gallery_q: state.query, gallery_category: state.category, gallery_legacy: state.legacy ? '1' : '', gallery_album: albumID || '' };
      Object.entries(values).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      if (url.href !== location.href) history[method](null, '', url.href);
    }
    function closeDialog() {
      if (!dialog.open) return;
      dialog.close();
      document.documentElement.classList.remove('ig-scroll-lock');
      fullImage.removeAttribute('src');
      thumbs.replaceChildren();
      activeAlbum = null;
      const restoredTrigger = Array.from(grid.children).find((node) => node.dataset.albumId === returnAlbumID);
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      else if (restoredTrigger) restoredTrigger.focus({ preventScroll: true });
      else search.focus({ preventScroll: true });
    }
    function requestClose() {
      if (openedFromGrid && new URL(location.href).searchParams.has('gallery_album')) {
        openedFromGrid = false;
        history.back();
      } else {
        writeURL('replaceState');
        closeDialog();
      }
    }
    function showImage(index) {
      if (!activeAlbum) return;
      imageIndex = (index + activeAlbum.images.length) % activeAlbum.images.length;
      const item = activeAlbum.images[imageIndex];
      $('.ig-image-error').hidden = true;
      fullImage.alt = `${activeAlbum.sku} — ${item.label || item.filename}`;
      fullImage.width = item.width > 0 ? item.width : 1200;
      fullImage.height = item.height > 0 ? item.height : 900;
      fullImage.src = item.src;
      $('.ig-image-label').textContent = item.label || `Image ${imageIndex + 1}`;
      $('.ig-filename').textContent = item.filename;
      const metadata = [];
      if (item.width > 0 && item.height > 0) metadata.push(`${item.width.toLocaleString()} × ${item.height.toLocaleString()} px`);
      if (item.format) metadata.push(item.format);
      if (item.bytes > 0) metadata.push(item.bytes >= 1048576 ? `${(item.bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(item.bytes / 1024)} KB`);
      $('.ig-image-meta').textContent = metadata.join(' · ');
      const derivative = item.original_width > 0 && item.original_height > 0 && (item.original_width !== item.width || item.original_height !== item.height);
      const originalMeta = $('.ig-original-meta');
      originalMeta.hidden = !derivative;
      originalMeta.textContent = derivative ? `Original in ZIP: ${item.original_width.toLocaleString()} × ${item.original_height.toLocaleString()} px` : '';
      $('.ig-original-label').textContent = derivative ? 'Open display image' : 'Open full-size image';
      $('.ig-counter').textContent = `Image ${imageIndex + 1} of ${activeAlbum.images.length}`;
      const original = $('.ig-original');
      original.href = item.src;
      original.removeAttribute('download');
      Array.from(thumbs.children).forEach((button, index) => button.setAttribute('aria-current', String(index === imageIndex)));
      const current = thumbs.children[imageIndex];
      if (current) thumbs.scrollLeft = current.offsetLeft - thumbs.offsetLeft - thumbs.clientWidth / 2 + current.clientWidth / 2;
      $('.ig-prev').hidden = $('.ig-next').hidden = activeAlbum.images.length < 2;
    }
    function openAlbum(album, trigger, push) {
      if (!album || typeof dialog.showModal !== 'function') {
        status.textContent = 'This browser does not support the image viewer. Please use a current browser.';
        return;
      }
      if (trigger) {
        clearTimeout(filterTimer);
        state.query = search.value.slice(0, 250).trim();
        state.category = category.value;
        state.legacy = legacy.checked;
        writeURL();
        returnFocus = trigger;
        returnAlbumID = album.id;
      }
      activeAlbum = album;
      $('.ig-album-sku').textContent = `${album.sku}${album.legacy ? ' / Legacy product' : ''}`;
      dialog.querySelector('h2').textContent = album.title;
      const zipLinks = $('.ig-zip-links');
      const parts = album.zip_parts.length ? album.zip_parts : (album.zip_url ? [{ url: album.zip_url, label: '' }] : []);
      zipLinks.replaceChildren(...parts.map((part, index) => {
        const link = element('a', 'ig-button ig-zip', `Download originals ZIP${parts.length > 1 ? ` — ${part.label || `Part ${index + 1}`}` : ''}`);
        link.href = part.url;
        link.setAttribute('download', `${album.sku}-originals${parts.length > 1 ? `-${index + 1}` : ''}.zip`);
        link.target = '_blank';
        link.rel = 'noopener';
        const icon = element('span', '', '↓');
        icon.setAttribute('aria-hidden', 'true');
        link.append(icon);
        return link;
      }));
      zipLinks.hidden = parts.length === 0;
      const product = $('.ig-product');
      product.hidden = !album.product_url;
      if (album.product_url) product.href = album.product_url;
      else product.removeAttribute('href');
      thumbs.replaceChildren(...album.images.map((item, index) => {
        const button = element('button', 'ig-thumbnail');
        button.type = 'button';
        button.setAttribute('aria-label', `Show image ${index + 1}: ${item.label || item.filename}`);
        const img = element('img');
        img.src = thumbnailURL(item.thumb || item.src, 140);
        img.alt = '';
        img.loading = 'lazy';
        button.append(img);
        button.addEventListener('click', () => showImage(index));
        return button;
      }));
      const coverIndex = album.images.findIndex((item) => item.src === album.cover);
      showImage(coverIndex >= 0 ? coverIndex : 0);
      if (!dialog.open) dialog.showModal();
      document.documentElement.classList.add('ig-scroll-lock');
      if (push) { writeURL('pushState', album.id); openedFromGrid = true; }
    }
    function render() {
      const terms = state.query.split(/\s+/).map(normalize).filter(Boolean);
      const visible = albums.filter((album) => (state.legacy || !album.legacy) && (!state.category || album.category === state.category) && terms.every((term) => album.search.includes(term)));
      grid.replaceChildren(...visible.map((album) => {
        const button = element('button', 'ig-tile');
        button.dataset.albumId = album.id;
        button.type = 'button';
        const imageCount = `${album.images.length} image${album.images.length === 1 ? '' : 's'}`;
        button.setAttribute('aria-label', `Open ${album.sku}: ${album.title}, ${imageCount}`);
        button.setAttribute('aria-haspopup', 'dialog');
        const media = element('span', 'ig-tile-media');
        const img = element('img');
        img.src = thumbnailURL(album.cover || album.images[0].thumb || album.images[0].src, 700);
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 700; img.height = 525;
        media.append(img, element('span', 'ig-tile-count', imageCount));
        button.append(media, element('span', 'ig-tile-sku', `${album.sku}${album.legacy ? ' · LEGACY' : ''}`), element('span', 'ig-tile-title', album.title), element('span', 'ig-tile-category', album.category));
        button.addEventListener('click', () => openAlbum(album, button, true));
        return button;
      }));
      status.textContent = `${visible.length} product album${visible.length === 1 ? '' : 's'}`;
      clear.hidden = !state.query && !state.category && !state.legacy;
      message.hidden = visible.length > 0;
      message.querySelector('p').textContent = albums.length ? 'No products match these filters. Try a different name, SKU, or category.' : 'The image library is being prepared. Please check back soon.';
      retry.hidden = true;
    }
    function readURL() {
      const params = new URL(location.href).searchParams;
      state.query = (params.get('gallery_q') || '').slice(0, 250);
      state.category = allowedCategories.includes(params.get('gallery_category')) ? params.get('gallery_category') : '';
      state.legacy = params.get('gallery_legacy') === '1';
      search.value = state.query; category.value = state.category; legacy.checked = state.legacy;
      render();
      const album = albums.find((item) => item.id === params.get('gallery_album'));
      if (album) {
        if (album !== activeAlbum) openAlbum(album, null, false);
      } else closeDialog();
    }
    function applyFilters() {
      state.query = search.value.slice(0, 250).trim();
      state.category = category.value;
      state.legacy = legacy.checked;
      writeURL(); render();
    }
    async function load() {
      grid.setAttribute('aria-busy', 'true');
      status.textContent = 'Loading the image library…';
      message.hidden = true;
      try {
        const response = await fetch(root.dataset.manifestUrl, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Manifest unavailable');
        const data = await response.json();
        if (data.version !== 1 || !Array.isArray(data.albums)) throw new Error('Invalid manifest');
        const ids = new Set();
        albums = data.albums.flatMap((album) => {
          if (!album || typeof album.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(album.id) || ids.has(album.id) || typeof album.sku !== 'string' || typeof album.title !== 'string' || !allowedCategories.includes(album.category) || !Array.isArray(album.images) || typeof album.legacy !== 'boolean') return [];
          const images = album.images.flatMap((item) => {
            if (!item || !mediaURL(item.src) || typeof item.filename !== 'string') return [];
            return [{ src: mediaURL(item.src), thumb: mediaURL(item.thumb), filename: item.filename, label: typeof item.label === 'string' ? item.label : '', format: typeof item.format === 'string' ? item.format : '', width: Number(item.width) || 0, height: Number(item.height) || 0, bytes: Number(item.bytes) || 0, original_width: Number(item.original_width) || 0, original_height: Number(item.original_height) || 0 }];
          });
          if (!images.length) return [];
          ids.add(album.id);
          return [{ id: album.id, sku: album.sku, title: album.title, category: album.category, legacy: album.legacy, images, cover: mediaURL(album.cover), zip_url: mediaURL(album.zip_url), zip_parts: Array.isArray(album.zip_parts) ? album.zip_parts.flatMap((part) => part && mediaURL(part.url) ? [{ url: mediaURL(part.url), label: typeof part.label === 'string' ? part.label : '' }] : []) : [], product_url: productURL(album.product_url), search: normalize([album.sku, album.title, ...(Array.isArray(album.keywords) ? album.keywords.filter((word) => typeof word === 'string') : [])].join(' ')) }];
        });
        form.hidden = false;
        readURL();
      } catch (_) {
        status.textContent = 'Image library unavailable';
        message.hidden = false;
        message.querySelector('p').textContent = 'We could not load the product images. Please try again.';
        retry.hidden = false;
      } finally { grid.setAttribute('aria-busy', 'false'); }
    }
    form.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(filterTimer); applyFilters(); });
    search.addEventListener('input', () => { clearTimeout(filterTimer); filterTimer = setTimeout(applyFilters, 180); });
    category.addEventListener('change', applyFilters);
    legacy.addEventListener('change', applyFilters);
    clear.addEventListener('click', () => { clearTimeout(filterTimer); search.value = ''; category.value = ''; legacy.checked = false; applyFilters(); search.focus(); });
    retry.addEventListener('click', load);
    $('.ig-close').addEventListener('click', requestClose);
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); requestClose(); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose(); } });
    dialog.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1)); } });
    $('.ig-prev').addEventListener('click', () => showImage(imageIndex - 1));
    $('.ig-next').addEventListener('click', () => showImage(imageIndex + 1));
    $('.ig-stage').addEventListener('touchstart', (event) => { touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
    $('.ig-stage').addEventListener('touchend', (event) => { if (!touchStart || !event.changedTouches.length) return; const dx = event.changedTouches[0].clientX - touchStart.x; const dy = event.changedTouches[0].clientY - touchStart.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) showImage(imageIndex + (dx < 0 ? 1 : -1)); touchStart = null; }, { passive: true });
    fullImage.addEventListener('error', () => { $('.ig-image-error').hidden = false; });
    window.addEventListener('popstate', () => { clearTimeout(filterTimer); openedFromGrid = false; readURL(); });
    load();
  }
  document.querySelectorAll('[data-image-gallery]').forEach(initialize);
  document.addEventListener('shopify:section:load', (event) => event.target.querySelectorAll('[data-image-gallery]').forEach(initialize));
})();
