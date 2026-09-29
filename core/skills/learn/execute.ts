// Learn Skill Executor - Manage project learnings
// Runs: mia learn

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'list';
  const projectsDir = ctx.config.projectsDir;

  if (subcmd === 'list') {
    const learnings = await ctx.unifiedStore.listLearnings(projectsDir, ctx.slug, 20);
    if (learnings.length === 0) {
      return {
        ok: true,
        output: '📚 No learnings yet. Add one with: mia learn add <type> <key> <insight>',
      };
    }
    let output = '📚 Learnings:\n\n';
    for (const l of learnings) {
      const d = l.data as { type?: string; key?: string; insight?: string };
      output += `  • [${d.type || 'pattern'}] ${d.key || 'unnamed'}: ${d.insight || ''}\n`;
    }
    return { ok: true, output };
  }

  if (subcmd === 'apply') {
    const [, key] = args;
    if (!key) {
      return { ok: false, status: 'blocked', error: 'Usage: mia learn apply <key>' };
    }

    const learnings = await ctx.unifiedStore.listLearnings(projectsDir, ctx.slug, 50);
    const match = learnings
      .map((event) => event.data as LearningRecord)
      .find((learning) => learning.key === key);

    if (!match) {
      return { ok: false, status: 'blocked', error: `Learning not found: ${key}` };
    }

    await ctx.unifiedStore.appendTimeline(projectsDir, ctx.slug, {
      kind: 'learning-applied',
      key: match.key,
      runId: ctx.run.id,
      sourceRunId: match.sourceRunId,
    });

    await ctx.unifiedStore.appendLearning(projectsDir, ctx.slug, {
      ...match,
      appliedInRunIds: [...(match.appliedInRunIds ?? []), ctx.run.id],
    });

    return {
      ok: true,
      status: 'success',
      output: `Learning applied: ${key}`,
    };
  }

  if (subcmd === 'add') {
    const [, type, key, ...insightParts] = args;
    const insight = insightParts.join(' ');
    if (!type || !key || !insight) {
      return { ok: false, error: 'Usage: mia learn add <type> <key> <insight>' };
    }
    await ctx.unifiedStore.appendLearning(projectsDir, ctx.slug, {
      type,
      key,
      insight,
      ts: new Date().toISOString(),
    });
    return { ok: true, output: `✓ Learning saved: ${key}\n  [${type}] ${insight}` };
  }

  return { ok: true, output: 'Usage: mia learn [list|add <type> <key> <insight>|apply <key>]' };
}

export const executor: SkillExecutor = { execute };
