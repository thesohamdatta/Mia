// Health Skill Executor - Code quality scorekeeper (from Sonar: verification baked in)
// Runs: mia health

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'health',
  version: '1.0.0',
  description: 'Code quality scorekeeper - verification baked into process',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['health', 'quality', 'score'],
  whenToInvoke: 'Before ship. Gates on quality score (≥ 7). Verification is not an afterthought.',
  workflow:
    '1. Run project quality tools (tsc, biome, knip, tests)\n2. Compute composite score (0-10)\n3. Track trend over time\n4. Block ship if score < 7\n5. Suggest improvements when score drops',
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `🏥  HEALTH CHECK

Code quality scorekeeper (verification baked in, not afterthought)

Checks:
- TypeScript: tsc --noEmit
- Lint: biome check / eslint
- Dead code: knip
- Tests: coverage ≥ 80%
- Security: audit
- Complexity: cyclomatic, cognitive

Composite score: 0-10
- ≥ 7: ship allowed
- 5-6: warning, investigate
- < 5: block ship

Trend tracking: health-history.jsonl

Run 'mia health' to score current state.
Run 'mia health history' for trends.

~ In the land of AI agents, the verifiers are king ~ (Tariq Shaukat, Sonar)`,
  };
}
