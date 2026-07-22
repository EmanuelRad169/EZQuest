(function () {
  var container = document.querySelector('.shopify-policy__container');
  if (!container) return;

  var path = window.location.pathname;
  var handle = path.split('/').pop() || '';

  function isActive(h) {
    return handle === h ? ' is-active' : '';
  }

  var sidebarHTML = '<aside class="policy-sidebar">'
    + '<div class="policy-sidebar__card">'
    + '<p class="policy-sidebar__label">Legal documents</p>'
    + '<nav class="policy-sidebar__nav">'
    + '<a href="/policies/privacy-policy" class="policy-sidebar__link' + isActive('privacy-policy') + '">Privacy Policy</a>'
    + '<a href="/policies/terms-of-service" class="policy-sidebar__link' + isActive('terms-of-service') + '">Terms of Service</a>'
    + '<a href="/policies/refund-policy" class="policy-sidebar__link' + isActive('refund-policy') + '">Refund Policy</a>'
    + '<a href="/pages/shipping-returns" class="policy-sidebar__link' + isActive('shipping-returns') + '">Shipping &amp; Returns</a>'
    + '<a href="/pages/cookie-policy" class="policy-sidebar__link' + isActive('cookie-policy') + '">Cookie Policy</a>'
    + '<a href="/pages/warranty" class="policy-sidebar__link' + isActive('warranty') + '">Warranty</a>'
    + '</nav>'
    + '</div>'
    + '<div class="policy-sidebar__card policy-sidebar__card--help">'
    + '<p class="policy-sidebar__help-title">Questions?</p>'
    + '<p class="policy-sidebar__help-body">We respond within 1 business day.</p>'
    + '<a href="/pages/contact" class="policy-sidebar__cta">Contact us</a>'
    + '</div>'
    + '</aside>';

  // Match the cookie-policy navy hero: add the same trust chips into the title.
  var title = container.querySelector('.shopify-policy__title');
  if (title && !title.querySelector('.shopify-policy__trust')) {
    var chips = ['Up to 2-year warranty', '30-day returns', 'Free shipping over $90'];
    var check = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var trustHTML = '<ul class="shopify-policy__trust">'
      + chips.map(function (c) { return '<li class="shopify-policy__trust-chip">' + check + '<span>' + c + '</span></li>'; }).join('')
      + '</ul>';
    title.insertAdjacentHTML('beforeend', trustHTML);
  }

  var body = container.querySelector('.shopify-policy__body');
  if (!body) return;

  var layout = document.createElement('div');
  layout.className = 'policy-native-layout';

  container.insertBefore(layout, body);
  layout.appendChild(body);
  layout.insertAdjacentHTML('beforeend', sidebarHTML);
})();
