import type { ExecutionContext, SkillExecutor, SkillResult } from './types.js';

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
  } catch {
    // Ignore
  }
  await next();
};

export const logTimelineStart: Middleware = async (ctx, next) => {
  const skillName = (ctx as any)._skillName || 'unknown';
  const projectsDir = ctx.config.projectsDir;
  await ctx.unifiedStore.appendTimeline(projectsDir, ctx.slug, {
    skill: skillName,
    event: 'started',
  });
  await next();
};

export const logTimelineComplete: Middleware = async (ctx, next) => {
  const skillName = (ctx as any)._skillName || 'unknown';
  const result = (ctx as any)._skillResult as SkillResult;
  const projectsDir = ctx.config.projectsDir;
  await ctx.unifiedStore.appendTimeline(projectsDir, ctx.slug, {
    skill: skillName,
    event: 'completed',
    outcome: result.ok ? 'success' : 'failed',
  });
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
  (ctx as any)._skillName = skillName;

  await runMiddlewares(middlewares, ctx);

  const result = await executor.execute(args, ctx);

  (ctx as any)._skillResult = result;
  await logTimelineComplete(ctx, async () => {});

  return result;
}
