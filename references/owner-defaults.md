# Owner defaults per part

These are the owner's proven choices from past products. Use them unless a "Deviate when" condition is true for this product; then say which condition and what you picked instead.

## Global
- **Language/runtime:** TypeScript strict everywhere, Node 24 LTS, pnpm (pinned via `packageManager`).
- **Repos:** one product root `~/DEV/<product>/` = docs-only git repo; **each part is its own git repo inside it** (`web/`, `backend/`, `bot/`, `app/`, `admin/`). Shared types travel through OpenAPI, not shared packages. **No monorepo/Turborepo by default.**
  - Deviate when: several web apps share a design system and ship together (then pnpm workspaces + turbo).
- **Quality:** Biome (no ESLint/Prettier), lefthook + commitlint + secretlint, tests mandatory for every feature (Vitest/Jest + Playwright), CI gates merges.
- **Git:** branches `feat/<slug>`, `fix/<slug>`; Conventional Commits; no AI attribution; commit/push/merge only on owner's word.
- **Hosting:** cheap VPS per product (Docker Compose + Caddy/nginx), images built in CI and tagged by sha, manual deploy with health gate. Vercel only for throwaway previews.
- **Docs in each repo:** `AGENTS.md` (canonical, read by every agent) + `CLAUDE.md`/`GEMINI.md` stubs with `@AGENTS.md` + `.cursor/rules` pointing to AGENTS.md, `docs/agents/memory.md` (shared memory), `docs/decisions.md`, `docs/architecture.md`, handoff standard.

## Web (registered template `web-next`)
- **Default:** Next.js 16 App Router from `web-template`: SCSS Modules on tokens (**no Tailwind**), next-intl (all texts in messages), TanStack Query + Zod + typed fetch, Zustand for UI state, react-hook-form, Vitest + Playwright (Chromium + WebKit) + axe.
- Landings and marketing sites use the same template (forms via route handlers). One stack for everything the owner and agents already know beats a marginally lighter one.
- **Deviate when:** pure static docs/blog with zero app ambitions and no forms → still the template unless the owner asks; an app that must run fully offline in a native shell → see Mobile.

## Backend
- **Default (no separate backend):** route handlers / server actions in the web app + Postgres + Drizzle (recipe `postgres-drizzle`). Monolith first.
- **Separate backend when:** a bot or mobile app shares the domain, background jobs/queues, webhooks from many providers, heavy domain logic, or a second client. Then: **NestJS 11 + Prisma 7 + PostgreSQL 17 + BullMQ/Redis** (`createCommand`: `pnpm dlx @nestjs/cli new <slug> --package-manager pnpm --strict`, then swap ESLint/Prettier for Biome), zod-validated env, pino logs, helmet, throttler, Swagger/OpenAPI (`/api/v1`), Jest unit + e2e per endpoint (200/400/401/403 IDOR).
- **BaaS (Supabase) when:** prototype/MVP with auth+storage+realtime needed in days and little custom logic, and the data residency of the chosen deployment fits the market. Prefer self-hosted for regulated markets.
- Performance baseline: deadline on every outbound call (retry only idempotent requests), cursor or keyset pagination with a max page size, no N+1 (query-count test), DB pool size × replicas below the connection limit. Caches and replicas only per `decision-rules.md` §13.
- Money: append-only ledger, integer minor units / Decimal, idempotency keys; webhooks verified (signature + IP allowlist where published).
- IDs: UUID v7 for public ids; Telegram ids as bigint.
- Local dev ports avoid defaults: Postgres 5433, Redis 6380.

## Bot
- **Default:** grammY + TypeScript, thin client of the backend (no business logic in the bot), conversations plugin for flows, webhook mode in prod.
- **createCommand:** `pnpm init && pnpm add grammy @grammyjs/conversations zod && pnpm add -D typescript tsx @biomejs/biome vitest lefthook @types/node`, then copy AGENTS.md sections from the web part and adapt commands.
- **Deviate when:** MAX/other messenger required by market (separate adapter in backend).

## Telegram Mini App
- **Default:** the web template + recipe `telegram-mini-app` (initData validated server-side, theme params mapped to tokens). Not a separate Vite SPA.

## Mobile
- **Expo (React Native) + expo-router** for greenfield iOS + Android (+ web build if useful).
- **Capacitor** when wrapping an existing React web app quickly.
- **Flutter** when native maps/SDKs decide it (e.g. Yandex MapKit).
- **Swift (SwiftUI)** for iOS-only products that need deep platform features.

## Admin / back office
- **Default:** route group in the web app with recipe `admin-ui` (Next + Mantine + mantine-datatable + recharts). Mantine is allowed only inside the `(admin)` segment (owner prefers a ready UI kit for tables); public UI stays on SCSS tokens. Separate repo only if a different team or domain owns it.

## Desktop
- Electron + electron-vite + React (Biome, Vitest, Playwright for Electron).

## Analytics / monitoring
- Web Vitals RUM via `next/web-vitals` (no extra dependency) sent to own endpoint or the analytics tool, behind consent.
- Self-hosted PostHog or Plausible/Umami behind consent (recipe `analytics-consent`); market-specific counters (e.g. Yandex Metrika) behind their own flag. Sentry with PII off; pino/structured logs; Loki optional.
