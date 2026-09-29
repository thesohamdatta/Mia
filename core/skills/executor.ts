import { executeWithMiddlewares } from './preamble.js';
import type {
  ExecutionContext,
  SkillDefinition,
  SkillExecutor,
  SkillInvocation,
  SkillManifest,
  SkillResult,
} from './types.js';

export class SkillContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkillContractError';
  }
}

const invocations = new Set<SkillInvocation>(['user', 'model', 'both']);
const sideEffects = new Set<SkillManifest['sideEffects']>([
  'none',
  'local-write',
  'git-write',
  'external',
]);
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

const phases = new Set<SkillDefinition['manifest']['phase']>([
  'clarify',
  'plan',
  'specify',
  'execute',
  'verify',
  'review',
  'handoff',
]);

function validateStringList(
  values: readonly string[],
  field: 'allowedTools' | 'verification',
  skillName: string
): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (!value.trim()) {
      throw new SkillContractError(`Skill "${skillName}" has an empty ${field} entry`);
    }

    const normalized = value.trim();

    if (seen.has(normalized)) {
      throw new SkillContractError(
        `Skill "${skillName}" declares duplicate ${field} "${normalized}"`
      );
    }

    seen.add(normalized);
  }
}

export function enforceSkillCapabilities(
  manifest: SkillManifest,
  grantedTools: readonly string[]
): void {
  const grants = new Set(grantedTools.map((tool) => tool.trim()).filter(Boolean));
  const missing = manifest.allowedTools
    .map((tool) => tool.trim())
    .filter((tool) => !grants.has(tool));

  if (missing.length > 0) {
    throw new SkillContractError(
      `Skill "${manifest.name}" requires unavailable tool capabilities: ${missing.join(', ')}`
    );
  }
}

export function validateSkillDefinition(definition: SkillDefinition): void {
  const { manifest } = definition;

  if (!manifest.name.trim()) {
    throw new SkillContractError('Skill manifest name must not be empty');
  }

  if (!versionPattern.test(manifest.version.trim())) {
    throw new SkillContractError(
      `Skill "${manifest.name}" must declare a semantic version (x.y.z)`
    );
  }

  if (!manifest.description.trim()) {
    throw new SkillContractError(`Skill "${manifest.name}" must declare a description`);
  }

  if (!sideEffects.has(manifest.sideEffects)) {
    throw new SkillContractError(
      `Skill "${manifest.name}" has an unsupported side-effect class "${manifest.sideEffects}"`
    );
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

  validateStringList(manifest.allowedTools, 'allowedTools', manifest.name);
  validateStringList(manifest.verification, 'verification', manifest.name);
}

export async function executeSkillDefinition(
  definition: SkillDefinition,
  args: string[],
  context: ExecutionContext
): Promise<SkillResult> {
  try {
    validateSkillDefinition(definition);
    enforceSkillCapabilities(definition.manifest, context.grantedTools);
  } catch (error) {
    return {
      ok: false,
      status: 'blocked',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return executeWithMiddlewares(
    definition.executor,
    args,
    context,
    definition.manifest.name,
    undefined,
    definition.manifest
  );
}

export function createExecutor(
  fn: (args: string[], context: ExecutionContext) => Promise<SkillResult>
): SkillExecutor {
  return { execute: fn };
}
