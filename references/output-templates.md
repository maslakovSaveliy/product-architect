# Output templates

## A. Product root
```
~/DEV/<product-slug>/            docs-only git repo
  AGENTS.md                      cross-repo map: parts, paths, how they talk, shared rules (canonical, every agent)
  CLAUDE.md, GEMINI.md           stubs: a note + `@AGENTS.md` (Claude Code and Gemini import it; Codex/Cursor read AGENTS.md)
  docs/agents/memory.md          shared memory for all agents (same format as the web template's)
  docs/product/architecture.md   template B
  docs/decisions.md              template C
  web/  backend/  bot/  app/     each its own git repo (ignored by the root .gitignore)
```

## B. `docs/product/architecture.md`
```markdown
# <Product> — architecture

## Idea
<3 lines: who, problem, core action>

## Market and constraints
<market(s), legal drivers (from markets.md), budget, deadline>

## Parts
| Part | Repo | Stack | Template | Responsibility |
|---|---|---|---|---|
| web | web/ | Next.js 16 (web-template) + recipes: payments, telegram-mini-app | web-next | guest UI, Mini App, admin route group |
| backend | backend/ | NestJS 11 + Prisma 7 + Postgres 17 + BullMQ | — (defaults) | domain, auth, ledger, jobs |

## How parts talk
<web → backend REST /api/v1 via OpenAPI client; bot → backend; webhooks → backend>

## Data
<core entities, where personal data lives (region), money model>

## Performance budget
<per part: public web = CWV p75 (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) + first-load JS budget; API = p95 for key endpoints; which responses are personal (private, no-store) vs shareable; how it is measured (RUM behind consent, traces only with a process boundary)>

## Hosting and cost
<VPS region/size, ~€ or ₽ per month, registry, backups>

## Deliberately not now
<things rejected for the MVP and the signal to revisit>

## Next steps
<legal-kit plan for market; brand via impeccable; first feature via brainstorming>
```

## C. Decision entry (`docs/decisions.md`)
```markdown
## D-NNN · YYYY-MM-DD · <title>
- **Decision:** ...
- **Why:** <rule from decision-rules.md + product fact>
- **Alternatives:** <rejected option — reason>
- **Revisit when:** <observable signal>
```

## D. Scaffold plan (`<product-root>/scaffold-plan.json`, input to scripts/scaffold.mjs)
```json
{
  "productRoot": "~/DEV/bar-points",
  "parts": [
    { "part": "web", "dir": "web", "slug": "bar-points-web", "title": "Bar Points",
      "description": "Loyalty for bars", "url": "https://barpoints.example", "locale": "ru",
      "ci": "github", "recipes": ["telegram-mini-app", "api-client-openapi", "admin-ui"] },
    { "part": "backend", "dir": "backend", "slug": "bar-points-api", "title": "Bar Points API",
      "stack": "NestJS 11 + Prisma 7 + PostgreSQL 17 + BullMQ", "createCommand": "pnpm dlx @nestjs/cli new bar-points-api --package-manager pnpm --strict" }
  ]
}
```

## E. Manual mode (owner builds it)
Numbered, one action per step, copy-pasteable commands, each with "expected result":
```
1. Create the product folder
   mkdir -p ~/DEV/bar-points && cd ~/DEV/bar-points && git init -b main
   → empty repo on main
2. Web part from the template
   git clone https://github.com/maslakovSaveliy/web-template.git web && rm -rf web/.git
   cd web && pnpm install && pnpm template:init --name bar-points-web --title "Bar Points" --locale ru --keep-recipes telegram-mini-app,api-client-openapi,admin-ui
   git init -b main && pnpm exec lefthook install
   → pnpm verify passes
...
```

## F. Handoff prompt
Follow the owner's handoff standard (in every web-template repo: `docs/agents/handoff.md`): one ```text block in chat, facts verified, sections role → context → state → read order → rules → pitfalls → task → skills → "study, report, wait".
