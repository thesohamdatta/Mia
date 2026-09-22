import { runVerification } from '../../verification/run-checks.js';
import { repositoryChecks } from '../../verification/suite.js';
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
    status: verification.passed ? 'success' : 'blocked',
    output: [
      'MIA ship gate',
      '',
      ...lines,
      '',
      verification.passed
        ? 'VERIFIED: repository checks passed. No push or merge was performed.'
        : 'BLOCKED: repository checks did not all pass. No push or merge was performed.',
    ].join('\n'),
    error: verification.passed ? undefined : 'Ship gate failed',
  };
}

export const executor: SkillExecutor = { execute };
