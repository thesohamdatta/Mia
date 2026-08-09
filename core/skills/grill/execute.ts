// Grill Skill Executor - Golden rule enforcement
// Runs: mia grill

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], _ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'start';

  if (subcmd === 'start') {
    return {
      ok: true,
      output: `🔥 GRILL MODE ACTIVATED

Golden Rule: Never jump to code without a grill session for anything non-trivial.

Let's clarify:
1. What's the actual problem we're solving?
2. What are your assumptions?
3. What could go wrong?
4. What does 'done' look like?

Answer these, then we'll proceed.`,
    };
  }

  if (subcmd === 'questions') {
    return {
      ok: true,
      output: `Grill Questions Template:

PROBLEM: What are we actually solving? (one sentence)
ASSUMPTIONS: What do we believe is true?
RISKS: What could go wrong? (technical, product, timeline)
SUCCESS: What does 'done' look like? (verifiable criteria)
DEPENDENCIES: What do we need from others?
SCOPE: What's explicitly NOT in scope?

Run 'mia grill start' to begin interactive session.`,
    };
  }

  return { ok: true, output: 'Usage: mia grill [start|questions]' };
}

export const executor: SkillExecutor = { execute };
