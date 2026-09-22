import type { UnifiedStore } from '../state/unified-store.js';

export type RunStatus = 'running' | 'success' | 'failed' | 'blocked' | 'partial' | 'unknown';

export interface SkillResult {
  ok: boolean;
  status?: Exclude<RunStatus, 'running'>;
  output?: string;
  error?: string;
}

export interface SkillRun {
  id: string;
  skill: string;
  startedAt: string;
  status: RunStatus;
  finishedAt?: string;
  error?: string;
}

export interface ExecutionContext {
  cwd: string;
  slug: string;
  run: SkillRun;
  unifiedStore: UnifiedStore;
  config: AppConfig;
}

export interface StoredEvent<T = unknown> {
  type: 'learning' | 'timeline' | 'checkpoint' | 'evidence';
  ts: string;
  slug: string;
  data: T;
}

export interface EvidenceRecord {
  runId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'unavailable';
  command?: string;
  durationMs?: number;
  detail?: string;
}

export interface AppConfig {
  miaDir: string;
  skillsDir: string;
  projectsDir: string;
  memoryFile: string;
  sessionsDir: string;
}

export interface SkillExecutor {
  execute(args: string[], context: ExecutionContext): Promise<SkillResult>;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  allowedTools: readonly string[];
  sideEffects: 'none' | 'local-write' | 'git-write' | 'external';
  verification: readonly string[];
}

export interface SkillDefinition {
  manifest: SkillManifest;
  executor: SkillExecutor;
}
