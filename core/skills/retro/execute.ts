// Retro Skill Executor - Weekly retrospective with timeline + learnings
// Runs: mia retro

import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(_args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const projectsDir = ctx.config.projectsDir;
  const timeline = await ctx.unifiedStore.listTimeline(projectsDir, ctx.slug, 20);
  const learnings = await ctx.unifiedStore.listLearnings(projectsDir, ctx.slug, 10);

  interface TimelineData {
    skill?: string;
    event?: string;
    outcome?: string;
  }

  interface LearningData {
    type?: string;
    key?: string;
    insight?: string;
  }

  let output = '📊 RETROSPECTIVE\n\n## Recent Activity (auto-loaded)\n';
  for (const t of timeline) {
    const d = t.data as TimelineData;
    output += `  • ${t.ts} [${d.skill || 'unknown'}]: ${d.event || ''} (${d.outcome || ''})\n`;
  }

  output += '\n## Key Learnings (auto-loaded)\n';
  for (const l of learnings) {
    const d = l.data as LearningData;
    output += `  • [${d.type || 'pattern'}] ${d.key || 'unnamed'}: ${d.insight || ''}\n`;
  }

  output +=
    '\n## What went well\n\n## What to improve\n\n## Next steps\n\n~ observe → learn → distill → apply → verify → evolve ~';

  return { ok: true, output };
}

export const executor: SkillExecutor = { execute };
