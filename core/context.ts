import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createUnifiedStore } from './state/unified-store.js';
import type { UnifiedStore } from './state/unified-store.js';

export interface ExecutionContext {
  cwd: string;
  slug: string;
  unifiedStore: UnifiedStore;
  config: AppConfig;
}

export interface AppConfig {
  miaDir: string;
  skillsDir: string;
  projectsDir: string;
  memoryFile: string;
  sessionsDir: string;
}

function getMiaDir(): string {
  return process.env['MIA_DIR'] || join(homedir(), '.mia');
}

function getConfig(): AppConfig {
  const miaDir = getMiaDir();
  return {
    miaDir,
    skillsDir: process.env['MIA_SKILLS_DIR'] || join(miaDir, 'skills'),
    projectsDir: process.env['MIA_PROJECTS_DIR'] || join(miaDir, 'projects'),
    memoryFile: process.env['MIA_MEMORY_FILE'] || join(miaDir, 'memory.md'),
    sessionsDir: process.env['MIA_SESSIONS_DIR'] || join(miaDir, 'sessions'),
  };
}

function getSlug(cwd?: string): string {
  const targetCwd = cwd || process.cwd();
  try {
    const toplevel = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      cwd: targetCwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return toplevel.split(/[\\/]/).pop() || 'default';
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
    unifiedStore: createUnifiedStore(),
    config,
  };
}

export { getConfig, getMiaDir, getSlug };
