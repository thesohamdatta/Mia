import { executeWithMiddlewares } from './preamble.js';
import type {
  ExecutionContext,
  SkillDefinition,
  SkillExecutor,
  SkillResult,
  SkillInvocation,
} from './types.js';

export class SkillContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkillContractError';
  }
}

const invocations = new Set<SkillInvocation>(['user', 'model', 'both']);

const phases = new Set<SkillDefinition['manifest']['phase']>([
  'clarify',
  'plan',
  'specify',
  'execute',
  'verify',
  'review',
  'handoff',
]);

export function validateSkillDefinition(definition: SkillDefinition): void {
  const { manifest } = definition;

  if (!manifest.name.trim()) {
    throw new SkillContractError('Skill manifest name must not be empty');
  }

  if (!manifest.version.trim()) {
    throw new SkillContractError(`Skill "${manifest.name}" must declare a version`);
  }

  if (!manifest.description.trim()) {
    throw new SkillContractError(`Skill "${manifest.name}" must declare a description`);
  }

  if (!phases.has(manifest.phase)) {
    throw new SkillContractError(
      `Skill "${manifest.name}" has an unsupported phase "${manifest.phase}"`
    );
  }

  if (manifest.invocation !== undefined && !invocations.has(manifest.invocation)) {
    throw new SkillContractError(
      `Skill "${manifest.name}" has an unsupported invocation "${manifest.invocation}"`
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
  } catch (error) {
    return {
      ok: false,
      status: 'blocked',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return executeWithMiddlewares(definition.executor, args, context, definition.manifest.name);
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
