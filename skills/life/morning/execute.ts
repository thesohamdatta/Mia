// Morning Skill Executor - Daily startup ritual
// Runs: mia morning

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'morning',
  version: '1.0.0',
  description: 'Daily startup ritual - context, priorities, learnings',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['morning', 'start day', 'daily start'],
  whenToInvoke:
    'First thing each work day. Loads context, sets priorities, prevents cognitive debt.',
  workflow:
    '1. Load long-term memory\n2. Show recent learnings\n3. Check timeline for yesterday\n4. Set 3 priorities for today\n5. Check calendar/health',
};

export async function execute(
  _args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  return {
    ok: true,
    output: `☀️  MORNING BRIEFING

## Today's 3 Priorities
1. 
2. 
3. 

## Quick Checks
- [ ] Calendar: any meetings?
- [ ] Health: sleep, movement, water
- [ ] Inbox: urgent items?

~ observe → learn → distill → apply → verify → evolve ~`,
  };
}
