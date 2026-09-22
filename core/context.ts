import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import type { AppConfig, ExecutionContext } from './skills/types.js';
import { createUnifiedStore } from './state/unified-store.js';

function getMiaDir(): string {
  // biome-ignore lint/complexity/useLiteralKeys: TS noPropertyAccessFromIndexSignature
  return process.env['MIA_DIR'] || join(homedir(), '.mia');
}

function getConfig(): AppConfig {
  const miaDir = getMiaDir();
  return {
    miaDir,
    skillsDir: join(miaDir, 'skills'),
    projectsDir: join(miaDir, 'projects'),
    memoryFile: join(miaDir, 'memory.md'),
    sessionsDir: join(miaDir, 'sessions'),
  };
}

function getSlug(cwd?: string): string {
  const targetCwd = cwd || process.cwd();
  let curr = targetCwd;

  while (true) {
    const gitPath = join(curr, '.git');
    if (existsSync(gitPath)) {
      return basename(curr) || 'default';
    }

    const parent = dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  try {
    const toplevel = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      cwd: targetCwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return basename(toplevel) || 'default';
  } catch {
    return 'default';
  }
}

export function createExecutionContext(cwd?: string): ExecutionContext {
  const targetCwd = cwd || process.cwd();
  const config = getConfig();
  return {
    cwd: targetCwd,
    slug: getSlug(targetCwd),
    run: {
      id: randomUUID(),
      skill: 'unassigned',
      startedAt: new Date().toISOString(),
      status: 'running',
    },
    unifiedStore: createUnifiedStore(),
    config,
  };
}

export { getConfig, getMiaDir, getSlug };
