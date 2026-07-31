// Retro Skill Executor - Weekly retrospective with timeline + learnings
// Runs: mia retro

import { type SkillManifest } from "../../skill-loader";

export const manifest: SkillManifest = {
  name: "retro",
  version: "1.0.0",
  description: "Weekly retrospective with timeline + learnings",
  preambleTier: 2,
  allowedTools: ["Bash", "Read", "Write", "AskUserQuestion"],
  triggers: ["retro", "weekly retro", "retrospective"],
  whenToInvoke: "End of work week or sprint. Proactively suggest every Friday. Combines timeline events + learnings + reflection.",
  workflow: "1. Auto-loads recent timeline (20 events) and learnings (10)\n2. Guided reflection: what went well, what to improve, next steps\n3. Outputs structured retro for memory.md\n4. Can fold into long-term memory"
};

export async function execute(args: string[], token: string): Promise<{ ok: boolean; output?: string; error?: string }> {
  return { ok: true, output: `📊 RETROSPECTIVE

Run 'mia retro' through the CLI for full timeline + learnings data from ~/.mia/projects/{slug}/

Template:
## Recent Activity (auto-loaded)

## Key Learnings (auto-loaded)

## What went well

## What to improve

## Next steps

~ observe → learn → distill → apply → verify → evolve ~` };
}