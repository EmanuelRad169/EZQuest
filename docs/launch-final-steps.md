# EZQuest — Final Launch Steps (Tidio pre-chat + custom domain)

These two are external-account actions (Tidio dashboard, Shopify admin domains) that can't be done via the API. Each takes ~2–5 minutes. Exact click-paths below.

---

## 1. Make the Tidio pre-chat email OPTIONAL (remove the friction gate)

Right now a shopper must enter an email before they can ask a single pre-sale question. Make it optional so questions flow instantly.

1. Go to **tidio.com** → log in → open your project dashboard.
2. Left sidebar → **Settings** (gear) → **Chat Page / Widget** → **Pre-chat survey** (may be under "Channels → Live Chat → Pre-chat form").
3. Find the **Email** field in the pre-chat form.
4. Toggle it from **Required → Optional** (or turn the whole pre-chat survey **Off** if you'd rather collect the email inside the conversation).
5. **Save.**
6. Verify on the storefront: open the chat bubble — you should be able to type a message immediately without filling an email first.

*Optional while you're there:* set business hours (Settings → Operating hours) and rename the widget greeting from the generic "Hi there / Welcome to our website" to something EZQuest-branded. These were flagged in the earlier Tidio audit.

---

## 2. Connect the custom domain (branded URL + SEO + trust)

The store is still on `ezquest-4.myshopify.com`. A branded domain is a launch blocker for credibility and SEO.

### If you already own the domain (e.g. at GoDaddy/Namecheap):
1. Shopify admin → **Settings → Domains**.
2. Click **Connect existing domain**.
3. Enter your domain (e.g. `ezquest.com` or `shop.ezquest.com`).
4. Shopify shows the DNS records to add. In your registrar's DNS settings:
   - Point the **A record** for `@` to Shopify's IP: **23.227.38.65**
   - Point the **CNAME** for `www` to **shops.myshopify.com**
5. Back in Shopify → **Verify connection** (DNS can take 15 min–48 hrs to propagate).
6. Once verified, set it as **Primary domain** and enable **"Redirect all traffic to this domain."**
7. Confirm **SSL** shows active (Shopify issues it automatically).

### If you don't own a domain yet:
1. Shopify admin → **Settings → Domains → Buy new domain** → search and purchase (~$11–20/yr). It auto-configures — no DNS work.

### After connecting (don't skip):
- **Online Store → Preferences:** confirm the homepage title/meta description are set (branded, not the myshopify URL).
- Re-point the **GA4 pixel** stays as-is (it tracks by store, domain-independent).
- Update the **Shopify checkout/customer-accounts domain** if prompted.
- Note: the theme's GitHub↔Shopify sync is unaffected by the domain change.

---

## Quick verification checklist

- [ ] Storefront chat: can send a message without entering an email first.
- [ ] `https://yourdomain.com` loads the store with a padlock (SSL).
- [ ] `www` and the apex both redirect to the primary domain.
- [ ] Homepage `<title>` is branded, not `ezquest-4.myshopify.com`.
- [ ] Turn OFF the storefront password (Online Store → Preferences) when you're ready to go live.
