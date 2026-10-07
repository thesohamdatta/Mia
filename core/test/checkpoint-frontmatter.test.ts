import { describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { execute } from '../skills/checkpoint/execute.js';
import type { ExecutionContext } from '../skills/types.js';
import { createUnifiedStore } from '../state/unified-store.js';

interface CheckpointFrontmatter {
  summary?: string;
}

function readSummary(file: string): string | undefined {
  const parsed = matter(readFileSync(file, 'utf8')) as unknown as { data: CheckpointFrontmatter };
  return parsed.data.summary;
}

function context(projectsDir: string): ExecutionContext {
  return {
    cwd: process.cwd(),
    slug: 'mia-checkpoint-frontmatter',
    run: {
      id: 'run-checkpoint',
      skill: 'checkpoint',
      startedAt: new Date().toISOString(),
      status: 'running',
    },
    unifiedStore: createUnifiedStore(),
    grantedTools: [],
    config: {
      miaDir: projectsDir,
      skillsDir: join(projectsDir, 'skills'),
      projectsDir,
      memoryFile: join(projectsDir, 'memory.md'),
      sessionsDir: join(projectsDir, 'sessions'),
    },
  };
}

describe('checkpoint frontmatter', () => {
  it('round-trips a summary containing YAML-significant characters', async () => {
    const projectsDir = mkdtempSync(join(tmpdir(), 'mia-checkpoint-'));
    const ctx = context(projectsDir);
    const summary = 'Note: "quoted" value with a colon: and a #hash';

    const result = await execute(['save', 'note', summary], ctx);
    expect(result.ok).toBe(true);

    const file = join(projectsDir, ctx.slug, 'checkpoints', 'note.md');

    expect(readSummary(file)).toBe(summary);
  });

  it('keeps a multi-line summary inside the frontmatter value', async () => {
    const projectsDir = mkdtempSync(join(tmpdir(), 'mia-checkpoint-'));
    const ctx = context(projectsDir);
    const summary = 'first line\nsecond line';

    const result = await execute(['save', 'multiline', summary], ctx);
    expect(result.ok).toBe(true);

    const file = join(projectsDir, ctx.slug, 'checkpoints', 'multiline.md');

    expect(readSummary(file)).toBe(summary);
  });
});
