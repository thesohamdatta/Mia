import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';

describe('VC safety boundaries', () => {
  let testDir: string;

  afterEach(() => {
    if (testDir) rmSync(testDir, { recursive: true, force: true });
  });

  it('cleans only ignored generated files under known build directories', async () => {
    testDir = mkdtempSync(join(tmpdir(), 'mia-vc-safety-'));
    execSync('git init', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: testDir, stdio: 'ignore' });

    writeFileSync(join(testDir, '.gitignore'), '*.local\nbin/\n');
    mkdirSync(join(testDir, 'bin'));
    writeFileSync(join(testDir, 'bin', 'generated.local'), 'generated');
    writeFileSync(join(testDir, 'keep.local'), 'keep');
    execSync('git add .gitignore && git commit -m "chore(test): seed ignore rules"', {
      cwd: testDir,
      stdio: 'ignore',
    });

    const ctx = createExecutionContext(testDir);
    ctx.config = { ...ctx.config, projectsDir: join(testDir, '.mia', 'projects') };
    const definition = getSkill('vc');

    expect(definition).toBeDefined();
    if (!definition) throw new Error('vc definition not found');

    const result = await executeSkillDefinition(definition, ['clean'], ctx);

    expect(result.ok).toBe(true);
    expect(existsSync(join(testDir, 'bin', 'generated.local'))).toBe(false);
    expect(existsSync(join(testDir, 'keep.local'))).toBe(true);
  });
});
