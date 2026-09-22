import { executeWithMiddlewares } from './preamble.js';
import type { ExecutionContext, SkillDefinition, SkillExecutor, SkillResult } from './types.js';

export class SkillContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkillContractError';
  }
}

export function validateSkillDefinition(definition: SkillDefinition): void {
  const { manifest } = definition;
  if (!manifest.name.trim()) {
    throw new SkillContractError('Skill manifest name must not be empty');
  }
  if (!manifest.version.trim()) {
    throw new SkillContractError(`Skill "${manifest.name}" must declare a version`);
  }
  const phases = new Set([
    'clarify',
    'plan',
    'specify',
    'execute',
    'verify',
    'review',
    'handoff',
  ]);
  if (!phases.has(manifest.phase)) {
    throw new SkillContractError(
      `Skill "${manifest.name}" has an unsupported phase "${manifest.phase}"`
    );
  }
}

export async function executeSkillDefinition(
  definition: SkillDefinition,
  args: string[],
  context: ExecutionContext
): Promise<SkillResult> {
  try {
    validateSkillDefinition(definition);
    return await executeWithMiddlewares(
      definition.executor,
      args,
      context,
      definition.manifest.name
    );
  } catch (error) {
    return {
      ok: false,
      status: 'blocked',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function executeSkill(
  executor: SkillExecutor,
  args: string[],
  context: ExecutionContext,
  skillName: string
): Promise<SkillResult> {
  return executeWithMiddlewares(executor, args, context, skillName);
}

export function createExecutor(
  fn: (args: string[], context: ExecutionContext) => Promise<SkillResult>
): SkillExecutor {
  return { execute: fn };
}
