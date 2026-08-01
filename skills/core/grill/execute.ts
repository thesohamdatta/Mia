// Grill Skill Executor - Golden rule enforcement
// Runs: mia grill

import type { SkillManifest } from '../skill-loader';

export const manifest: SkillManifest = {
  name: 'grill',
  version: '1.0.0',
  description: 'Start a clarification interview (golden rule enforcement)',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write', 'AskUserQuestion'],
  triggers: ['grill', 'clarify', 'before coding'],
  whenToInvoke:
    'ALWAYS before any non-trivial implementation. Golden Rule: Never jump to code without a grill session.',
  workflow:
    "1. State the problem in one sentence\n2. List assumptions\n3. Identify risks\n4. Define 'done' criteria\n5. Get human approval before proceeding",
};

export async function execute(
  args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
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

Answer these, then we'll proceed. please`,
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

Run 'mia grill start' to begin interactive session. please`,
    };
  }

  return { ok: true, output: 'Usage: mia grill [start|questions]' };
}
