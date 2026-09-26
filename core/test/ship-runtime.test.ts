import { describe, expect, it } from 'bun:test';
import { loadApprovalForWork, saveApproval } from '../approval/persistence.js';
import { createApproval, resolveApproval } from '../approval/types.js';
import { execute } from '../skills/ship/execute.js';
import { createUnifiedStore } from '../state/unified-store.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { createWork, transitionWork } from '../work/types.js';

describe('Ship skill runtime', () => {
  function readyWork(requiresHumanApproval = false) {
    let work = createWork({
      objective: 'Release X',
      requiresHumanApproval,
    });
    work = transitionWork(work, 'specified');
    work = transitionWork(work, 'planned');
    work = transitionWork(work, 'in_progress');
    work = transitionWork(work, 'verification');
    work = transitionWork(work, 'review');
    return transitionWork(work, 'ready_to_ship');
  }

  function passedVerification() {
    return {
      records: [
        {
          runId: 'run-ship',
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

  function context() {
    const projectsDir = '/tmp/mia-ship-runtime';
    return {
      cwd: process.cwd(),
      slug: 'mia-ship-runtime',
      run: {
        id: 'run-ship',
        skill: 'ship',
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

  it('requires a Work id', async () => {
    const ctx = context();
    const result = await execute([], ctx, async () => passedVerification());
    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toMatch(/Usage: mia ship <workId>/);
  });

  it('blocks an unknown Work id before verification', async () => {
    const ctx = context();
    let verified = false;
    const result = await execute(['work_unknown'], ctx, async () => {
      verified = true;
      return passedVerification();
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Work not found/);
    expect(verified).toBe(false);
  });

  it('persists a shipped Work after verification and approval requirements are satisfied', async () => {
    const ctx = context();
    const work = readyWork(true);
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const approval = resolveApproval(
      createApproval({
        workId: work.id,
        runId: 'run-approval',
        action: 'ship',
      }),
      'approved'
    );
    await saveApproval(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, approval);

    const result = await execute([work.id], ctx, async () => passedVerification());

    expect(result.ok).toBe(true);
    expect(result.output).toContain('SHIPPED');
    const restored = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id);
    expect(restored?.state).toBe('shipped');
  });

  it('blocks required approval when none exists', async () => {
    const ctx = context();
    const work = readyWork(true);
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await execute([work.id], ctx, async () => passedVerification());

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/human approval is required/);
  });

  it('can recover the latest approval for a Work item', async () => {
    const store = createUnifiedStore();
    const work = readyWork(true);
    const pending = createApproval({
      workId: work.id,
      runId: 'run-approval',
      action: 'ship',
    });
    const approved = resolveApproval(pending, 'approved');

    await saveApproval(store, '/tmp/mia-ship-runtime', 'mia-ship-runtime', pending);
    await saveApproval(store, '/tmp/mia-ship-runtime', 'mia-ship-runtime', approved);

    const restored = await loadApprovalForWork(
      store,
      '/tmp/mia-ship-runtime',
      'mia-ship-runtime',
      work.id,
      'ship'
    );

    expect(restored).toEqual(approved);
  });
});
