# Evals

`scenarios.json` holds prompts that tempt the usual failures (monorepo, Tailwind/Astro, Vercel, Fastify, scaffolding before approval, ignoring the market).

Run: give a fresh agent this skill's `SKILL.md` + `references/` + `templates/registry.json`, the scenario `prompt`, then the `answers` as the owner's reply. Ask it to produce its full output **without executing anything**. Score each `expected` item (met / partly / missed) and each `forbidden` item (absent / present).

Baseline (2026-11-06, no skill): bar-loyalty chose a Turborepo monorepo, Vite SPAs, Fastify/Hono and Vercel/Railway; coffee-landing chose Astro + Tailwind on Vercel. Both ignored registered templates and the product-root layout.
