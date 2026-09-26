import { loadApprovalForWork } from '../../approval/persistence.js';
import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks } from '../../verification/suite.js';
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

  const work = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, workId);
  if (!work) {
    return {
      ok: false,
      status: 'blocked',
      error: `Work not found: ${workId}`,
    };
  }

  const verification = await verify(ctx, repositoryChecks);

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  const lines = verification.records.map(
    (record) =>
      `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
  );

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

  const approval = work.requiresHumanApproval
    ? await loadApprovalForWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work.id, 'ship')
    : undefined;

  try {
    const shipped = shipWork(work, {
      verificationPassed: verification.passed,
      approval,
    });

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
