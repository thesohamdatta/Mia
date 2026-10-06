import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGENT_SKILLS } from '../agent/surface.js';
import { listSkillDefinitions } from '../skills/index.js';
import { repositoryChecks } from '../verification/suite.js';

const ROOT = resolve(import.meta.dir, '../..');

describe('Repository QA contract', () => {
  it('keeps the shipped runtime on the intended single-path architecture', () => {
    expect(existsSync(resolve(ROOT, 'core', 'daemon'))).toBe(false);
    expect(existsSync(resolve(ROOT, 'core', 'hosts'))).toBe(false);
    expect(existsSync(resolve(ROOT, 'src'))).toBe(false);
    expect(existsSync(resolve(ROOT, 'core', 'skills'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'core', 'state', 'unified-store.ts'))).toBe(true);
  });

  it('keeps the package manifest aligned with the Bun CLI entrypoint and scripts', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
      version: string;
      main: string;
      packageManager?: string;
      dependencies?: Record<string, string>;
      scripts: Record<string, string>;
    };

    expect(pkg.main).toBe('core/cli/index.ts');
    expect(existsSync(resolve(ROOT, 'package-lock.json'))).toBe(false);
    expect(pkg.packageManager).toMatch(/^bun@/);
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts.typecheck).toBeDefined();
    expect(pkg.scripts['lint:check']).toBeDefined();
    expect(pkg.scripts.knip).toBeDefined();
    expect(pkg.scripts['validate:frontmatter']).toBeDefined();
    expect(pkg.version).toMatch(/^0\.\d+\.\d+$/);
  });

  it('keeps verification checks backed by real package scripts', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    const names = repositoryChecks.map((check) => check.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(['typecheck', 'lint', 'unused-code', 'tests', 'build']);

    for (const check of repositoryChecks) {
      expect(check.command[0]).toBe('bun');
      expect(check.command[1]).toBe('run');
      expect(pkg.scripts[check.command[2] ?? '']).toBeDefined();
    }
  });

  it('keeps the public agent surface smaller than the internal skill set', () => {
    const internal = listSkillDefinitions().map((definition) => definition.manifest.name);

    expect([...AGENT_SKILLS]).toEqual(['plan', 'review', 'ship']);
    expect(internal).toContain('health');
    expect(internal).toContain('vc');
    expect(internal).toContain('memory');
    expect(internal.length).toBeGreaterThan(AGENT_SKILLS.length);
  });

  it('runs the real CLI entrypoint for help and version', () => {
    const help = execFileSync('bun', ['run', 'core/cli/index.ts', '--help'], {
      cwd: ROOT,
      encoding: 'utf8',
    });

    expect(help).toContain('MIA (Machine Intelligence Architecture) CLI');
    expect(help).toContain('plan');
    expect(help).toContain('review');
    expect(help).toContain('ship');
    expect(help).toContain('setup');
    expect(help).toContain('health');
    expect(help).toContain('vc');

    const version = execFileSync('bun', ['run', 'core/cli/index.ts', '--version'], {
      cwd: ROOT,
      encoding: 'utf8',
    });

    expect(version).toContain('MIA v');
  });

  it('rejects an unknown CLI command instead of silently succeeding', () => {
    expect(() =>
      execFileSync('bun', ['run', 'core/cli/index.ts', 'definitely-not-a-command'], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    ).toThrow();
  });

  it('keeps current documentation from claiming removed runtime host-adapter paths', () => {
    const files = [
      'README.md',
      'docs/reference/testing-strategy.md',
      'docs/reference/review-standards.md',
      'docs/core/architecture.md',
    ];

    for (const file of files) {
      const content = readFileSync(resolve(ROOT, file), 'utf8');
      expect(content).not.toContain('core/hosts/');
      expect(content).not.toContain('core/daemon/');
    }
  });
});
