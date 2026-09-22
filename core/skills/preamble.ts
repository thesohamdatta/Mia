import type { ExecutionContext, SkillExecutor, SkillResult } from './types.js';

export interface SkillExecutionContext extends ExecutionContext {
  _skillName?: string;
  _skillResult?: SkillResult;
}

export type Middleware = (ctx: ExecutionContext, next: () => Promise<void>) => Promise<void>;

export const requireProject: Middleware = async (ctx, next) => {
  if (ctx.slug === 'default') {
    console.warn('⚠️  Not in a git repository. Using default project.');
  }
  await next();
};

export const loadRecentLearnings: Middleware = async (ctx, next) => {
  try {
    const projectsDir = ctx.config.projectsDir;
    const learnings = await ctx.unifiedStore.listLearnings(projectsDir, ctx.slug, 5);
    if (learnings.length > 0) {
      console.log('📚 Recent learnings:');
      for (const l of learnings) {
        const data = l.data as { insight?: string; key?: string };
        console.log(`  • ${data.insight || data.key}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Could not load recent learnings: ${message}`);
  }
  await next();
};

export const logTimelineStart: Middleware = async (ctx, next) => {
  const skillName = (ctx as SkillExecutionContext)._skillName || 'unknown';
  const projectsDir = ctx.config.projectsDir;
  try {
    await ctx.unifiedStore.appendTimeline(projectsDir, ctx.slug, {
      skill: skillName,
      event: 'started',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Could not record timeline start: ${message}`);
  }
  await next();
};

export const logTimelineComplete: Middleware = async (ctx, next) => {
  const skillName = (ctx as SkillExecutionContext)._skillName || 'unknown';
  const result = (ctx as SkillExecutionContext)._skillResult as SkillResult;
  const projectsDir = ctx.config.projectsDir;
  try {
    await ctx.unifiedStore.appendTimeline(projectsDir, ctx.slug, {
      skill: skillName,
      event: result.ok ? 'completed' : 'failed',
      outcome: result.ok ? 'success' : 'failed',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Could not record timeline completion: ${message}`);
  }
  await next();
};

export const defaultMiddlewares: Middleware[] = [
  requireProject,
  loadRecentLearnings,
  logTimelineStart,
];

export async function runMiddlewares(
  middlewares: Middleware[],
  ctx: ExecutionContext
): Promise<void> {
  let index = 0;
  const next = async (): Promise<void> => {
    if (index < middlewares.length) {
      const mw = middlewares[index++];
      if (mw) {
        await mw(ctx, next);
      }
    }
  };
  await next();
}

export function formatSkillOutput(result: SkillResult): string {
  if (!result.ok) {
    return `❌ ${result.error}`;
  }
  return result.output || '✅ Done';
}

export async function executeWithMiddlewares(
  executor: SkillExecutor,
  args: string[],
  ctx: ExecutionContext,
  skillName: string,
  middlewares: Middleware[] = defaultMiddlewares
): Promise<SkillResult> {
  const skillCtx = ctx as SkillExecutionContext;
  skillCtx._skillName = skillName;

  let result: SkillResult;

  try {
    await runMiddlewares(middlewares, ctx);
    result = await executor.execute(args, ctx);
  } catch (error) {
    result = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  skillCtx._skillResult = result;
  await logTimelineComplete(ctx, async () => {});

  return result;
}
