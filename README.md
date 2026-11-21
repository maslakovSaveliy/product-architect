# product-architect

Agent skill: from a product idea to parts → stack per part → scaffolded repos from registered templates (or exact manual steps). Encodes the owner's defaults (Next.js web template, NestJS + Prisma backends, grammY bots, Expo mobile, VPS + Docker hosting) and decision rules, instead of generic "popular stack" answers.

## Install

With the [skills CLI](https://skills.sh) (Claude Code and other agents it supports):

```bash
npx skills add maslakovSaveliy/product-architect -g
```

`-g` installs it for your user, so every project sees it; drop `-g` to install into the current project only. Update later with `npx skills update product-architect`.

Manual install for Claude Code:

```bash
git clone https://github.com/maslakovSaveliy/product-architect.git ~/.claude/skills/product-architect
```

Scaffolding needs git, Node 24 and pnpm; the web part is cloned from [web-template](https://github.com/maslakovSaveliy/web-template).

## Use

Ask your agent "new project: <idea>", "pick a stack for ...", "новый проект: ...", or run `/product-architect`. The skill asks up to four questions (market is always one of them), shows parts, stack decisions with reasons, a performance budget and a monthly hosting estimate, and waits for your go-ahead. Then it scaffolds (dry run first) or writes manual steps.

## Make it yours

The defaults in `references/owner-defaults.md` are the author's (Next.js web template, NestJS + Prisma backends, grammY bots, Expo mobile, VPS + Docker hosting). Fork the repo, change that file and `templates/registry.json` to your stack, and install your fork the same way (`npx skills add <you>/product-architect -g`).

Useful? A star helps other people find it. Bugs and ideas go to [issues](https://github.com/maslakovSaveliy/product-architect/issues).

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

Work on a clone and link it into your skills folders instead of installing a copy:

```bash
ln -s "$PWD" ~/.agents/skills/product-architect
ln -s ../../.agents/skills/product-architect ~/.claude/skills/product-architect

pnpm test                                     # node --test, no dependencies
node scripts/scaffold.mjs --plan plan.json    # dry run
```
