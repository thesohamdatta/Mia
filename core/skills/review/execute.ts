import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';
import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks } from '../../verification/suite.js';

export async function execute(_args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const verification = await runVerification(ctx, repositoryChecks.slice(0, 4));

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  const failed = verification.records.filter((record) => record.status !== 'passed');
  const output = [
    'MIA review preflight',
    '',
    `Run: ${ctx.run.id}`,
    `Checks: ${verification.records.length}`,
    '',
    ...verification.records.map(
      (record) =>
        `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
    ),
    '',
    failed.length === 0
      ? 'READY FOR HUMAN OR INDEPENDENT REVIEW: deterministic checks passed.'
      : 'REVIEW REQUIRED: one or more deterministic checks failed.',
    '',
    'This command does not make an architectural or security verdict. It reports executable evidence.',
  ].join('\n');

  return {
    ok: failed.length === 0,
    status: failed.length === 0 ? 'success' : 'blocked',
    output,
    error: failed.length === 0 ? undefined : 'Review preflight failed',
  };
}

export const executor: SkillExecutor = { execute };