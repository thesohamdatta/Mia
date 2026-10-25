import { loadApprovalForWork } from '../../approval/persistence.js';
import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks, resolveVerificationChecks } from '../../verification/suite.js';
import { completeReview, recordApproval, recordVerification } from '../../work/lifecycle.js';
import { loadWork, saveWork } from '../../work/persistence.js';
import { shipWork } from '../../work/ship.js';
import { transitionWork } from '../../work/types.js';
import type { ExecutionContext, SkillResult } from '../types.js';

export async function execute(
  args: string[],
  ctx: ExecutionContext,
  verify: typeof runVerification = runVerification
): Promise<SkillResult> {
  const workId = args[0]?.trim();

  if (!workId) {
    return {
      ok: false,
      status: 'blocked',
      error: 'Usage: mia ship <workId>',
    };
  }

  let work = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, workId);
  if (!work) {
    return {
      ok: false,
      status: 'blocked',
      error: `Work not found: ${workId}`,
    };
  }

  if (work.state !== 'ready_to_ship') {
    return {
      ok: false,
      status: 'blocked',
      error: `Work is not ready to ship: ${work.state}`,
    };
  }

  const checks = ctx.skill ? resolveVerificationChecks(ctx.skill.verification) : repositoryChecks;
  const verification = await verify(ctx, checks);
  const passed =
    verification.passed &&
    verification.records.length > 0 &&
    verification.records.every((record) => record.status === 'passed');
  work = recordVerification(work, {
    runId: ctx.run.id,
    records: verification.records,
    passed,
  });

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  const lines = verification.records.map(
    (record) =>
      `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
  );

  if (!passed) {
    work = completeReview(transitionWork(work, 'review'), { passed: false });
  }

  const approval = work.requiresHumanApproval
    ? await loadApprovalForWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id, 'ship')
    : undefined;

  if (approval) {
    work = recordApproval(work, approval);
  }

  await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

  if (!passed) {
    return {
      ok: false,
      status: 'blocked',
      output: [
        'MIA ship gate',
        '',
        `Work: ${work.id}`,
        '',
        ...lines,
        '',
        'BLOCKED: verification did not pass. Work was not shipped.',
      ].join('\n'),
      error: 'Ship verification failed',
    };
  }

  try {
    const shipped = shipWork(
      work,
      checks.map((check) => check.name)
    );

    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, shipped);

    return {
      ok: true,
      status: 'success',
      output: [
        'MIA ship gate',
        '',
        `Work: ${shipped.id}`,
        '',
        ...lines,
        '',
        `SHIPPED: ${shipped.id}`,
      ].join('\n'),
    };
  } catch (error) {
    return {
      ok: false,
      status: 'blocked',
      output: [
        'MIA ship gate',
        '',
        `Work: ${work.id}`,
        '',
        ...lines,
        '',
        'BLOCKED: Work was not shipped.',
      ].join('\n'),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
