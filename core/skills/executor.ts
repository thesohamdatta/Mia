import { logSkillComplete } from './preamble.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from './types.js';

export async function executeSkill(
  executor: SkillExecutor,
  args: string[],
  context: ExecutionContext,
  skillName: string
): Promise<SkillResult> {
  const _startTime = Date.now();

  try {
    const result = await executor.execute(args, context);

    // Log completion
    await logSkillComplete(context.slug, skillName, result);

    return result;
  } catch (error) {
    const errorResult: SkillResult = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };

    await logSkillComplete(context.slug, skillName, errorResult);

    return errorResult;
  }
}

export function createExecutor(
  fn: (args: string[], context: ExecutionContext) => Promise<SkillResult>
): SkillExecutor {
  return { execute: fn };
}
