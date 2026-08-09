import { executeWithMiddlewares } from './preamble.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from './types.js';

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
