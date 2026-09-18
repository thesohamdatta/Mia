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
      const d = l.data as any;
      output += `  • [${d.type || 'pattern'}] ${d.key || 'unnamed'}: ${d.insight || ''}\n`;
    }
    return { ok: true, output };
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

  return { ok: true, output: 'Usage: mia learn [list|add <type> <key> <insight>]' };
}

export const executor: SkillExecutor = { execute };
