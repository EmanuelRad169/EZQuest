/* Our Story hero slider — fade slides, dots, swipe, autoplay (pauses off-screen/hover) */
(function () {
  var root = document.querySelector('[data-story-slider]');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-story-slide]'));
  if (slides.length < 2) return;
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-story-dot]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplay = root.dataset.autoplay !== 'false' && !reduce;
  var interval = (parseInt(root.dataset.interval, 10) || 6) * 1000;
  var i = 0, timer = null, paused = false;

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, x) { s.classList.toggle('is-active', x === i); });
    dots.forEach(function (d, x) {
      d.classList.toggle('is-active', x === i);
      if (x === i) { d.setAttribute('aria-selected', 'true'); } else { d.removeAttribute('aria-selected'); }
    });
  }
  function start() { if (!autoplay || timer) return; timer = setInterval(function () { if (!paused) show(i + 1); }, interval); }
  function stop() { clearInterval(timer); timer = null; }

  dots.forEach(function (d) {
    d.addEventListener('click', function () { show(parseInt(d.dataset.storyDot, 10)); stop(); start(); });
  });
  var hero = root.closest('section') || root;
  hero.addEventListener('mouseenter', function () { paused = true; });
  hero.addEventListener('mouseleave', function () { paused = false; });

  /* Touch swipe */
  var x0 = null;
  hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { show(dx < 0 ? i + 1 : i - 1); stop(); start(); }
    x0 = null;
  }, { passive: true });

  /* Pause when hero scrolled out of view */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { paused = !en.isIntersecting; });
    }, { threshold: 0.1 }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { paused = document.hidden; });
  start();
})();
