// Review Skill Executor - Pre-landing PR review
// Runs: mia review

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(_args: string[], _ctx: ExecutionContext): Promise<SkillResult> {
  return {
    ok: true,
    output: `🔍 REVIEW MODE

Pre-landing PR Review (adversarial)

Checks:
- Security: injection, auth, secrets
- Performance: N+1, memory, bundles
- Maintainability: complexity, coupling, naming
- Testing: coverage, edge cases
- Architecture: boundaries, contracts

Output: findings with confidence (1-10)
Blocks ship if critical (conf ≥ 8)

Run 'mia review' on current branch.`,
  };
}

export const executor: SkillExecutor = { execute };
