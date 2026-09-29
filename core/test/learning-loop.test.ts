import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createExecutionContext } from '../context.js';
import { execute as executeLearn } from '../skills/learn/execute.js';

describe('evidence-driven learning loop', () => {
  it('records learning provenance and applies the learning in a later run', async () => {
    const tempDir = mkdtempSync(join('/tmp', 'mia-learning-'));

    try {
      const first = createExecutionContext(tempDir);
      first.config = { ...first.config, projectsDir: join(tempDir, '.mia', 'projects') };

      const added = await executeLearn(
        ['add', 'workflow', 'prefer-small-diff', 'Keep changes small and focused'],
        first
      );

      expect(added.ok).toBe(true);
      expect(added.output).toContain('prefer-small-diff');

      const firstLearnings = await first.unifiedStore.listLearnings(
        first.config.projectsDir,
        first.slug
      );
      expect(firstLearnings).toHaveLength(1);
      expect(firstLearnings[0]?.data).toEqual({
        scope: 'project',
        type: 'workflow',
        key: 'prefer-small-diff',
        insight: 'Keep changes small and focused',
        sourceRunId: first.run.id,
        appliedInRunIds: [],
      });

      const second = createExecutionContext(tempDir);
      second.config = { ...second.config, projectsDir: first.config.projectsDir };

      const applied = await executeLearn(['apply', 'prefer-small-diff'], second);

      expect(applied.ok).toBe(true);

      const learnings = await second.unifiedStore.listLearnings(
        second.config.projectsDir,
        second.slug,
        10
      );
      const appliedRecord = learnings[0]?.data as {
        key: string;
        sourceRunId: string;
        appliedInRunIds: string[];
      };

      expect(appliedRecord.key).toBe('prefer-small-diff');
      expect(appliedRecord.sourceRunId).toBe(first.run.id);
      expect(appliedRecord.appliedInRunIds).toEqual([second.run.id]);

      const timeline = await second.unifiedStore.listTimeline(
        second.config.projectsDir,
        second.slug,
        10
      );
      expect(timeline.some((event) => {
        const data = event.data as {
          kind?: string;
          key?: string;
          runId?: string;
          sourceRunId?: string;
        };
        return (
          data.kind === 'learning-applied' &&
          data.key === 'prefer-small-diff' &&
          data.runId === second.run.id &&
          data.sourceRunId === first.run.id
        );
      })).toBe(true);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('blocks applying an unknown learning', async () => {
    const tempDir = mkdtempSync(join('/tmp', 'mia-learning-'));

    try {
      const ctx = createExecutionContext(tempDir);
      ctx.config = { ...ctx.config, projectsDir: join(tempDir, '.mia', 'projects') };

      const result = await executeLearn(['apply', 'missing'], ctx);

      expect(result.ok).toBe(false);
      expect(result.status).toBe('blocked');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
