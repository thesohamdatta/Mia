import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { appendJsonl, readJsonl } from '../state/jsonl-store.js';

export type EventType = 'learning' | 'timeline' | 'checkpoint';

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

export class UnifiedStore {
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
    const dir = projectDir(projectsDir, slug);
    const path = eventsPath(projectsDir, slug);
    const events: StoredEvent[] = [];

    if (existsSync(path)) {
      events.push(...readJsonl<StoredEvent>(path));
    }

    // Fallback/Legacy support: learnings.jsonl and timeline.jsonl with deduplication against events.jsonl
    const existingSignatures = new Set(
      events.map((e) => `${e.type}:${e.ts}:${JSON.stringify(e.data)}`)
    );

    if (!type || type === 'learning') {
      const legacyLearningsPath = join(dir, 'learnings.jsonl');
      if (existsSync(legacyLearningsPath)) {
        const legacy = readJsonl<Record<string, unknown>>(legacyLearningsPath);
        for (const item of legacy) {
          if (!item || typeof item !== 'object') continue;
          const itemTs = typeof item['ts'] === 'string' ? item['ts'] : new Date(0).toISOString();
          const sig = `learning:${itemTs}:${JSON.stringify(item)}`;
          if (!existingSignatures.has(sig)) {
            existingSignatures.add(sig);
            events.push({
              type: 'learning',
              ts: itemTs,
              slug,
              data: item,
            });
          }
        }
      }
    }

    if (!type || type === 'timeline') {
      const legacyTimelinePath = join(dir, 'timeline.jsonl');
      if (existsSync(legacyTimelinePath)) {
        const legacy = readJsonl<Record<string, unknown>>(legacyTimelinePath);
        for (const item of legacy) {
          if (!item || typeof item !== 'object') continue;
          const itemTs = typeof item['ts'] === 'string' ? item['ts'] : new Date(0).toISOString();
          const sig = `timeline:${itemTs}:${JSON.stringify(item)}`;
          if (!existingSignatures.has(sig)) {
            existingSignatures.add(sig);
            events.push({
              type: 'timeline',
              ts: itemTs,
              slug,
              data: item,
            });
          }
        }
      }
    }

    let filtered = type ? events.filter((e) => e.type === type) : events;
    if (filter) filtered = filtered.filter(filter);
    return filtered.slice(-limit).reverse();
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
}

export function createUnifiedStore(): UnifiedStore {
  return new UnifiedStore();
}
