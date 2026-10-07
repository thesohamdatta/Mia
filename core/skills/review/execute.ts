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

  // Determine which criteria (if any) are attested for this run — for display only at this point
  const criteriaDisplay: { criterion: string; attested: boolean }[] | undefined =
    work.successCriteria.length > 0
      ? work.successCriteria.map((criterion) => ({
          criterion,
          attested: attestAll || attestedCriteria.includes(criterion),
        }))
      : undefined;

  const allCriteriaAttested = criteriaDisplay?.every((c) => c.attested) ?? true;

  // Only write criteria to the verification record when all pass — prevents stale 'failed' entries
  const criteriaEvidence: CriterionEvidence[] | undefined =
    criteriaDisplay && allCriteriaAttested
      ? criteriaDisplay.map((c) => ({ criterion: c.criterion, status: 'passed' as const }))
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

  if (!allCriteriaAttested && criteriaDisplay) {
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
        ...criteriaDisplay.map((c) => `${c.attested ? 'PASS' : 'UNVERIFIED'} ${c.criterion}`),
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
      ...(criteriaDisplay
        ? ['', 'CRITERIA:', ...criteriaDisplay.map((c) => `PASS ${c.criterion}`)]
        : []),
      '',
      `READY_TO_SHIP: ${work.id}`,
    ].join('\n'),
  };
}

export const executor: SkillExecutor = { execute };
