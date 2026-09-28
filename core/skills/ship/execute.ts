import { loadApprovalForWork } from '../../approval/persistence.js';
import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks, resolveVerificationChecks } from '../../verification/suite.js';
import { recordApproval, recordVerification } from '../../work/lifecycle.js';
import { loadWork, saveWork } from '../../work/persistence.js';
import { shipWork } from '../../work/ship.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

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

  const checks = ctx.skill ? resolveVerificationChecks(ctx.skill.verification) : repositoryChecks;
  const verification = await verify(ctx, checks);
  work = recordVerification(work, {
    runId: ctx.run.id,
    records: verification.records,
    passed: verification.passed,
  });

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  const lines = verification.records.map(
    (record) =>
      `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
  );

  const approval = work.requiresHumanApproval
    ? await loadApprovalForWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id, 'ship')
    : undefined;

  if (approval) {
    work = recordApproval(work, approval);
  }

  await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

  if (!verification.passed) {
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
    const shipped = shipWork(work);

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

export const executor: SkillExecutor = { execute };
