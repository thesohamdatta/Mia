import type { Checkpoint, Learning, TimelineEvent } from './types.js';

export interface LearningStore {
  append(slug: string, learning: Learning): Promise<void>;
  list(slug: string, limit: number): Promise<Learning[]>;
  search(slug: string, query: string): Promise<Learning[]>;
}

export interface TimelineStore {
  append(slug: string, event: TimelineEvent): Promise<void>;
  list(slug: string, limit: number): Promise<TimelineEvent[]>;
}

export interface CheckpointStore {
  save(slug: string, checkpoint: Checkpoint): Promise<void>;
  list(slug: string): Promise<Checkpoint[]>;
  load(slug: string, name: string): Promise<Checkpoint | null>;
}

export interface MemoryStore {
  read(): Promise<string>;
  append(section: string): Promise<void>;
}

export interface SessionStore {
  touch(sessionId: string): Promise<void>;
  listActive(maxAgeMs: number): Promise<string[]>;
  cleanup(maxAgeMs: number): Promise<void>;
}

export interface StateService {
  learnings: LearningStore;
  timeline: TimelineStore;
  checkpoints: CheckpointStore;
  memory: MemoryStore;
  sessions: SessionStore;
  getSlug(cwd?: string): string;
  ensureProject(slug: string): Promise<string>;
}
