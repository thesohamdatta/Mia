import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createExecutionContext } from '../context.js';
import { execute as review } from '../skills/review/execute.js';
import { execute as ship } from '../skills/ship/execute.js';
import { createUnifiedStore } from '../state/unified-store.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { createWork, transitionWork } from '../work/types.js';

function readyWork() {
  let work = createWork({ objective: 'Ship a checked change' });
  for (const state of [
    'specified',
    'planned',
    'in_progress',
    'verification',
    'review',
    'ready_to_ship',
  ] as const) {
    work = transitionWork(work, state);
  }
  return work;
}

function context(dir: string, runId: string) {
  const ctx = createExecutionContext(dir);
  ctx.run.id = runId;
  ctx.config = { ...ctx.config, projectsDir: join(dir, 'projects') };
  return ctx;
}

function verification(runId: string, status: 'passed' | 'failed', passed = status === 'passed') {
  return {
    passed,
    records: [
      {
        runId,
        name: 'tests',
        status,
        command: 'bun test',
        durationMs: 1,
        detail: status,
      },
    ],
  };
}

describe('shipping lifecycle reconciliation', () => {
  it('rejects premature shipping before running checks or changing persisted Work', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mia-ship-premature-'));
    try {
      const ctx = context(dir, 'premature');
      const work = transitionWork(createWork({ objective: 'Not reviewed' }), 'specified');
      await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);
      let calls = 0;
      const result = await ship([work.id], ctx, async () => {
        calls++;
        return verification(ctx.run.id, 'passed');
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.error).toContain('not ready to ship: specified');
      expect(calls).toBe(0);
      expect(
        await loadWork(createUnifiedStore(), ctx.config.projectsDir, ctx.slug, work.id)
      ).toEqual(work);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not rerun checks or rewrite a previously shipped Work item', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mia-ship-repeat-'));
    try {
      const ctx = context(dir, 'ship-one');
      const work = {
        ...readyWork(),
        state: 'shipped' as const,
        verification: {
          runId: 'ship-one',
          passed: true,
          evidence: [{ runId: 'ship-one', name: 'tests', status: 'passed' as const }],
        },
      };
      await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);
      let calls = 0;
      const second = context(dir, 'ship-two');
      const result = await ship([work.id], second, async () => {
        calls++;
        return verification(second.run.id, 'failed');
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('not ready to ship: shipped');
      expect(calls).toBe(0);
      expect(
        await loadWork(createUnifiedStore(), ctx.config.projectsDir, ctx.slug, work.id)
      ).toEqual(work);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reopens failed shipping verification and prevents retry without another review', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mia-ship-retry-'));
    try {
      const ctx = context(dir, 'ship-failed');
      const work = readyWork();
      await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);
      const result = await ship([work.id], ctx, async () => verification(ctx.run.id, 'failed'));
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Ship verification failed');

      const resumed = await loadWork(
        createUnifiedStore(),
        ctx.config.projectsDir,
        ctx.slug,
        work.id
      );
      expect(resumed?.state).toBe('in_progress');
      expect(resumed?.verification).toEqual({
        runId: 'ship-failed',
        passed: false,
        evidence: [{ runId: 'ship-failed', name: 'tests', status: 'failed' }],
      });

      let calls = 0;
      const retry = context(dir, 'ship-retry');
      const retryResult = await ship([work.id], retry, async () => {
        calls++;
        return verification(retry.run.id, 'passed');
      });
      expect(retryResult.ok).toBe(false);
      expect(retryResult.error).toContain('not ready to ship: in_progress');
      expect(calls).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not trust an overall pass that contradicts failed check evidence', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mia-ship-conflict-'));
    try {
      const ctx = context(dir, 'ship-conflict');
      const work = readyWork();
      await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);
      const result = await ship([work.id], ctx, async () =>
        verification(ctx.run.id, 'failed', true)
      );

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Ship verification failed');
      const resumed = await loadWork(
        createUnifiedStore(),
        ctx.config.projectsDir,
        ctx.slug,
        work.id
      );
      expect(resumed?.state).toBe('in_progress');
      expect(resumed?.verification?.passed).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it('does not mark review ready when a reported pass contains failed evidence', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mia-review-conflict-'));
    try {
      const ctx = context(dir, 'review-conflict');
      const work = transitionWork(
        transitionWork(createWork({ objective: 'Review checked work' }), 'specified'),
        'planned'
      );
      await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

      const result = await review([work.id], ctx, async () =>
        verification(ctx.run.id, 'failed', true)
      );
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Review verification failed');

      const resumed = await loadWork(
        createUnifiedStore(),
        ctx.config.projectsDir,
        ctx.slug,
        work.id
      );
      expect(resumed?.state).toBe('in_progress');
      expect(resumed?.verification?.passed).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
