import { execute as checkpointExecute } from './checkpoint/execute.js';
import { execute as grillExecute } from './grill/execute.js';
import { execute as healthExecute } from './health/execute.js';
import { execute as learnExecute } from './learn/execute.js';
import { execute as memoryExecute } from './memory/execute.js';
import { execute as planExecute } from './plan/execute.js';
import { execute as retroExecute } from './retro/execute.js';
import { execute as reviewExecute } from './review/execute.js';
import { execute as shipExecute } from './ship/execute.js';
import { execute as specExecute } from './spec/execute.js';
import type { SkillDefinition, SkillExecutor } from './types.js';
import { execute as vcExecute } from './vc/execute.js';

const define = (
  name: string,
  description: string,
  sideEffects: SkillDefinition['manifest']['sideEffects'],
  verification: readonly string[],
  phase: SkillDefinition['manifest']['phase'],
  executor: SkillExecutor
): SkillDefinition => ({
  manifest: {
    name,
    version: '1.0.0',
    description,
    allowedTools: [],
    sideEffects,
    verification,
    phase,
  },
  executor,
});

export const skills: Record<string, SkillDefinition> = {
  grill: define('grill', 'Clarify intent before non-trivial work', 'none', [], 'clarify', {
    execute: grillExecute,
  }),
  plan: define('plan', 'Create an explicit implementation plan', 'local-write', [], 'plan', {
    execute: planExecute,
  }),
  spec: define('spec', 'Shape intent into a project specification', 'local-write', [], 'specify', {
    execute: specExecute,
  }),
  ship: define(
    'ship',
    'Run repository verification before handoff',
    'none',
    ['typecheck', 'lint', 'unused-code', 'tests', 'build'],
    'handoff',
    { execute: shipExecute }
  ),
  health: define(
    'health',
    'Run the repository verification suite',
    'none',
    ['typecheck', 'lint', 'unused-code', 'tests', 'build'],
    'verify',
    { execute: healthExecute }
  ),
  learn: define('learn', 'Store and retrieve project learnings', 'local-write', [], 'verify', {
    execute: learnExecute,
  }),
  retro: define('retro', 'Review recent activity and learnings', 'none', [], 'review', {
    execute: retroExecute,
  }),
  memory: define('memory', 'Read or append long-term memory', 'local-write', [], 'review', {
    execute: memoryExecute,
  }),
  checkpoint: define('checkpoint', 'Save or load working state', 'local-write', [], 'execute', {
    execute: checkpointExecute,
  }),
  review: define(
    'review',
    'Prepare a review surface for the current change',
    'none',
    [],
    'review',
    { execute: reviewExecute }
  ),
  vc: define('vc', 'Inspect and deliberately mutate Git state', 'git-write', [], 'execute', {
    execute: vcExecute,
  }),
};

export function getSkill(name: string): SkillDefinition | undefined {
  return skills[name];
}

export function listSkills(): string[] {
  return Object.keys(skills);
}

export function listSkillDefinitions(): SkillDefinition[] {
  return Object.values(skills);
}

export * from './types.js';
export * from './executor.js';
export * from './preamble.js';
