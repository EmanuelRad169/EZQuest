(() => {
  document.querySelectorAll('[data-media-coverage]').forEach((section) => {
    const list = section.querySelector('[data-coverage-list]');
    const items = [...section.querySelectorAll('[data-coverage-item]')];
    const controls = section.querySelector('[data-coverage-controls]');
    const search = section.querySelector('[data-coverage-search]');
    const type = section.querySelector('[data-coverage-type]');
    const empty = section.querySelector('[data-coverage-empty]');
    const filterNote = section.querySelector('[data-coverage-filter-note]');
    if (!list || !items.length || !controls || !search || !type) return;
    items.slice().sort((a, b) => (b.dataset.coverageDate || '').localeCompare(a.dataset.coverageDate || '')).forEach((item) => list.appendChild(item));
    controls.hidden = false;
    if (filterNote) filterNote.hidden = !section.querySelector('.media-coverage__pagination');
    const filter = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const kind = type.value;
      let visible = 0;
      items.forEach((item) => {
        const matches = (kind === 'all' || item.dataset.coverageKind === kind) && item.dataset.coverageSearchable.toLocaleLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      empty.hidden = visible > 0;
    };
    search.addEventListener('input', filter);
    type.addEventListener('change', filter);
  });
})();
