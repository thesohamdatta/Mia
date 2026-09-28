import { describe, expect, it } from 'bun:test';
import { execute } from '../skills/review/execute.js';
import type { ExecutionContext } from '../skills/types.js';
import { createUnifiedStore } from '../state/unified-store.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { createWork, transitionWork } from '../work/types.js';

describe('Review skill runtime', () => {
  function context(): ExecutionContext {
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
      grantedTools: [],
      config: {
        miaDir: '/tmp/mia',
        skillsDir: '/tmp/mia/skills',
        projectsDir,
        memoryFile: '/tmp/mia/memory.md',
        sessionsDir: '/tmp/mia/sessions',
      },
      skill: undefined,
    };
  }

  function plannedWork() {
    const work = createWork({ objective: 'Build X' });
    return transitionWork(transitionWork(work, 'specified'), 'planned');
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

  it('uses verification checks declared by the skill contract', async () => {
    const ctx = context();
    ctx.skill = {
      name: 'review',
      version: '1.0.0',
      description: 'Review work',
      allowedTools: [],
      sideEffects: 'local-write',
      verification: ['tests'],
      phase: 'review',
      invocation: 'user',
    };
    const work = plannedWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    let checks: string[] = [];
    const result = await execute([work.id], ctx, async (_ctx, selected) => {
      checks = selected.map((check) => check.name);
      return passedVerification();
    });

    expect(result.ok).toBe(true);
    expect(checks).toEqual(['tests']);
  });

  it('moves planned Work to ready_to_ship when verification passes', async () => {
    const ctx = context();
    const work = plannedWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await execute([work.id], ctx, async () => passedVerification());

    expect(result.ok).toBe(true);
    expect(result.output).toContain('READY_TO_SHIP');

    const restored = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id);
    expect(restored?.state).toBe('ready_to_ship');
  });

  it('returns Work to in_progress when verification fails', async () => {
    const ctx = context();
    const work = plannedWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await execute([work.id], ctx, async () => failedVerification());

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Review verification failed');

    const restored = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id);
    expect(restored?.state).toBe('in_progress');
  });
});
