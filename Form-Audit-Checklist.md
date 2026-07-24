# Form Audit Checklist — EZQuest

Use this to test every form on the site (Contact, Newsletter/popup, Ticket Submission, and any support forms). Run it once on **desktop** and once on a **real phone**. Check each box as you pass it.

---

## 1. Functional Testing

**Happy path**

- [ ] Fill every field with valid data and submit — the form accepts it without error.
- [ ] A clear success state appears (inline "Thanks" message, redirect, or confirmation) — the user is never left guessing.
- [ ] After success, the form clears or is replaced — you can't accidentally submit twice.
- [ ] Double-click the submit button fast — it does **not** create two submissions (button disables on submit).

**Validation errors**

- [ ] Submit with the email field empty — it blocks and shows a "required" message.
- [ ] Enter an email with no `@` (e.g. `janedoe.com`) — it blocks with an "invalid email" message.
- [ ] Enter an email with no domain (e.g. `jane@`) — it blocks.
- [ ] Leave another required field empty (name/message) — it blocks and names the missing field.
- [ ] Error messages appear **next to the field**, not just at the top, and are readable (not tiny grey text).
- [ ] Fixing the error and resubmitting works — the error clears.

**Failure handling**

- [ ] Turn off Wi-Fi mid-submit — the form shows an error, **not** a fake success. (This is the bug the shared `ezSubmitContact` helper was built to prevent — confirm it still surfaces failures.)
- [ ] Re-enable network and resubmit — it succeeds.

---

## 2. Routing & Integration (where the data goes)

- [ ] Submit a test entry, then open **Shopify Admin → Customers** — the newsletter/contact entry appears (with correct email + any consent flag).
- [ ] Confirm marketing consent is recorded correctly (subscribed vs. not) for newsletter signups.
- [ ] Check the **email notification** — the store owner inbox (or `ez@ezq.com`) receives the submission.
- [ ] Verify notification content is complete: name, email, message, and timestamp all present.
- [ ] If forms route to a helpdesk/app (Ticket Submission), confirm the ticket is actually created there.
- [ ] Check the notification **"reply-to"** is the customer's email, so you can reply directly.
- [ ] Submit from an incognito window (logged-out visitor) — routing still works for non-account users.

---

## 3. Mobile UX & Accessibility (test on real iOS + Android)

**Keyboards**

- [ ] Email field opens the **email keyboard** (visible `@` and `.` keys) → needs `type="email"` or `inputmode="email"`.
- [ ] Phone field (if any) opens the **number pad** → `type="tel"` / `inputmode="tel"`.
- [ ] Name field uses `autocapitalize` sensibly; email field does **not** auto-capitalize the first letter.
- [ ] Autofill works — the browser offers the saved email/name.

**No zoom / no clipping**

- [ ] Tapping any input does **not** trigger auto-zoom on iOS → every input's font-size is **≥ 16px**.
- [ ] The form fits the screen — no horizontal scroll, no fields cut off at the edges.
- [ ] The on-screen keyboard doesn't cover the submit button — you can still reach and tap it.
- [ ] Success/error messages are visible without scrolling into a hidden area.

**Tap targets & a11y**

- [ ] Submit button and inputs are **≥ 44×44px** tap targets (Apple HIG minimum).
- [ ] Every field has a visible, associated `<label>` (not placeholder-only).
- [ ] Tab order is logical; focus outlines are visible when tabbing.
- [ ] Field labels and errors have enough color contrast (WCAG AA, 4.5:1).
- [ ] Test with a screen reader (VoiceOver / TalkBack) — labels and errors are announced.

---

## 4. Conversion Tracking & Analytics

**GA4**

- [ ] Open **GA4 → Admin → DebugView** (or the GA4 Realtime report), then submit the form.
- [ ] Confirm a submission event fires (e.g. `generate_lead`, `sign_up`, or a custom `form_submit`) — **once**, not on page load or on every keystroke.
- [ ] Event includes useful params (form name/location) so you can tell Contact vs. Newsletter apart.
- [ ] Use the **GA4 Debugger** Chrome extension or DevTools → Network → filter `collect` to see the hit leave the browser.
- [ ] The event only fires on **success**, not when validation blocks the submit.

**Meta Pixel (if installed)**

- [ ] Install the **Meta Pixel Helper** Chrome extension.
- [ ] Submit the form — a `Lead` (or `CompleteRegistration`) event shows in the helper, fired once.
- [ ] Confirm it appears in **Meta Events Manager → Test Events**.

**Consent**

- [ ] With cookie consent **declined**, confirm tracking respects it (no pixel/GA hit, or a consent-mode signal) so you're compliant.

---

## 5. Spam Protection

- [ ] Identify what's in place: reCAPTCHA (v2/v3), hCaptcha, honeypot field, or Shopify's built-in protection.
- [ ] **Honeypot test:** inspect the form for a hidden field; fill it via DevTools and submit — the submission should be silently rejected.
- [ ] **reCAPTCHA present:** confirm the badge/checkbox loads and a real submission passes.
- [ ] **reCAPTCHA v3:** submit normally — a legitimate user is **never** blocked or shown a challenge (score threshold not too strict).
- [ ] Submit 5–6 times quickly — obvious bot behavior is throttled, but a normal person filling it twice is **not** locked out.
- [ ] Confirm spam protection doesn't add a visible layout shift or block the submit button on slow connections.
- [ ] Send one known-good real submission end-to-end after enabling protection — it still lands in Customers + inbox (Section 2).

---

## Troubleshooting Tips

- **Submission succeeds but no email arrives** → check spam/junk, verify the notification recipient in Shopify **Settings → Notifications**, and confirm the sending domain isn't failing SPF/DKIM. For app-based forms, check the app's own delivery logs.
- **"Success" shows but nothing reaches Shopify** → the front end is swallowing an error. Open DevTools → Network, submit, and check the request status (a 4xx/5xx should surface an error, not a success message).
- **iOS zooms in when tapping a field** → an input has font-size < 16px. Bump it to 16px.
- **Mobile layout clipped / button off-screen** → a fixed width or `overflow` is cutting the form; test at 320px width and let fields be fluid (`width:100%`, `max-width`).
- **Email field shows a normal keyboard (no `@`)** → the input is missing `type="email"` / `inputmode="email"`.
- **GA4 event fires twice or on page load** → the listener is bound on render or not scoped to the success callback; bind it only to the successful submit.
- **Legit users blocked by spam protection** → reCAPTCHA v3 threshold too high, or the reCAPTCHA script failed to load (check console for a network/CSP error).
- **Validation lets a bad email through** → server-side (Shopify) will still reject it, but add client-side `type="email"` validation so the user gets instant feedback.
