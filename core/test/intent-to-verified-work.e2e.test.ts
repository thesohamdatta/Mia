import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { saveApproval } from '../approval/persistence.js';
import { createApproval, resolveApproval } from '../approval/types.js';
import { selectCapabilities } from '../capabilities/select.js';
import { createExecutionContext } from '../context.js';
import { createRootPlan } from '../root/types.js';
import { execute as executeReview } from '../skills/review/execute.js';
import { execute as executeShip } from '../skills/ship/execute.js';
import { repositoryChecks } from '../verification/suite.js';
import { createWorkFromRootPlan } from '../work/from-root-plan.js';
import { repositoryChecks } from '../verification/suite.js';
import { loadWork, saveWork } from '../work/persistence.js';

function context(testDir: string) {
  const ctx = createExecutionContext(testDir);
  ctx.config = { ...ctx.config, projectsDir: join(testDir, '.mia', 'projects') };
  return ctx;
}

describe('Intent to verified Work', () => {
  it('carries one human objective through planning, capability selection, verification, approval, and recovery', async () => {
    const testDir = mkdtempSync(join('/tmp', 'mia-intent-e2e-'));

    try {
      const plan = createRootPlan(
        {
          request: 'Build a small release health check',
          projectContext: ['Bun repository'],
          currentWorkState: 'draft',
          availableCapabilities: ['software', 'qa'],
          learnings: ['Prefer the smallest useful verification surface'],
          authority: {
            humanApprovalRequired: true,
            allowedAutonomy: 'execute-within-scope',
          },
        },
        {
          objective: 'Build a small release health check',
          ambiguities: [],
          capabilities: ['software', 'qa'],
          dependencies: [],
          nextActions: ['Implement the health check', 'Verify the repository'],
          approvals: ['Human approval before ship'],
          expectedEvidence: ['Repository checks pass'],
        }
      );

      expect(selectCapabilities(plan)).toEqual(['software', 'qa']);

      const planned = createWorkFromRootPlan(plan);
      expect(planned.state).toBe('planned');
      expect(planned.capabilities).toEqual(['software', 'qa']);
      expect(planned.requiresHumanApproval).toBe(true);

      const initialCtx = context(testDir);
      await saveWork(
        initialCtx.unifiedStore,
        initialCtx.config.projectsDir,
        initialCtx.slug,
        planned
      );

      const reviewCtx = context(testDir);
      const reviewResult = await executeReview([planned.id], reviewCtx, async () => ({
        records: [{ runId: reviewCtx.run.id, name: 'tests', status: 'passed' as const }],
        passed: true,
      }));

      expect(reviewResult.ok).toBe(true);

      const readyCtx = context(testDir);
      const ready = await loadWork(
        readyCtx.unifiedStore,
        readyCtx.config.projectsDir,
        readyCtx.slug,
        planned.id
      );
      expect(ready?.state).toBe('ready_to_ship');
      expect(ready?.verification?.passed).toBe(true);
      expect(ready?.verification?.runId).toBe(reviewCtx.run.id);

      const approval = resolveApproval(
        createApproval({
          workId: planned.id,
          runId: 'human-approval-run',
          action: 'ship',
        }),
        'approved'
      );
      await saveApproval(
        readyCtx.unifiedStore,
        readyCtx.config.projectsDir,
        readyCtx.slug,
        approval
      );

      const shipCtx = context(testDir);
      const shipResult = await executeShip([planned.id], shipCtx, async () => ({
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

      const resumedCtx = context(testDir);
      const resumed = await loadWork(
        resumedCtx.unifiedStore,
        resumedCtx.config.projectsDir,
        resumedCtx.slug,
        planned.id
      );

      expect(resumed?.state).toBe('shipped');
      expect(resumed?.objective).toBe(plan.objective);
      expect(resumed?.capabilities).toEqual(['software', 'qa']);
      expect(resumed?.verification?.passed).toBe(true);
      expect(resumed?.verification?.runId).toBe(shipCtx.run.id);
      expect(resumed?.approval).toEqual({
        id: approval.id,
        runId: approval.runId,
        action: 'ship',
        status: 'approved',
      });

      const evidence = await resumedCtx.unifiedStore.listEvidence(
        resumedCtx.config.projectsDir,
        resumedCtx.slug,
        10
      );
      expect(evidence).toHaveLength(repositoryChecks.length + 1);
      expect(evidence.every((event) => event.type === 'evidence')).toBe(true);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
