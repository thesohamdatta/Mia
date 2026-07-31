// Plan Skill Executor - Verifiable planning
// Runs: mia plan

import { type SkillManifest } from "../../skill-loader";

export const manifest: SkillManifest = {
  name: "plan",
  version: "1.0.0",
  description: "Create a verifiable plan with success criteria",
  preambleTier: 1,
  allowedTools: ["Bash", "Read", "Write", "AskUserQuestion"],
  triggers: ["plan", "create plan", "planning"],
  whenToInvoke: "After grill, before implementation. Grill-to-Ship: brainstorm → grill → plan → spec → TDD → execute → review → commit",
  workflow: "1. Define objective and success criteria\n2. Break into verifiable steps\n3. Identify dependencies and risks\n4. Write ADR for architectural decisions\n5. Get approval before execute"
};

export async function execute(args: string[], token: string): Promise<{ ok: boolean; output?: string; error?: string }> {
  const subcmd = args[0] || "create";
  
  if (subcmd === "create") {
    return { ok: true, output: `📋 PLAN MODE

Grill-to-Ship pipeline:
brainstorm → grill → plan → spec → TDD → execute → review → commit

Write a verifiable plan with success criteria before implementing.
Run 'mia spec' to turn intent into a PRD first. please` };
  }
  
  if (subcmd === "template") {
    return { ok: true, output: `Plan Template:

## Objective
[One sentence: what are we building?]

## Success Criteria (verifiable)
- [ ] Criterion 1: measurable outcome
- [ ] Criterion 2: measurable outcome
- [ ] Criterion 3: measurable outcome

## Steps
1. [Step 1: specific, testable]
2. [Step 2: specific, testable]
3. [Step 3: specific, testable]

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

## Dependencies
- [ ] Dependency 1
- [ ] Dependency 2

## Out of Scope
- [Explicitly not doing]

Run 'mia plan create' to start. please` };
  }
  
  return { ok: true, output: "Usage: mia plan [create|template]" };
}