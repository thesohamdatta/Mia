import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';
import { setupAgentSkills } from '../../agent/setup.js';

export const execute: SkillExecutor['execute'] = async (
  _args: string[],
  ctx: ExecutionContext
): Promise<SkillResult> => {
  const result = await setupAgentSkills(ctx.cwd);
  const lines = Object.entries(result).map(
    ([host, surface]) =>
      `${host}: generated ${surface.generated.join(', ') || 'none'}` +
      (surface.skipped.length > 0
        ? `; skipped ${surface.skipped.join(', ')}`
        : '')
  );

  return {
    ok: true,
    status: 'success',
    output: lines.join('\n'),
  };
};
