# Decision rules

Each rule: **Default**, **Choose when** (observable condition), and what it changes. Simplest option first; add complexity only for a condition that is true now, not "maybe later".

## 1. Rendering: SSR/static vs SPA
- **Default:** Next.js server rendering (static where possible) from the web template.
- **Choose a client-heavy SPA approach when:** average session > ~10 minutes **and** 10+ updates of the same data per session (editors, dashboards, games). Even then keep Next, push interactivity into client islands; a separate Vite SPA only inside a native shell (Capacitor) or Electron.
- Content/e-commerce/landing sites fail the SPA test: keep JS small.
- Smooth page transitions alone do not justify an SPA: use view transitions as progressive enhancement. A SPA-like shell is justified when state must survive navigation (editors, live media, open sockets).

## 2. Monolith vs services
- **Default:** one web app (modular monolith) with route handlers.
- **Choose a separate backend when:** ≥2 clients share the domain (web + bot/mobile), queue-driven or long-running work, several scheduled jobs, or many inbound webhooks.
- **Stay in-app when:** the only background need is one light scheduled task (e.g. a weekly digest): a route handler protected by a secret, called by host cron or a CI schedule.
- **Never:** microservices for a new product; split later along boundaries that proved stable.

## 3. Data store and ORM
- **Default:** PostgreSQL.
- **Drizzle** when the data lives inside the Next app (SQL-first, light). **Prisma** inside NestJS (schema-first, generated client, migrations workflow the owner already uses).
- **SQLite (libsql + Drizzle)** when single-instance, small, mostly-read, and losing ops overhead matters (games, promos).
- **Redis** only with a concrete use: BullMQ queues, rate limits, sessions at scale.

## 4. BaaS vs own backend
- **Default:** own Postgres (+ NestJS when rule 2 says so).
- **Choose Supabase when:** MVP must ship in days, needs auth + storage + realtime, logic fits RLS + a few functions, and data residency is acceptable for the market.

## 5. Auth
- **Default:** in the backend if there is one (JWT access + httpOnly refresh via BFF route handlers); otherwise `better-auth` in the web app.
- Login methods are market-dependent (some markets restrict foreign identity providers): check `markets.md` and `/legal-kit`.
- Telegram products: inside the Mini App, identity comes from server-validated `initData`; link accounts across channels with a one-time code. Whether that may be the *only* account login depends on the market (RU: keep phone OTP as the account key and flag Telegram identity to `/legal-kit`).

## 6. Realtime / local-first
- **Default:** none; refetch on focus/interval via TanStack Query.
- **Choose SSE/WebSocket when:** live collaboration, chat, live dashboards with second-level freshness.
- **Choose local-first sync engines only when:** offline-first field work or collaborative editing is the product. Never for payments or strict permissions.

## 7. Background jobs
- **Default:** none.
- **Choose BullMQ (Redis) in NestJS when:** work outlives a request (emails, imports, webhooks retries, scheduled tasks). Cron-only small jobs: `@nestjs/schedule`.

## 8. Payments
- **Default:** provider-agnostic module (recipe `payments`), provider chosen by market in `markets.md`. Merchant-of-record (Paddle/LemonSqueezy) when selling software internationally as a solo dev (they handle VAT).
- Subscriptions: provider-managed billing; in-app cancel; server-side prices only.

## 9. Mobile
- See owner-defaults: Expo greenfield; Capacitor to wrap existing web; Flutter when native maps decide; Swift iOS-only.
- **Choose a Telegram Mini App instead of mobile when:** audience already lives in Telegram, no app-store presence needed, feature set fits a WebView.

## 10. Hosting
- **Default:** one VPS per product (Docker Compose), region chosen by market and data residency. Estimate monthly cost and say it.
- **Choose managed platforms when:** owner explicitly wants zero ops and the budget allows; Vercel for previews only.
- Self-hosted Postgres backups to object storage in the same jurisdiction.

## 11. Admin
- **Default:** admin route group in the web app (recipe `admin-ui`).
- **Separate admin repo when:** different auth domain/team, or the admin is a product itself.

## 12. i18n
- Always on (web template ships next-intl). **Multiple locales when:** the audience spans languages now (e.g. DE + EN in Germany); otherwise one locale, add later via recipe.

## 13. Performance and scaling
Every item here is a hypothesis until measured on the product; the web template's `docs/performance.md` holds the budgets and the measurement method. Put the budgets into the architecture doc (template B) so later agents test against them.
- **Default:** one instance per part, no CDN, no read cache, no distributed tracing. Public web parts: Core Web Vitals at p75 (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1), RUM via `next/web-vitals` behind analytics consent. APIs: p95 target for the key endpoints, a deadline on every outbound call, server pagination.
- **Region:** app and database in the same region, chosen by market and data residency (§10). Latency per query multiplies by sequential queries.
- **CDN when:** the audience is spread far from the server region **and** public pages/assets dominate traffic. Never for personal responses (`private, no-store`).
- **Read cache (Redis cache-aside) when:** a repeated, staleness-tolerant read is measured as the bottleneck after pagination, query and index fixes. Keys include tenant and permissions; plan stampede protection and cache outage. This is a "concrete use" for Redis under §3.
- **Second instance / load balancer when:** one instance's limit is measured, or the product needs high availability. The database stays the shared bottleneck; rate limits and sessions then need a shared store.
- **Queue when:** work outlives a request (§7). The user sees a status: acceptance is not completion.
- **Tracing (OpenTelemetry) when:** there is a process boundary (separate backend, worker, queue). One process: structured logs + profiler. Export through a Collector; no personal data in span attributes.
- **Never as a stack driver:** HTTP/3, edge runtimes or a "faster" framework without a measured bottleneck they fix.
