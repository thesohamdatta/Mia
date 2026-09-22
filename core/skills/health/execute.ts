import { repositoryChecks } from '../../verification/suite.js';
import { runVerification } from '../../verification/run-checks.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(_args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const verification = await runVerification(ctx, repositoryChecks);

  for (const record of verification.records) {
    await ctx.unifiedStore.appendEvidence(ctx.config.projectsDir, ctx.slug, record);
  }

  const lines = verification.records.map(
    (record) =>
      `${record.status === 'passed' ? 'PASS' : 'FAIL'} ${record.name} (${record.durationMs}ms)`
  );

  return {
    ok: verification.passed,
    status: verification.passed ? 'success' : 'failed',
    output: [
      'MIA health verification',
      '',
      ...lines,
      '',
      verification.passed
        ? 'All configured repository checks passed.'
        : 'Repository verification failed. Inspect the recorded evidence before shipping.',
    ].join('\n'),
    error: verification.passed ? undefined : 'One or more repository checks failed',
  };
}

export const executor: SkillExecutor = { execute };
