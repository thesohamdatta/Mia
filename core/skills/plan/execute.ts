// Plan Skill Executor - Verifiable planning
// Runs: mia plan

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], _ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'create';

  if (subcmd === 'create') {
    return {
      ok: true,
      output: `📋 PLAN MODE

Grill-to-Ship pipeline:
brainstorm → grill → plan → spec → TDD → execute → review → commit

Write a verifiable plan with success criteria before implementing.
Run 'mia spec' to turn intent into a PRD first.`,
    };
  }

  if (subcmd === 'template') {
    return {
      ok: true,
      output: `Plan Template:

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

Run 'mia plan create' to start.`,
    };
  }

  return { ok: true, output: 'Usage: mia plan [create|template]' };
}

export const executor: SkillExecutor = { execute };
