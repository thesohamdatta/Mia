// Weekly Skill Executor - Weekly retrospective
// Runs: mia weekly

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'weekly',
  version: '1.0.0',
  description: 'Weekly retrospective - trends, patterns, strategy',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['weekly', 'weekly retro', 'sprint retro'],
  whenToInvoke: 'End of each week. Deep retrospective with trend analysis.',
  workflow:
    "1. Aggregate daily reflections\n2. Analyze learnings trends\n3. Review health metrics\n4. Identify patterns (good/bad)\n5. Set next week's focus\n6. Update long-term memory",
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `📅  WEEKLY RETROSPECTIVE

## Patterns Noticed
- What worked consistently?
- What failed repeatedly?
- What should I automate?

## Health Check
- Cognitive debt: [low/medium/high]
- Context switching: [low/medium/high]
- Deep work time: [hours]

## Next Week's Focus
1. 
2. 
3. 

## Update long-term memory? (mia memory add)

~ observe → learn → distill → apply → verify → evolve ~`,
  };
}
