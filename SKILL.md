---
name: product-architect
description: Use when starting a new product or project from an idea, choosing a tech stack, splitting a product into web / backend / bot / mobile / admin parts, or scaffolding repos from templates. Triggers - "new project", "start a product", "pick a stack", "what stack for", "architecture for my app/SaaS/bot/landing", "scaffold", "новый проект", "подбери стек", "создай проект", "с чего начать", "какой стек выбрать".
---

# Product Architect

Turns a product idea into: parts → stack per part → registered templates → a product root on disk (or exact manual steps). Grounded in the owner's proven defaults, not generic popularity.

**Core principle:** reuse the owner's templates and defaults; deviate only on a condition that is true for this product now, and say so in one line.

## Inputs this skill relies on

| File | Load when |
|---|---|
| `references/intake-questions.md` | Step 1 |
| `references/owner-defaults.md` | Steps 2–3 (always) |
| `references/decision-rules.md` | Step 3 (always) |
| `references/markets.md` | Step 3, only the section for the product's market |
| `references/output-templates.md` | Steps 4–7 |
| `templates/registry.json` | Step 4 |

## Workflow

### 1. Intake
1. Restate the idea in 3 lines (who, problem, core action).
2. Ask up to 5 questions from `intake-questions.md` that change the stack, each with your default. Market/jurisdiction is always asked unless stated: it changes legal, payments, auth and hosting.
3. "Just pick" / "сам выбери" → no more questions; continue with defaults stated aloud.

### 2. Decompose
List parts with one-line responsibilities. Monolith first: a separate backend only when `decision-rules.md` §2 says so. A Telegram Mini App is the **web** part with a recipe, not a new app. Admin is a route group of the web part unless §11 says otherwise.

### 3. Decide the stack per part
For each part: owner default from `owner-defaults.md`, then check every "Deviate when" / "Choose when" against product facts. Output one line per choice:
`<part>: <choice> — <reason> (rejected: <alternative> — <why>)`.
Market constraints from `markets.md` override defaults (data residency, login methods, payment providers).

### 4. Match templates
For each part, find a `stable` template in `templates/registry.json` by `part`. Pick its recipes from the stack decisions (e.g. `payments`, `telegram-mini-app`, `postgres-drizzle`, `api-client-openapi`). Parts without a template get "build from defaults" with the exact create command.

### 5. Write the architecture and stop for approval
Create the product root (`~/DEV/<slug>/` by default; ask once if unsure) with `docs/product/architecture.md`, `docs/decisions.md` (one entry per non-obvious choice) and `scaffold-plan.json` (templates B–D). Show the owner a short summary: parts table, key decisions, monthly hosting estimate, what is deliberately left out. **Wait for an explicit go-ahead.**

### 6. Scaffold or instruct
- **Scaffold (default):** `node scripts/scaffold.mjs --plan <root>/scaffold-plan.json` (dry run) → show steps → after "yes", rerun with `--execute`. Then run each part's `verify` command (registry) and report results. Write the root `CLAUDE.md` cross-repo map.
- **Manual mode** (owner said they will do it themselves): numbered steps per template E, one action each, with expected results. Do not run anything.

### 7. Handoff
List next skills per part: `/legal-kit` (plan mode, for the market) before collecting personal data; `/impeccable` or `/frontend-design` for brand tokens; `/superpowers:brainstorming` → `/superpowers:writing-plans` for the first feature; `/nestjs-best-practices` + `/supabase-postgres-best-practices` for backend work. If the owner asks for an onboarding prompt, follow the handoff standard (template F).

## Hard rules

- Never push, create remote repositories, deploy, buy domains/services, apply migrations or commit without the owner's explicit "yes" for that action.
- Never scaffold before the architecture summary is approved.
- One repo per part inside the product root. No monorepo unless `owner-defaults.md` "Deviate when" applies and you said so.
- Web parts use the registered web template (SCSS tokens, no Tailwind). A different web stack needs a stated, product-specific reason.
- Hosting: VPS + Docker by default with a cost estimate; managed platforms only on the owner's request.
- Repo content in English; talk to the owner in their language.

## Red flags: stop and re-check

| Thought | Reality |
|---|---|
| "Turborepo keeps types shared" | Owner shares types via OpenAPI between separate repos. |
| "Astro/Vite/Tailwind is lighter for this landing" | The template is what the owner and agents already know; one stack wins. |
| "Fastify/Hono is simpler than NestJS" | Separate backend = NestJS + Prisma (owner default). In-app logic = route handlers + Drizzle. |
| "Vercel/Railway is easiest" | Owner hosts on a VPS with Docker; Vercel only for previews. |
| "I'll set up the repo now and refine later" | Architecture approval first, dry run second, `--execute` third. |
| "Market doesn't matter for the stack" | It decides data residency, login methods, payments, hosting region. |

## Extending

New template repo (backend, bot, mobile) → add an entry to `templates/registry.json` (`part`, `source`, `install`, `init` with placeholders, `verify`, `status: stable`). SKILL.md does not change. Run `pnpm test` in this repo after editing scripts.
