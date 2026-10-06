// Checkpoint Skill Executor - Save/resume working state
// Runs: mia checkpoint

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

function validateCheckpointName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Checkpoint name is required');
  if (trimmed === '.' || trimmed === '..' || /[\\/\0]/.test(trimmed)) {
    throw new Error('Checkpoint name must be a single safe filename');
  }
  return trimmed;
}

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'list';
  const projectsDir = ctx.config.projectsDir;
  const checkpointDir = join(projectsDir, ctx.slug, 'checkpoints');
  mkdirSync(checkpointDir, { recursive: true });

  if (subcmd === 'save') {
    let name: string;
    try {
      name = validateCheckpointName(args[1] || `checkpoint-${Date.now()}`);
    } catch (error) {
      return { ok: false, status: 'blocked', error: error instanceof Error ? error.message : String(error) };
    }
    const summary = args.slice(2).join(' ').trim();
    if (!summary) {
      return { ok: false, status: 'blocked', error: 'Checkpoint summary required.' };
    }
    const checkpointId = randomUUID();
    const file = join(checkpointDir, `${name}.md`);
    const content = `---\nts: ${new Date().toISOString()}\nid: ${checkpointId}\nproject: ${ctx.slug}\nphase: active\nsummary: ${summary}\n---\n\n`;
    writeFileSync(file, content, 'utf8');
    await ctx.unifiedStore.appendCheckpoint(projectsDir, ctx.slug, {
      id: checkpointId,
      name,
      summary,
      runId: ctx.run.id,
    });
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
    for (const file of files) {
      output += `  • ${file.replace('.md', '')}\n`;
    }
    return { ok: true, output };
  }

  if (subcmd === 'load') {
    if (!args[1]) {
      return { ok: false, error: 'Usage: mia checkpoint load <name>' };
    }
    let name: string;
    try {
      name = validateCheckpointName(args[1]);
    } catch (error) {
      return { ok: false, status: 'blocked', error: error instanceof Error ? error.message : String(error) };
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
