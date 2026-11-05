import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { findTemplate, planScaffold, renderInit, shellQuote } from './plan.mjs';

const registry = {
  templates: [
    {
      id: 'web-next',
      part: 'web',
      status: 'stable',
      source: { local: '/tpl/web', git: 'https://example.com/web.git' },
      install: 'pnpm install',
      init: 'pnpm template:init --name {slug} --title {title} --ci {ci} --keep-recipes {recipes}',
      verify: 'pnpm verify',
    },
  ],
};

const tmp = () => mkdtempSync(join(tmpdir(), 'pa-'));

describe('findTemplate', () => {
  it('finds a stable template by part', () => {
    assert.equal(findTemplate(registry, 'web')?.id, 'web-next');
    assert.equal(findTemplate(registry, 'bot'), undefined);
  });
});

describe('shellQuote / renderInit', () => {
  it('quotes values safely', () => {
    assert.equal(shellQuote("Bob's Café"), `'Bob'\\''s Café'`);
  });

  it('renders placeholders and drops flags without values', () => {
    const cmd = renderInit(registry.templates[0].init, {
      slug: 'shop',
      title: 'Кофейня',
      ci: 'github',
      recipes: undefined,
    });
    assert.equal(cmd, "pnpm template:init --name 'shop' --title 'Кофейня' --ci 'github'");
  });
});

describe('planScaffold', () => {
  it('web part from local source: mkdir, copy, install, init, git init', () => {
    const root = join(tmp(), 'coffee');
    const steps = planScaffold({
      productRoot: root,
      parts: [{ part: 'web', dir: 'web', slug: 'coffee-web', title: 'Coffee', ci: 'github' }],
      registry,
      exists: (p) => p === '/tpl/web',
    });
    assert.deepEqual(
      steps.map((s) => s.kind),
      ['mkdir', 'git-init', 'clone', 'rm-git', 'git-init', 'run', 'run', 'write'],
    );
    assert.equal(steps[2].args.from, '/tpl/web');
    assert.equal(steps.at(-1)?.args.path, '.gitignore');
    assert.match(steps.at(-1)?.args.content ?? '', /^\/web\/$/m);
  });

  it('falls back to the git source when the local copy is missing', () => {
    const steps = planScaffold({
      productRoot: join(tmp(), 'p'),
      parts: [{ part: 'web', dir: 'web', slug: 'p-web', title: 'P' }],
      registry,
      exists: () => false,
    });
    assert.equal(steps.find((s) => s.kind === 'clone')?.args.from, 'https://example.com/web.git');
  });

  it('part without a template becomes a README with build-from-defaults note', () => {
    const steps = planScaffold({
      productRoot: join(tmp(), 'p'),
      parts: [{ part: 'bot', dir: 'bot', slug: 'p-bot', title: 'P bot', stack: 'grammY + TypeScript' }],
      registry,
      exists: () => false,
    });
    const write = steps.find((s) => s.kind === 'write' && s.args.path !== '.gitignore');
    assert.equal(write?.args.path, join('bot', 'README.md'));
    assert.match(write?.args.content ?? '', /grammY/);
  });

  it('refuses a non-empty target directory', () => {
    const root = tmp();
    mkdirSync(join(root, 'web'));
    writeFileSync(join(root, 'web', 'x.txt'), 'x');
    assert.throws(
      () =>
        planScaffold({
          productRoot: root,
          parts: [{ part: 'web', dir: 'web', slug: 's', title: 'S' }],
          registry,
          exists: () => true,
        }),
      /not empty/,
    );
  });

  it('rejects path traversal in part dirs', () => {
    assert.throws(
      () =>
        planScaffold({
          productRoot: tmp(),
          parts: [{ part: 'web', dir: '../evil', slug: 's', title: 'S' }],
          registry,
          exists: () => true,
        }),
      /dir/,
    );
  });
});
