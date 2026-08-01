// Review Skill Executor - Pre-landing PR review
// Runs: mia review

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'review',
  version: '1.0.0',
  description: 'Pre-landing PR review',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['review', 'code review', 'pr review'],
  whenToInvoke: 'Before ship. Adversarial review of changes.',
  workflow:
    '1. Fetch diff\n2. Run adversarial checks (security, perf, maintainability)\n3. Run specialist checks if needed\n4. Output findings with confidence scores\n5. Block if critical issues',
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
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

Run 'mia review' on current branch. please`,
  };
}
