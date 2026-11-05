# Intake questions

Ask only questions whose answer changes the decomposition or a stack choice. Skip anything the idea already answers. Max 5. Each question carries your proposed default so the owner can answer "ok".

Delivery: if an interactive question tool is available (e.g. AskUserQuestion: ≤4 questions, 2–4 options each, recommended option first), use it. Otherwise one numbered message: `N. Question? → My default: X (because Y)`.

## Bank (pick by impact, in this order)

| # | Question | Changes |
|---|---|---|
| 1 | Who uses it and where (country/market, language)? | legal requirements, payment providers, hosting region, login methods, locales |
| 2 | Which surfaces: web, Telegram (bot / Mini App), iOS/Android, desktop, admin? | parts list, templates |
| 3 | Does it take money? One-off, subscriptions, marketplace payouts? Which countries' cards? | payments provider, receipts/VAT, backend need |
| 4 | Accounts and data: who logs in (guests, staff, admins), what personal data is stored? | auth, roles, legal plan, data residency |
| 5 | What must happen outside a request: notifications, scheduled jobs, integrations (POS, CRM, email)? | separate backend + queues |
| 6 | Scale and freshness: expected users in 6 months, anything realtime? | DB, realtime, hosting size |
| 7 | Deadline, budget for hosting per month, who else works on it? | BaaS vs own backend, managed vs VPS |
| 8 | Existing assets: domain, brand, Figma, current code or data to migrate? | design handoff, migration part |
| 9 | Scaffold for you, or instructions so you do it yourself? | mode of step 6 |

If the owner says "just pick" / "сам выбери": stop asking, state each default in one line, continue.
