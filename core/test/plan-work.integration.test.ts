import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';
import { loadWork } from '../work/persistence.js';

describe('Plan -> Work integration', () => {
  it('creates and persists a planned Work item through the normal skill path', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-plan-work-'));

    try {
      const ctx = createExecutionContext(testDir);
      const definition = getSkill('plan');

      expect(definition).toBeDefined();
      if (!definition) throw new Error('plan definition not found');

      const result = await executeSkillDefinition(
        definition,
        ['create', 'Build', 'a', 'meeting', 'summarizer'],
        ctx
      );

      expect(result.ok).toBe(true);

      const workId = result.output?.match(/Work: (work_[^\s]+)/)?.[1];
      expect(workId).toMatch(/^work_/);

      const work = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, workId as string);
      expect(work?.state).toBe('planned');
      expect(work?.objective).toBe('Build a meeting summarizer');
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
