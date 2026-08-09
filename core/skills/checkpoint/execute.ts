// Checkpoint Skill Executor - Save/resume working state
// Runs: mia checkpoint

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'list';
  const projectsDir = ctx.config.projectsDir;
  const checkpointDir = join(projectsDir, ctx.slug, 'checkpoints');
  mkdirSync(checkpointDir, { recursive: true });

  if (subcmd === 'save') {
    const name = args[1] || `checkpoint-${Date.now()}`;
    const summary = args.slice(2).join(' ');
    const file = join(checkpointDir, `${name}.md`);
    const content = `---\nts: ${new Date().toISOString()}\nbranch: ${ctx.slug}\nphase: active\nsummary: ${summary}\n---\n\n`;
    writeFileSync(file, content, 'utf-8');
    await ctx.unifiedStore.appendCheckpoint(projectsDir, ctx.slug, { name, summary });
    return { ok: true, output: `✓ Checkpoint saved: ${name}` };
  }

  if (subcmd === 'list') {
    if (!existsSync(checkpointDir)) {
      return { ok: true, output: 'No checkpoints yet.' };
    }
    const files = readdirSync(checkpointDir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse();
    if (files.length === 0) {
      return { ok: true, output: 'No checkpoints yet.' };
    }
    let output = '📌 Checkpoints:\n\n';
    for (const f of files) {
      output += `  • ${f.replace('.md', '')}\n`;
    }
    return { ok: true, output };
  }

  if (subcmd === 'load') {
    const name = args[1];
    if (!name) {
      return { ok: false, error: 'Usage: mia checkpoint load <name>' };
    }
    const file = join(checkpointDir, `${name}.md`);
    if (!existsSync(file)) {
      return { ok: false, error: `Checkpoint not found: ${name}` };
    }
    const content = readFileSync(file, 'utf-8');
    return { ok: true, output: content };
  }

  return { ok: true, output: 'Usage: mia checkpoint [save <name> <summary>|list|load <name>]' };
}

export const executor: SkillExecutor = { execute };
