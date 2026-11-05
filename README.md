# product-architect

Claude skill: from a product idea to parts → stack per part → scaffolded repos from registered templates (or exact manual steps). Encodes the owner's defaults (Next.js web template, NestJS + Prisma backends, grammY bots, Expo mobile, VPS + Docker hosting) and decision rules, instead of generic "popular stack" answers.

## Install

```bash
ln -s ~/DEV/SKILLS/product-architect ~/.agents/skills/product-architect
ln -s ../../.agents/skills/product-architect ~/.claude/skills/product-architect
```

Use: "новый проект: <idea>", "подбери стек для ...", or `/product-architect`.

## Layout

| Path | What |
|---|---|
| `SKILL.md` | Workflow and hard rules |
| `references/` | intake questions, owner defaults, decision rules, markets, output templates |
| `templates/registry.json` | Templates the skill can scaffold from (add new ones here) |
| `scripts/scaffold.mjs` | Deterministic scaffold from `scaffold-plan.json` (dry run unless `--execute`) |
| `evals/` | Scenario prompts with expected decisions |

## Add a template

1. Make the template repo with an init command that takes `{slug} {title} {description} {url} {locale} {ci} {recipes}` placeholders it needs.
2. Add an entry to `templates/registry.json` with `part`, `source.local`/`source.git`, `install`, `init`, `verify`, `status: "stable"`.
3. `pnpm test`, then dry-run `node scripts/scaffold.mjs --plan <plan.json>`.

## Develop

```bash
pnpm test                                     # node --test, no dependencies
node scripts/scaffold.mjs --plan plan.json    # dry run
```
