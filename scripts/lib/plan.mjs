// Pure planning for scaffold.mjs: turns a product plan + template registry into
// a list of concrete steps. No side effects except reading directory listings.
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, normalize } from 'node:path';

export const expandHome = (path) => (path.startsWith('~/') ? join(homedir(), path.slice(2)) : path);

export const findTemplate = (registry, part) =>
  registry.templates.find((t) => t.part === part && t.status === 'stable');

export const shellQuote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

/** Fills `{placeholder}` values; a `--flag {x}` pair is dropped when x is empty. */
export const renderInit = (template, values) =>
  template
    .replace(/\s--[\w-]+ \{(\w+)\}/g, (match, key) => {
      const value = values[key];
      return value === undefined || value === '' ? '' : match.replace(`{${key}}`, shellQuote(value));
    })
    .replace(/\{(\w+)\}/g, (_m, key) => shellQuote(values[key] ?? ''));

const isNonEmptyDir = (path) => existsSync(path) && readdirSync(path).length > 0;

const assertSafeDir = (dir) => {
  const clean = normalize(dir);
  if (!dir || isAbsolute(dir) || clean.startsWith('..') || clean.includes(`..${'/'}`)) {
    throw new Error(`Invalid part dir "${dir}": use a simple relative folder name like "web".`);
  }
  return clean;
};

const defaultsReadme = (part) => `# ${part.title}

No registered template for the \`${part.part}\` part yet. Build it from the owner's defaults:

- Stack: ${part.stack ?? 'see docs/product/architecture.md'}
- Create command: ${part.createCommand ?? 'see docs/product/architecture.md'}
- Copy agent rules from the web part (AGENTS.md sections: commands, invariants, performance, approval list, testing, git, project memory, done report) and adapt commands. Add \`CLAUDE.md\` and \`GEMINI.md\` stubs that only contain \`@AGENTS.md\`, and an empty \`docs/agents/memory.md\`.

When this part stabilizes, turn it into a template repo and register it in product-architect \`templates/registry.json\`.
`;

const templateSteps = (template, part, partPath, exists) => {
  const local = template.source.local ? expandHome(template.source.local) : undefined;
  const from = local && exists(local) ? local : template.source.git;
  if (!from) throw new Error(`Template ${template.id} has no reachable source.`);
  const recipes = Array.isArray(part.recipes) ? part.recipes.join(',') : part.recipes;
  const init = renderInit(template.init, { ...part, recipes });
  return [
    { kind: 'clone', cwd: partPath, args: { from } },
    { kind: 'rm-git', cwd: partPath, args: {} },
    // git init before install: otherwise git (and lefthook) resolve the product root repo.
    { kind: 'git-init', cwd: partPath, args: {} },
    { kind: 'run', cwd: partPath, args: { command: template.install } },
    { kind: 'run', cwd: partPath, args: { command: init } },
  ];
};

/**
 * @param {{ productRoot: string, parts: Array<{part: string, dir: string, slug: string, title: string,
 *   description?: string, url?: string, locale?: string, ci?: string, recipes?: string[]|string,
 *   stack?: string, createCommand?: string}>, registry: object, exists?: (p: string) => boolean }} input
 */
export const planScaffold = ({ productRoot, parts, registry, exists = existsSync }) => {
  const root = expandHome(productRoot);
  const steps = [{ kind: 'mkdir', cwd: root, args: {} }];
  if (!existsSync(join(root, '.git'))) steps.push({ kind: 'git-init', cwd: root, args: {} });

  for (const part of parts) {
    const dir = assertSafeDir(part.dir);
    const partPath = join(root, dir);
    if (isNonEmptyDir(partPath)) throw new Error(`Target ${partPath} is not empty; refusing to overwrite.`);
    const template = findTemplate(registry, part.part);
    steps.push(
      ...(template
        ? templateSteps(template, part, partPath, exists)
        : [{ kind: 'write', cwd: root, args: { path: join(dir, 'README.md'), content: defaultsReadme(part) } }]),
    );
  }

  // The root repo holds product docs only; each part is its own git repo.
  const ignore = parts.map((p) => `/${assertSafeDir(p.dir)}/`).join('\n');
  steps.push({ kind: 'write', cwd: root, args: { path: '.gitignore', content: `${ignore}\n.DS_Store\n` } });
  return steps;
};
