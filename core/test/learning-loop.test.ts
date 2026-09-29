import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';
import { createUnifiedStore } from '../state/unified-store.js';

function testContext(testDir: string) {
  const ctx = createExecutionContext(testDir);
  ctx.config = { ...ctx.config, projectsDir: join(testDir, '.mia', 'projects') };
  return ctx;
}

describe('evidence-driven learning loop', () => {
  it('carries a learning from run N into planning run N+1', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-learning-loop-'));

    try {
      const runN = testContext(testDir);
      const learn = getSkill('learn');
      const plan = getSkill('plan');

      expect(learn).toBeDefined();
      expect(plan).toBeDefined();
      if (!learn || !plan) throw new Error('learning or plan skill not found');

      const learningResult = await executeSkillDefinition(
        learn,
        [
          'add',
          'workflow',
          'verification-order',
          'Run focused checks before the full repository gate',
        ],
        runN
      );
      expect(learningResult.ok).toBe(true);

      const stored = await createUnifiedStore().listLearnings(
        runN.config.projectsDir,
        runN.slug,
        5
      );
      expect(stored).toHaveLength(1);
      expect(stored[0]?.data).toEqual({
        scope: 'project',
        type: 'workflow',
        key: 'verification-order',
        insight: 'Run focused checks before the full repository gate',
        sourceRunId: runN.run.id,
      });

      const runNPlus1 = testContext(testDir);
      const planResult = await executeSkillDefinition(
        plan,
        ['create', 'Improve', 'the', 'verification', 'workflow'],
        runNPlus1
      );
      expect(planResult.ok).toBe(true);

      const planPath = join(runNPlus1.config.projectsDir, runNPlus1.slug, 'PLAN.md');
      const planText = await Bun.file(planPath).text();

      expect(planText).toContain('## Learnings Applied');
      expect(planText).toContain('- Run focused checks before the full repository gate');
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
