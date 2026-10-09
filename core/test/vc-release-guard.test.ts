import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';

// `vc release` used to parse the version with Number() and write the result
// unconditionally, so a non-semver package.json produced and tagged
// "NaN.0.1". It must refuse before mutating anything.
describe('vc release version guard', () => {
  const cleanups: string[] = [];

  afterEach(() => {
    for (const dir of cleanups.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    cleanups.push(dir);
    return dir;
  }

  function seedRepo(version: string): string {
    const dir = tempDir('mia-vc-release-');
    execSync('git init -q -b master', { cwd: dir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: dir, stdio: 'ignore' });
    writeFileSync(
      join(dir, 'package.json'),
      `${JSON.stringify({ name: 'x', version }, null, 2)}\n`
    );
    execSync('git add package.json && git commit -qm "chore: seed"', { cwd: dir, stdio: 'ignore' });
    return dir;
  }

  // Keep MIA state outside the repo, matching the default ~/.mia location.
  function contextFor(dir: string): ReturnType<typeof createExecutionContext> {
    const ctx = createExecutionContext(dir);
    ctx.config = { ...ctx.config, projectsDir: join(tempDir('mia-vc-release-state-'), 'projects') };
    return ctx;
  }

  it.each(['abc', '1.2', '1.2.3.4', '', 'v1.2.3', '1.2.x'])(
    'refuses to release a non-semver version %j without mutating state',
    async (version) => {
      const dir = seedRepo(version);
      const definition = getSkill('vc');
      if (!definition) throw new Error('vc definition not found');

      const result = await executeSkillDefinition(
        definition,
        ['release', 'patch'],
        contextFor(dir)
      );

      expect(result.ok).toBe(false);
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
      expect(pkg.version).toBe(version);
      expect(execSync('git tag', { cwd: dir, encoding: 'utf-8' }).trim()).toBe('');
      expect(execSync('git status --porcelain', { cwd: dir, encoding: 'utf-8' }).trim()).toBe('');
    }
  );

  it('still bumps a valid semver version', async () => {
    const dir = seedRepo('1.2.3');
    const definition = getSkill('vc');
    if (!definition) throw new Error('vc definition not found');

    await executeSkillDefinition(definition, ['release', 'patch'], contextFor(dir));

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
    expect(pkg.version).toBe('1.2.4');
    expect(execSync('git tag', { cwd: dir, encoding: 'utf-8' }).trim()).toBe('v1.2.4');
  });
});
