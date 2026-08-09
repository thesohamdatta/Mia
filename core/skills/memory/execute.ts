// Memory Skill Executor - Read/write long-term memory
// Runs: mia memory

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'read';
  const memoryFile = ctx.config.memoryFile;

  if (subcmd === 'read') {
    if (!existsSync(memoryFile)) {
      return {
        ok: true,
        output: '# MIA Long-Term Memory\n\n_Curated wisdom, distilled from daily notes._',
      };
    }
    const content = readFileSync(memoryFile, 'utf-8');
    return { ok: true, output: content };
  }

  if (subcmd === 'append') {
    const section = args.slice(1).join(' ');
    if (!section) {
      return { ok: false, error: 'Usage: mia memory append <section content>' };
    }
    mkdirSync(dirname(memoryFile), { recursive: true });
    const timestamp = new Date().toISOString();
    appendFileSync(memoryFile, `\n## ${timestamp}\n\n${section}\n`, 'utf-8');
    return { ok: true, output: '✓ Appended to memory.md' };
  }

  return { ok: true, output: 'Usage: mia memory [read|append <content>]' };
}

export const executor: SkillExecutor = { execute };
