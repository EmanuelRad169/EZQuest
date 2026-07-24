/*
 * shopify-contact-submit.js
 * Shared helper for posting Shopify contact/customer form submissions.
 * Centralizes the /contact endpoint, FormData shape, and — importantly —
 * rejects on any non-2xx response so callers can show a real error state
 * instead of a false "success". Used by notify.js and the newsletter popup.
 *
 * Usage:
 *   window.ezSubmitContact({
 *     email: 'a@b.com',
 *     formType: 'customer',            // optional, defaults to 'customer'
 *     tags: 'newsletter,welcome10',    // optional
 *     body: 'Free-text note',          // optional
 *     extra: { 'contact[Company]': 'X' } // optional extra fields
 *   }).then(onSuccess).catch(onError);
 */
(function () {
  'use strict';

  window.ezSubmitContact = function ezSubmitContact(fields) {
    fields = fields || {};

    var root = (window.EZRoutes && window.EZRoutes.root) ? window.EZRoutes.root : '/';
    var url = root.replace(/\/?$/, '/') + 'contact';

    var fd = new FormData();
    fd.append('form_type', fields.formType || 'customer');
    fd.append('utf8', '✓');
    fd.append('contact[email]', fields.email);
    if (fields.tags) fd.append('contact[tags]', fields.tags);
    if (fields.body) fd.append('contact[body]', fields.body);
    if (fields.extra) {
      Object.keys(fields.extra).forEach(function (key) {
        fd.append(key, fields.extra[key]);
      });
    }

    return fetch(url, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Contact submit failed: ' + response.status);
      }
      return response;
    });
  };

  /*
   * ezTrackFormSubmit — fire a conversion event on a successful form submit.
   * Safe no-op if GA4 (gtag), GTM (dataLayer) or Meta (fbq) are absent, so it
   * never throws. Pass a formType so events can be told apart in reporting.
   */
  window.ezTrackFormSubmit = function ezTrackFormSubmit(formType, extra) {
    formType = formType || 'form';
    var params = { form_type: formType, form_location: (location && location.pathname) || '' };
    if (extra) { Object.keys(extra).forEach(function (k) { params[k] = extra[k]; }); }
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', params);
      } else {
        window.dataLayer = window.dataLayer || [];
        var dl = { event: 'form_submit' };
        Object.keys(params).forEach(function (k) { dl[k] = params[k]; });
        window.dataLayer.push(dl);
      }
    } catch (e) { /* analytics must never break the form */ }
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { content_name: formType });
      }
    } catch (e) { /* no-op */ }
    // Emit a Shopify analytics event so a Customer Events custom pixel can
    // forward form submits to GA4 when GA4 is connected via the Google channel
    // (sandboxed pixel, so no global gtag on the page).
    try {
      if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === 'function') {
        window.Shopify.analytics.publish('ez_form_submit', params);
      }
    } catch (e) { /* no-op */ }
  };
})();
