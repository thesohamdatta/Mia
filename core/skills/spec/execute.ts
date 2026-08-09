// Spec Skill Executor - Turn intent into PRD → issues
// Runs: mia spec

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(_args: string[], _ctx: ExecutionContext): Promise<SkillResult> {
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

Run 'mia spec start <description>' to begin.`,
  };
}

export const executor: SkillExecutor = { execute };
