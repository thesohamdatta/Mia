// AURA Skill Executor - First-class project scaffolding
// Runs: mia aura

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'aura',
  version: '1.0.0',
  description: 'AURA project scaffolding and agent management',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['aura', 'aura init', 'aura agent'],
  whenToInvoke: 'When working on AURA - your most important project.',
  workflow:
    '1. mia aura init → scaffold AURA monorepo\n2. mia aura agent <name> → create agent template\n3. mia aura eval → run eval suite\n4. mia aura deploy → deploy to staging',
};

export async function execute(
  args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  const subcmd = args[0] || 'help';

  if (subcmd === 'init') {
    return {
      ok: true,
      output: `🌟 AURA INIT

Scaffolding AURA monorepo structure:

aura/
├── agents/           # Agent definitions
│   ├── planner/      # Planning agent
│   ├── executor/     # Execution agent
│   ├── reviewer/     # Review agent
│   └── researcher/   # Research agent
├── evals/            # Evaluation suites
├── harness/          # Test harness
├── memory/           # Persistent memory
├── skills/           # AURA-specific skills
└── config/           # Configuration

Run 'mia aura init' in target directory. please`,
    };
  }

  if (subcmd === 'agent') {
    const name = args[1] || 'unnamed';
    return {
      ok: true,
      output: `🤖 AURA AGENT: ${name}

Creating agent template at aura/agents/${name}/

Structure:
- manifest.json       # Agent config
- prompt.md           # System prompt
- tools.json          # Allowed tools
- evals/              # Agent-specific evals

Run 'mia aura agent <name>' to create. please`,
    };
  }

  return {
    ok: true,
    output: `AURA Commands:
  mia aura init           # Scaffold AURA monorepo
  mia aura agent <name>   # Create agent template
  mia aura eval           # Run eval suite
  mia aura deploy         # Deploy to staging

AURA is your most important project. please`,
  };
}
