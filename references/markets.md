# Markets

Load only the section for the product's market(s). Legal content itself comes from `/legal-kit` (run its plan mode for the market before collecting personal data); this file lists only what changes the **stack**.

## Russia (RU users)
- **Data residency:** personal data of RU citizens must be first written to databases in Russia (152-FZ). → Postgres on an RU VPS; no foreign BaaS/auth/CRM/form tools as the first write; logs/backups/APM in RU or without PD.
- **Login methods:** foreign identity providers (Google, Apple, GitHub) are restricted for RU users; allowed: phone OTP, Gosuslugi/ESIA, qualifying RU providers (VK ID, Yandex ID, Sber ID if they qualify), own email+password is disputed. Telegram as the account login is likely non-compliant (Mini App `initData` inside Telegram: flag to `/legal-kit`, keep phone OTP as the account key).
- **Payments:** YooKassa, T-Bank, CloudPayments, SBP; online-cash-register receipts (54-FZ) via provider; Mir/SBP acceptance above revenue threshold. Bank APIs may need the Russian Trusted Root CA in the container trust store.
- **Analytics:** Yandex Metrika (consent-gated); foreign analytics create cross-border transfer obligations.
- **Messengers:** Telegram widespread; MAX bots only for verified RU residents.
- **Ads:** ad marking (erid via ORD) for third-party/display ads.
- Hosting: RU VPS (Timeweb, Selectel, VDSina, Beget); S3 backups in RU.

## EU / Germany
- **GDPR:** consent for non-essential cookies/analytics (prefer cookieless Plausible/Umami → no banner), DPA with processors, EU hosting preferred (Hetzner, Scaleway, OVH).
- **Germany:** Impressum + Datenschutzerklärung mandatory; self-host fonts (no Google Fonts CDN); double opt-in for newsletters.
- **Payments:** Stripe (SEPA, cards), PayPal; merchant-of-record for digital products (VAT OSS).
- **Accessibility:** European Accessibility Act for consumer e-commerce/services → WCAG 2.2 AA (template's axe checks help).
- Locales usually local language + EN.

## United States
- Privacy: state laws (CCPA/CPRA etc.): privacy policy, opt-out of sale/sharing, honor GPC signal. Children under 13: COPPA.
- Payments: Stripe; sales tax via merchant-of-record or Stripe Tax.
- Accessibility: ADA litigation risk → WCAG 2.2 AA.

## Global / international SaaS
- Merchant-of-record (Paddle, LemonSqueezy) to avoid per-country tax registration.
- Hosting in EU or US by main audience; privacy policy + terms + cookie consent if any tracking.
- Social login (Google/Apple/GitHub) fine **unless** an RU audience is in scope.

## Unknown market
Ask (intake #1). Until answered, do not choose payments, auth providers or hosting region.
