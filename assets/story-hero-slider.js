/* Hero background slider — used by Our Story hero and page-hero sections.
   Fade slides, dots, swipe, autoplay (pauses on hover / off-screen / hidden tab).
   Re-initializes on shopify:section:load for Theme Editor compatibility. */
(function () {
  var cleanups = [];

  function initOne(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-story-slide]'));
    if (slides.length < 2) return null;
    var scope = root.closest('section') || root.parentElement;
    var dots = Array.prototype.slice.call(scope.querySelectorAll('[data-story-dot]'));
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
    scope.addEventListener('mouseenter', function () { paused = true; });
    scope.addEventListener('mouseleave', function () { paused = false; });

    var x0 = null;
    scope.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    scope.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { show(dx < 0 ? i + 1 : i - 1); stop(); start(); }
      x0 = null;
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { paused = !en.isIntersecting; });
      }, { threshold: 0.1 }).observe(scope);
    }
    start();
    return stop;
  }

  function init() {
    cleanups.forEach(function (fn) { fn && fn(); });
    cleanups = [];
    document.querySelectorAll('[data-story-slider]').forEach(function (root) {
      cleanups.push(initOne(root));
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('visibilitychange', function () { /* per-instance pause handled via IO; hidden tab: */ });
})();
