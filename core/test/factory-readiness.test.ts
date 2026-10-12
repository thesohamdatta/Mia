import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { READINESS_AREAS, assessAgentReadiness } from '../factory/readiness.js';

const ROOT = join(import.meta.dir, '..', '..');

async function makeRepo(files: Record<string, string>, dirs: string[] = []): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'mia-readiness-'));
  for (const dir of dirs) {
    await mkdir(join(root, dir), { recursive: true });
  }
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  return root;
}

const READY_SCRIPTS = {
  test: 'bun test',
  typecheck: 'tsc --noEmit',
  'lint:check': 'biome ci .',
  build: 'bun build',
};

const READY_CI = [
  'steps:',
  '  - run: bun run lint:check',
  '  - run: bun run typecheck',
  '  - run: bun test',
  '  - run: bun run build',
].join('\n');

async function readyRepo(extra: Record<string, string> = {}): Promise<string> {
  return makeRepo(
    {
      'package.json': JSON.stringify({ packageManager: 'bun@1.4.2', scripts: READY_SCRIPTS }),
      'bun.lock': '',
      'README.md': '# repo',
      'AGENTS.md': '# agents',
      'docs/reference/evidence.md': '# evidence',
      '.github/workflows/ci.yml': READY_CI,
      'core/app/main.test.ts': '// test',
      ...extra,
    },
    ['docs', 'core/state', 'core/app', 'core/lib']
  );
}

describe('agent readiness', () => {
  it('covers exactly the eight readiness areas from the factory model', () => {
    const report = assessAgentReadiness(ROOT);
    expect(report.areas.map((area) => area.id)).toEqual([...READINESS_AREAS]);
    expect(READINESS_AREAS).toHaveLength(8);
  });

  it('assesses the real repository deterministically', () => {
    const first = assessAgentReadiness(ROOT);
    const second = assessAgentReadiness(ROOT);
    expect(second).toEqual(first);
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.score).toBeLessThanOrEqual(1);
    expect(first.readyCount + first.partialCount + first.missingCount).toBe(8);
  });

  it('gives every area at least one evidence-backed probe', () => {
    const report = assessAgentReadiness(ROOT);
    for (const area of report.areas) {
      expect(area.probes.length).toBeGreaterThan(0);
      for (const probe of area.probes) {
        expect(probe.evidence.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('marks a repository with validation, build, and feedback loops as ready', async () => {
    const root = await readyRepo();
    const report = assessAgentReadiness(root);
    const byId = new Map(report.areas.map((area) => [area.id, area]));

    expect(byId.get('validation')?.status).toBe('ready');
    expect(byId.get('build-systems')?.status).toBe('ready');
    expect(byId.get('feedback-loops')?.status).toBe('ready');
    expect(byId.get('documentation')?.status).toBe('ready');
    expect(byId.get('reproducible-environments')?.status).toBe('ready');
    expect(byId.get('modular-code')?.status).toBe('ready');
  });

  it('reports a missing area with a recommendation instead of guessing', async () => {
    const root = await readyRepo();
    const report = assessAgentReadiness(root);
    const security = report.areas.find((area) => area.id === 'security-scanning');

    expect(security?.status).toBe('missing');
    expect(security?.recommendation?.trim().length).toBeGreaterThan(0);
  });

  it('recognises a security workflow as agent-ready security scanning', async () => {
    const root = await readyRepo({ '.github/workflows/security.yml': 'name: Security\n' });
    const report = assessAgentReadiness(root);
    const security = report.areas.find((area) => area.id === 'security-scanning');
    expect(security?.status).toBe('ready');
  });

  it('flags an empty repository as not ready', async () => {
    const root = await makeRepo({});
    const report = assessAgentReadiness(root);
    expect(report.readyCount).toBe(0);
    expect(report.areas.find((area) => area.id === 'validation')?.status).toBe('missing');
    expect(report.areas.find((area) => area.id === 'documentation')?.status).toBe('missing');
  });
});
