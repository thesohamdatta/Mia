import { describe, expect, it } from 'bun:test';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { loadApprovalForWork } from '../approval/persistence.js';
import { execute as executeApprove } from '../skills/approve/execute.js';
import { getSkill } from '../skills/index.js';
import { execute as executeShip } from '../skills/ship/execute.js';
import type { ExecutionContext } from '../skills/types.js';
import { createUnifiedStore } from '../state/unified-store.js';
import { repositoryChecks } from '../verification/suite.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { type Work, createWork, transitionWork } from '../work/types.js';

function readyWork(requiresHumanApproval = true): Work {
  let work = createWork({ objective: 'Release X', requiresHumanApproval });
  work = transitionWork(work, 'specified');
  work = transitionWork(work, 'planned');
  work = transitionWork(work, 'in_progress');
  work = transitionWork(work, 'verification');
  work = transitionWork(work, 'review');
  return transitionWork(work, 'ready_to_ship');
}

function context(testDir: string): ExecutionContext {
  return {
    cwd: testDir,
    slug: 'mia-approve',
    run: {
      id: 'run-approve',
      skill: 'approve',
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

const definition = getSkill('approve');

if (!definition) {
  throw new Error('approve skill is not registered');
}

describe('approve skill contract', () => {
  it('is registered as a human-invoked local-write handoff skill', () => {
    expect(definition.manifest.sideEffects).toBe('local-write');
    expect(definition.manifest.phase).toBe('handoff');
    expect(definition.manifest.invocation).toBe('user');
    expect(definition.manifest.verification).toEqual([]);
  });
});

describe('approve skill runtime', () => {
  it('blocks without a work id', async () => {
    const ctx = context(mkdtempSync(join('/tmp', 'mia-approve-')));
    const result = await executeApprove([], ctx);
    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain('Usage');
  });

  it('blocks for an unknown work id', async () => {
    const ctx = context(mkdtempSync(join('/tmp', 'mia-approve-')));
    const result = await executeApprove(['work_missing'], ctx);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Work not found');
  });

  it('refuses to approve work that is not ready to ship', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-approve-'));
    const ctx = context(testDir);
    const draft = createWork({ objective: 'Not ready', requiresHumanApproval: true });
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, draft);

    const result = await executeApprove([draft.id], ctx);
    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain(draft.state);
  });

  it('records an approved approval that unblocks the ship gate', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-approve-'));
    const ctx = context(testDir);
    const work = readyWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await executeApprove([work.id, 'reviewed', 'the', 'diff'], ctx);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('APPROVED');

    const approval = await loadApprovalForWork(
      ctx.unifiedStore,
      ctx.config.projectsDir,
      ctx.slug,
      work.id,
      'ship'
    );
    expect(approval?.status).toBe('approved');
    expect(approval?.action).toBe('ship');
    expect(approval?.note).toBe('reviewed the diff');

    const shipCtx = context(testDir);
    const shipResult = await executeShip([work.id], shipCtx, async () => ({
      records: repositoryChecks.map((check) => ({
        runId: shipCtx.run.id,
        name: check.name,
        status: 'passed' as const,
        command: check.command.join(' '),
        durationMs: 1,
        detail: 'passed',
      })),
      passed: true,
    }));
    expect(shipResult.ok).toBe(true);

    const shipped = await loadWork(
      shipCtx.unifiedStore,
      shipCtx.config.projectsDir,
      shipCtx.slug,
      work.id
    );
    expect(shipped?.state).toBe('shipped');
  });

  it('records a rejection with --reject and does not unblock shipping', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-approve-'));
    const ctx = context(testDir);
    const work = readyWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const result = await executeApprove(['--reject', work.id, 'needs', 'a', 'test'], ctx);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('REJECTED');

    const approval = await loadApprovalForWork(
      ctx.unifiedStore,
      ctx.config.projectsDir,
      ctx.slug,
      work.id,
      'ship'
    );
    expect(approval?.status).toBe('rejected');

    const shipCtx = context(testDir);
    const shipResult = await executeShip([work.id], shipCtx, async () => ({
      records: repositoryChecks.map((check) => ({
        runId: shipCtx.run.id,
        name: check.name,
        status: 'passed' as const,
        command: check.command.join(' '),
        durationMs: 1,
        detail: 'passed',
      })),
      passed: true,
    }));
    expect(shipResult.ok).toBe(false);
  });

  it('reports the current approval with --status', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-approve-'));
    const ctx = context(testDir);
    const work = readyWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const before = await executeApprove(['--status', work.id], ctx);
    expect(before.ok).toBe(true);
    expect(before.output).toContain('No approval recorded');

    await executeApprove([work.id], ctx);
    const after = await executeApprove(['--status', work.id], ctx);
    expect(after.output).toContain('approved');
  });

  it('is idempotent: approving twice does not create a conflicting record', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-approve-'));
    const ctx = context(testDir);
    const work = readyWork();
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const first = await executeApprove([work.id], ctx);
    const second = await executeApprove([work.id], ctx);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.output).toContain('already approved');
  });
});
