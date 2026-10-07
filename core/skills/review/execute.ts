import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks, resolveVerificationChecks } from '../../verification/suite.js';
import {
  completeReview,
  completeVerification,
  enterVerification,
  recordVerification,
  startWork,
} from '../../work/lifecycle.js';
import { loadWork, saveWork } from '../../work/persistence.js';
import type { CriterionEvidence } from '../../work/types.js';
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

  const attestAll = args.includes('--attest-all');
  const attestedCriteria: string[] = [];
  for (let i = 1; i < args.length; i++) {
    const criterion = args[i + 1];
    if (args[i] === '--criterion' && typeof criterion === 'string') {
      attestedCriteria.push(criterion);
      i++;
    }
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

  const checks = ctx.skill
    ? resolveVerificationChecks(ctx.skill.verification)
    : repositoryChecks.slice(0, 4);
  const verification = await verify(ctx, checks);

  const criteriaEvidence: CriterionEvidence[] | undefined =
    work.successCriteria.length > 0
      ? work.successCriteria.map((criterion) => ({
          criterion,
          status: attestAll || attestedCriteria.includes(criterion) ? 'passed' : 'failed',
        }))
      : undefined;

  work = recordVerification(work, {
    runId: ctx.run.id,
    records: verification.records,
    passed: verification.passed,
    criteria: criteriaEvidence,
  });

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

  if (criteriaEvidence?.some((c) => c.status !== 'passed')) {
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
        ...verification.records.map((record) => `PASS ${record.name} (${record.durationMs}ms)`),
        '',
        'CRITERIA:',
        ...criteriaEvidence.map(
          (c) => `${c.status === 'passed' ? 'PASS' : 'UNVERIFIED'} ${c.criterion}`
        ),
        '',
        'BLOCKED: Success criteria require verification evidence before ready_to_ship.',
      ].join('\n'),
      error: 'Review criteria verification failed',
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
      ...verification.records.map((record) => `PASS ${record.name} (${record.durationMs}ms)`),
      ...(criteriaEvidence
        ? ['', 'CRITERIA:', ...criteriaEvidence.map((c) => `PASS ${c.criterion}`)]
        : []),
      '',
      `READY_TO_SHIP: ${work.id}`,
    ].join('\n'),
  };
}

export const executor: SkillExecutor = { execute };
