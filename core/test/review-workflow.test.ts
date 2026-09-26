import { describe, expect, it } from 'bun:test';
import { execute } from '../skills/review/execute.js';
import { createUnifiedStore } from '../state/unified-store.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { createWork } from '../work/types.js';

describe('Review skill runtime', () => {
  function context() {
    const projectsDir = '/tmp/mia-review-workflow';
    return {
      cwd: process.cwd(),
      slug: 'mia-review-workflow',
      run: {
        id: 'run-review',
        skill: 'review',
        startedAt: new Date().toISOString(),
        status: 'running' as const,
      },
      unifiedStore: createUnifiedStore(),
      config: {
        miaDir: '/tmp/mia',
        skillsDir: '/tmp/mia/skills',
        projectsDir,
        memoryFile: '/tmp/mia/memory.md',
        sessionsDir: '/tmp/mia/sessions',
      },
    };
  }

  function plannedWork() {
    return createWork({ objective: 'Build X' });
  }

  function passedVerification() {
    return {
      records: [
        {
          runId: 'run-review',
          name: 'tests',
          status: 'passed' as const,
          command: 'bun test',
          durationMs: 1,
          detail: 'passed',
        },
      ],
      passed: true,
    };
  }

  function failedVerification() {
    return {
      records: [
        {
          runId: 'run-review',
          name: 'tests',
          status: 'failed' as const,
          command: 'bun test',
          durationMs: 1,
          detail: 'failed',
        },
      ],
      passed: false,
    };
  }

  it('requires a Work id', async () => {
    const result = await execute([], context(), async () => passedVerification());

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Usage: mia review <workId>/);
  });

  it('moves planned Work to ready_to_ship when verification passes', async () => {
    const ctx = context();
    const work = plannedWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await execute([work.id], ctx, async () => passedVerification());

    expect(result.ok).toBe(true);
    expect(result.output).toContain('READY_TO_SHIP');

    const restored = await loadWork(
      ctx.unifiedStore,
      ctx.config.projectsDir,
      ctx.slug,
      work.id
    );
    expect(restored?.state).toBe('ready_to_ship');
  });

  it('returns Work to in_progress when verification fails', async () => {
    const ctx = context();
    const work = plannedWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await execute([work.id], ctx, async () => failedVerification());

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Review verification failed');

    const restored = await loadWork(
      ctx.unifiedStore,
      ctx.config.projectsDir,
      ctx.slug,
      work.id
    );
    expect(restored?.state).toBe('in_progress');
  });
});
