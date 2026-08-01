// Ship Skill Executor - Test → review → push → PR
// Runs: mia ship

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'ship',
  version: '1.0.0',
  description: 'Test → review → push → PR',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['ship', 'deploy', 'push'],
  whenToInvoke: 'After review passes. Final step in grill-to-ship.',
  workflow:
    '1. Run all tests\n2. Run health check (score ≥ 7)\n3. Create PR with changelog\n4. Push and create PR\n5. Verify CI passes',
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `🚀 SHIP MODE

Test → Review → Push → PR

Pipeline:
1. Tests: run full test suite
2. Health: mia health (score ≥ 7)
3. Review: mia review (if not done)
4. Changelog: auto-generate
5. Push: git push origin <branch>
6. PR: gh pr create --fill

Success criteria: all green, health ≥ 7, PR approved.

Run 'mia ship' to start pipeline. please`,
  };
}
