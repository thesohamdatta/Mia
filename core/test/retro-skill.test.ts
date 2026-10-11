import { describe, expect, it } from 'bun:test';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';
import type { ExecutionContext } from '../skills/types.js';
import { createUnifiedStore } from '../state/unified-store.js';

function context(testDir: string): ExecutionContext {
  return {
    cwd: testDir,
    slug: 'mia-retro',
    run: {
      id: 'run-retro-current',
      skill: 'unassigned',
      startedAt: new Date().toISOString(),
      status: 'running',
    },
    unifiedStore: createUnifiedStore(),
    grantedTools: [],
    config: {
      miaDir: join(testDir, '.mia'),
      skillsDir: join(testDir, '.mia', 'skills'),
      projectsDir: join(testDir, '.mia', 'projects'),
      memoryFile: join(testDir, '.mia', 'memory.md'),
      sessionsDir: join(testDir, '.mia', 'sessions'),
    },
  };
}

const definition = getSkill('retro');

if (!definition) {
  throw new Error('retro skill is not registered');
}

describe('retro skill runtime', () => {
  it('reports prior activity but not its own in-flight run', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-retro-'));
    const ctx = context(testDir);

    await ctx.unifiedStore.appendTimeline(ctx.config.projectsDir, ctx.slug, {
      runId: 'run-ship-prior',
      skill: 'ship',
      event: 'completed',
      outcome: 'success',
    });

    const result = await executeSkillDefinition(definition, [], ctx);

    expect(result.ok).toBe(true);
    expect(result.output).toContain('[ship]: completed');
    // The current retro run must not appear as its own most recent activity.
    expect(result.output).not.toContain('[retro]: started');
  });
});
