// Spec Skill Executor - Turn intent into PRD → issues
// Runs: mia spec

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'spec',
  version: '1.0.0',
  description: 'Turn intent into PRD → issues',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write', 'AskUserQuestion'],
  triggers: ['spec', 'prd', 'specification'],
  whenToInvoke: 'After plan, before TDD. Creates a Product Requirements Document from intent.',
  workflow:
    '1. Clarify intent with user\n2. Write PRD with user stories\n3. Break into issues with acceptance criteria\n4. Prioritize and estimate\n4. Get approval',
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `📝 SPEC MODE

Intent → PRD → Issues

1. Describe what you're building (one paragraph)
2. I'll generate a PRD with:
   - Problem statement
   - User stories
   - Acceptance criteria
   - Technical approach
   - Risks
3. We'll break into atomic issues
4. You approve, then we TDD

Run 'mia spec start <description>' to begin. please`,
  };
}
