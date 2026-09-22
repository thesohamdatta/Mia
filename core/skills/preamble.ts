import type { ExecutionContext, SkillExecutor, SkillResult } from './types.js';

export type Middleware = (ctx: ExecutionContext, next: () => Promise<void>) => Promise<void>;

export const requireProject: Middleware = async (ctx, next) => {
  if (ctx.slug === 'default') {
    console.warn('Not in a git repository. Using default project.');
  }
  await next();
};

export const loadRecentLearnings: Middleware = async (ctx, next) => {
  try {
    const learnings = await ctx.unifiedStore.listLearnings(ctx.config.projectsDir, ctx.slug, 5);
    if (learnings.length > 0) {
      console.log('Recent learnings:');
      for (const learning of learnings) {
        const data = learning.data as { insight?: string; key?: string };
        console.log(`  • ${data.insight || data.key}`);
      }
    }
  } catch (error) {
    console.warn(
      `Could not load recent learnings: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  await next();
};

export const logTimelineStart: Middleware = async (ctx, next) => {
  try {
    await ctx.unifiedStore.appendTimeline(ctx.config.projectsDir, ctx.slug, {
      runId: ctx.run.id,
      skill: ctx.run.skill,
      event: 'started',
    });
  } catch (error) {
    console.warn(
      `Could not record timeline start: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  await next();
};

export async function runMiddlewares(
  middlewares: readonly Middleware[],
  ctx: ExecutionContext
): Promise<void> {
  let index = 0;
  const next = async (): Promise<void> => {
    const middleware = middlewares[index++];
    if (middleware) {
      await middleware(ctx, next);
    }
  };
  await next();
}

export function formatSkillOutput(result: SkillResult): string {
  if (!result.ok) {
    return `Error: ${result.error}`;
  }
  return result.output || 'Done';
}

async function recordCompletion(ctx: ExecutionContext, result: SkillResult): Promise<void> {
  try {
    await ctx.unifiedStore.appendTimeline(ctx.config.projectsDir, ctx.slug, {
      runId: ctx.run.id,
      skill: ctx.run.skill,
      event: result.ok ? 'completed' : 'failed',
      outcome: result.ok ? 'success' : 'failed',
    });
  } catch (error) {
    console.warn(
      `Could not record timeline completion: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function executeWithMiddlewares(
  executor: SkillExecutor,
  args: string[],
  ctx: ExecutionContext,
  skillName: string,
  middlewares: readonly Middleware[] = defaultMiddlewares
): Promise<SkillResult> {
  const run: ExecutionContext['run'] = {
    ...ctx.run,
    skill: skillName,
    status: 'running',
  };
  const executionContext: ExecutionContext = { ...ctx, run };

  let result: SkillResult = {
    ok: false,
    status: 'unknown',
    error: 'Skill did not produce a result',
  };

  try {
    await runMiddlewares(middlewares, executionContext);
    result = await executor.execute(args, executionContext);
  } catch (error) {
    result = {
      ok: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    const status = result.status ?? (result.ok ? 'success' : 'failed');
    executionContext.run.status = status;
    executionContext.run.finishedAt = new Date().toISOString();
    executionContext.run.error = result.error;
    await recordCompletion(executionContext, result);
  }

  return result;
}

export const defaultMiddlewares: Middleware[] = [
  requireProject,
  loadRecentLearnings,
  logTimelineStart,
];
