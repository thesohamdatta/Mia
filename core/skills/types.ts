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

export interface UnifiedStore {
  append(
    projectsDir: string,
    type: 'learning' | 'timeline' | 'checkpoint',
    slug: string,
    data: unknown
  ): Promise<void>;
  query(
    projectsDir: string,
    slug: string,
    type?: 'learning' | 'timeline' | 'checkpoint',
    filter?: (event: StoredEvent) => boolean,
    limit?: number
  ): Promise<StoredEvent[]>;
  listLearnings(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  listTimeline(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  appendLearning(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendTimeline(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendCheckpoint(projectsDir: string, slug: string, data: unknown): Promise<void>;
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
  manifest?: any;
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
