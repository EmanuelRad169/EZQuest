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
})();
