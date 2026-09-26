import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { appendJsonl, readJsonlTail } from '../state/jsonl-store.js';

export type EventType = 'learning' | 'timeline' | 'checkpoint' | 'evidence' | 'approval';

export interface UnifiedStore {
  append(projectsDir: string, type: EventType, slug: string, data: unknown): Promise<void>;
  query(
    projectsDir: string,
    slug: string,
    type?: EventType,
    filter?: (event: StoredEvent) => boolean,
    limit?: number
  ): Promise<StoredEvent[]>;
  listLearnings(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  listTimeline(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  listEvidence(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  listApprovals(projectsDir: string, slug: string, limit?: number): Promise<StoredEvent[]>;
  appendLearning(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendTimeline(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendCheckpoint(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendEvidence(projectsDir: string, slug: string, data: unknown): Promise<void>;
  appendApproval(projectsDir: string, slug: string, data: unknown): Promise<void>;
}

export interface StoredEvent<T = unknown> {
  type: EventType;
  ts: string;
  slug: string;
  data: T;
}

function projectDir(projectsDir: string, slug: string): string {
  return join(projectsDir, slug);
}

function eventsPath(projectsDir: string, slug: string): string {
  return join(projectDir(projectsDir, slug), 'events.jsonl');
}

function ensureProjectDir(projectsDir: string, slug: string): string {
  const dir = projectDir(projectsDir, slug);
  mkdirSync(dir, { recursive: true });
  return dir;
}

class JsonlUnifiedStore implements UnifiedStore {
  async append(projectsDir: string, type: EventType, slug: string, data: unknown): Promise<void> {
    ensureProjectDir(projectsDir, slug);
    const event: StoredEvent = { type, ts: new Date().toISOString(), slug, data };
    appendJsonl(eventsPath(projectsDir, slug), event);
  }

  async query(
    projectsDir: string,
    slug: string,
    type?: EventType,
    filter?: (event: StoredEvent) => boolean,
    limit = 50
  ): Promise<StoredEvent[]> {
    const path = eventsPath(projectsDir, slug);
    if (!existsSync(path)) return [];
    const combinedFilter = (e: StoredEvent) => {
      if (type && e.type !== type) return false;
      if (filter && !filter(e)) return false;
      return true;
    };
    // Optimization: read tail lazily backwards from end of file with filter predicate
    return readJsonlTail<StoredEvent>(path, limit, combinedFilter);
  }

  async listLearnings(projectsDir: string, slug: string, limit = 50) {
    return this.query(projectsDir, slug, 'learning', undefined, limit);
  }

  async listTimeline(projectsDir: string, slug: string, limit = 30) {
    return this.query(projectsDir, slug, 'timeline', undefined, limit);
  }

  async appendLearning(projectsDir: string, slug: string, data: unknown) {
    return this.append(projectsDir, 'learning', slug, data);
  }

  async appendTimeline(projectsDir: string, slug: string, data: unknown) {
    return this.append(projectsDir, 'timeline', slug, data);
  }

  async appendCheckpoint(projectsDir: string, slug: string, data: unknown) {
    return this.append(projectsDir, 'checkpoint', slug, data);
  }

  async listEvidence(projectsDir: string, slug: string, limit = 50) {
    return this.query(projectsDir, slug, 'evidence', undefined, limit);
  }

  async appendEvidence(projectsDir: string, slug: string, data: unknown) {
    return this.append(projectsDir, 'evidence', slug, data);
  }

  async listApprovals(projectsDir: string, slug: string, limit = 50) {
    return this.query(projectsDir, slug, 'approval', undefined, limit);
  }

  async appendApproval(projectsDir: string, slug: string, data: unknown) {
    return this.append(projectsDir, 'approval', slug, data);
  }
}

export function createUnifiedStore(): UnifiedStore {
  return new JsonlUnifiedStore();
}
