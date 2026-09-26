import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks } from '../../verification/suite.js';
import {
  completeReview,
  completeVerification,
  enterVerification,
  startWork,
} from '../../work/lifecycle.js';
import { loadWork, saveWork } from '../../work/persistence.js';
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
      error: 'Usage: mia review <workId>',
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

  if (work.state === 'planned') {
    work = startWork(work);
  }

  if (work.state !== 'in_progress') {
    return {
      ok: false,
      status: 'blocked',
      error: `Work is not reviewable from state: ${work.state}`,
    };
  }

  work = enterVerification(work);

  const verification = await verify(ctx, repositoryChecks.slice(0, 4));

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  if (!verification.passed) {
    work = completeVerification(work, { passed: false });
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    return {
      ok: false,
      status: 'blocked',
      output: [
        'MIA review gate',
        '',
        `Work: ${work.id}`,
        '',
        ...verification.records.map(
          (record) =>
            `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
        ),
        '',
        'BLOCKED: verification failed. Work returned to in_progress.',
      ].join('\n'),
      error: 'Review verification failed',
    };
  }

  work = completeVerification(work, { passed: true });
  work = completeReview(work, { passed: true });
  await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

  return {
    ok: true,
    status: 'success',
    output: [
      'MIA review gate',
      '',
      `Work: ${work.id}`,
      '',
      ...verification.records.map(
        (record) => `PASS ${record.name} (${record.durationMs}ms)`
      ),
      '',
      `READY_TO_SHIP: ${work.id}`,
    ].join('\n'),
  };
}

export const executor: SkillExecutor = { execute };
