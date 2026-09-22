import type { UnifiedStore } from '../state/unified-store.js';
export interface SkillResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export interface ExecutionContext {
  cwd: string;
  slug: string;
  unifiedStore: UnifiedStore;
  config: AppConfig;
}

export interface StoredEvent<T = unknown> {
  type: 'learning' | 'timeline' | 'checkpoint';
  ts: string;
  slug: string;
  data: T;
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

export interface Skill {
  manifest?: SkillManifest;
  executor: SkillExecutor;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  workflow?: string;
  whenToInvoke?: string;
  preambleTier?: string;
  allowedTools?: string[];
  triggers?: string[];
  dependencies?: string[];
}

export interface SkillRegistry {
  get(name: string): Skill | undefined;
  list(): Skill[];
  findByTrigger(trigger: string): Skill | undefined;
  reload(): Promise<void>;
}
