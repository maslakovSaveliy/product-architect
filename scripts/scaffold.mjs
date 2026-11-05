#!/usr/bin/env node
// Scaffolds a product from a plan file. Dry run by default.
//   node scripts/scaffold.mjs --plan /path/plan.json            # print steps
//   node scripts/scaffold.mjs --plan /path/plan.json --execute  # run them
// plan.json: { "productRoot": "~/DEV/coffee", "parts": [{ "part": "web", "dir": "web",
//   "slug": "coffee-web", "title": "Coffee", "description": "...", "url": "https://...",
//   "locale": "en", "ci": "github", "recipes": ["payments"] }] }
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { expandHome, planScaffold } from './lib/plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({
  options: {
    plan: { type: 'string' },
    registry: { type: 'string', default: join(here, '../templates/registry.json') },
    execute: { type: 'boolean', default: false },
  },
});

if (!values.plan) {
  console.error('Usage: node scripts/scaffold.mjs --plan <plan.json> [--execute]');
  process.exit(1);
}

const plan = JSON.parse(readFileSync(expandHome(values.plan), 'utf8'));
const registry = JSON.parse(readFileSync(values.registry, 'utf8'));

let steps;
try {
  steps = planScaffold({ ...plan, registry });
} catch (error) {
  console.error(`✖ ${error.message}`);
  process.exit(1);
}

const describe = (step) => {
  switch (step.kind) {
    case 'mkdir':
      return `mkdir -p ${step.cwd}`;
    case 'git-init':
      return `git init -b main  (in ${step.cwd})`;
    case 'clone':
      return `git clone --depth 1 ${step.args.from} ${step.cwd}`;
    case 'rm-git':
      return `rm -rf ${join(step.cwd, '.git')}`;
    case 'run':
      return `${step.args.command}  (in ${step.cwd})`;
    case 'write':
      return `write ${join(step.cwd, step.args.path)}`;
    default:
      return step.kind;
  }
};

if (!values.execute) {
  console.info('Dry run. Steps:');
  steps.forEach((step, i) => console.info(`  ${i + 1}. ${describe(step)}`));
  console.info('\nRe-run with --execute after the owner approves.');
  process.exit(0);
}

const env = { ...process.env, LEFTHOOK: '0' };
for (const [i, step] of steps.entries()) {
  console.info(`→ ${i + 1}/${steps.length} ${describe(step)}`);
  switch (step.kind) {
    case 'mkdir':
      mkdirSync(step.cwd, { recursive: true });
      break;
    case 'git-init':
      execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: step.cwd, stdio: 'inherit' });
      break;
    case 'clone': {
      const isUrl = /^(https?|git|ssh):|^git@/.test(step.args.from);
      execFileSync('git', ['clone', '-q', ...(isUrl ? ['--depth', '1'] : []), step.args.from, step.cwd], {
        stdio: 'inherit',
      });
      break;
    }
    case 'rm-git':
      rmSync(join(step.cwd, '.git'), { recursive: true, force: true });
      break;
    case 'run':
      execFileSync('sh', ['-c', step.args.command], { cwd: step.cwd, stdio: 'inherit', env });
      break;
    case 'write':
      mkdirSync(dirname(join(step.cwd, step.args.path)), { recursive: true });
      writeFileSync(join(step.cwd, step.args.path), step.args.content);
      break;
    default:
      throw new Error(`Unknown step ${step.kind}`);
  }
}
console.info('✔ Scaffold complete. Nothing committed or pushed.');
