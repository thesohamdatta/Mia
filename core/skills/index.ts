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
import type { SkillExecutor } from './types.js';
import { execute as vcExecute } from './vc/execute.js';

export const skillMap: Record<string, SkillExecutor> = {
  grill: { execute: grillExecute },
  plan: { execute: planExecute },
  spec: { execute: specExecute },
  ship: { execute: shipExecute },
  health: { execute: healthExecute },
  learn: { execute: learnExecute },
  retro: { execute: retroExecute },
  memory: { execute: memoryExecute },
  checkpoint: { execute: checkpointExecute },
  review: { execute: reviewExecute },
  vc: { execute: vcExecute },
};

export function getSkillExecutor(name: string): SkillExecutor | undefined {
  return skillMap[name];
}

export function listSkills(): string[] {
  return Object.keys(skillMap);
}

export * from './types.js';
export * from './executor.js';
export * from './preamble.js';
