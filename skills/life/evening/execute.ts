// Evening Skill Executor - Daily shutdown ritual
// Runs: mia evening

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'evening',
  version: '1.0.0',
  description: 'Daily shutdown ritual - capture, reflect, prepare tomorrow',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['evening', 'end day', 'daily end'],
  whenToInvoke:
    'End of each work day. Captures learnings, prevents cognitive debt, prepares tomorrow.',
  workflow:
    "1. What did I ship today?\n2. What did I learn? (add to learnings)\n3. What's blocked?\n4. What are tomorrow's 3 priorities?\n5. Fold into long-term memory",
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `🌙  EVENING REFLECTION

## What went well

## What to improve

## What did I learn? (add with 'mia learn add')

## Blocked / Need help

## Tomorrow's 3 Priorities
1. 
2. 
3. 

## Fold into long-term memory? (run 'mia memory add')

~ observe → learn → distill → apply → verify → evolve ~`,
  };
}
