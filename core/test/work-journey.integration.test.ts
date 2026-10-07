import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { saveApproval } from '../approval/persistence.js';
import { createApproval, resolveApproval } from '../approval/types.js';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';
import { execute as executeReview } from '../skills/review/execute.js';
import { execute as executeShip } from '../skills/ship/execute.js';
import { repositoryChecks } from '../verification/suite.js';
import { loadWork } from '../work/persistence.js';

function testContext(testDir: string) {
  const ctx = createExecutionContext(testDir);
  ctx.config = { ...ctx.config, projectsDir: join(testDir, '.mia', 'projects') };
  return ctx;
}

describe('Work lifecycle journey', () => {
  it('resumes from persisted verification and approval state across skills', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-work-journey-'));

    try {
      const planCtx = testContext(testDir);
      const plan = getSkill('plan');

      expect(plan).toBeDefined();
      if (!plan) throw new Error('plan definition not found');

      const planResult = await executeSkillDefinition(
        plan,
        ['create', 'Ship', 'a', 'release'],
        planCtx
      );
      expect(planResult.ok).toBe(true);

      const workId = planResult.output?.match(/Work: (work_\S+)/)?.[1];
      expect(workId).toMatch(/^work_/);

      const reviewCtx = testContext(testDir);
      const reviewResult = await executeReview([workId as string], reviewCtx, async () => ({
        records: [{ runId: reviewCtx.run.id, name: 'tests', status: 'passed' as const }],
        passed: true,
      }));
      expect(reviewResult.ok).toBe(true);

      const ready = await loadWork(
        reviewCtx.unifiedStore,
        reviewCtx.config.projectsDir,
        reviewCtx.slug,
        workId as string
      );
      expect(ready?.state).toBe('ready_to_ship');
      expect(ready?.verification).toEqual({
        runId: reviewCtx.run.id,
        passed: true,
        evidence: [{ runId: reviewCtx.run.id, name: 'tests', status: 'passed' }],
      });

      const approval = resolveApproval(
        createApproval({ workId: workId as string, runId: 'approval-run', action: 'ship' }),
        'approved'
      );
      await saveApproval(
        reviewCtx.unifiedStore,
        reviewCtx.config.projectsDir,
        reviewCtx.slug,
        approval
      );

      const shipCtx = testContext(testDir);
      const shipResult = await executeShip([workId as string], shipCtx, async () => ({
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
        workId as string
      );
      expect(shipped?.state).toBe('shipped');
      expect(shipped?.verification?.runId).toBe(shipCtx.run.id);
      expect(shipped?.approval).toEqual({
        id: approval.id,
        runId: approval.runId,
        action: 'ship',
        status: 'approved',
      });

      const evidence = await shipCtx.unifiedStore.listEvidence(
        shipCtx.config.projectsDir,
        shipCtx.slug,
        10
      );
      expect(evidence).toHaveLength(repositoryChecks.length + 1);
      const evidenceNames = evidence.map((event) => (event.data as { name: string }).name);
      expect(evidenceNames.sort()).toEqual(
        ['tests', ...repositoryChecks.map((check) => check.name)].sort()
      );

      const approvals = await shipCtx.unifiedStore.listApprovals(
        shipCtx.config.projectsDir,
        shipCtx.slug,
        10
      );
      expect(approvals).toHaveLength(1);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
