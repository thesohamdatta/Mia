import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Work } from './types.js';

export interface WorkStore {
  save(work: Work): Promise<void>;
  get(workId: string): Promise<Work | undefined>;
}

function workPath(root: string, slug: string): string {
  return join(root, slug, 'work.json');
}

function ensureParent(path: string): void {
  const slash = path.lastIndexOf('/');
  if (slash >= 0) mkdirSync(path.slice(0, slash), { recursive: true });
}

export function createWorkStore(root: string, slug: string): WorkStore {
  const path = workPath(root, slug);

  return {
    async save(work) {
      ensureParent(path);
      await Bun.write(path, JSON.stringify(work, null, 2) + '
');
    },

    async get(workId) {
      if (!existsSync(path)) return undefined;
      const data = JSON.parse(await Bun.file(path).text()) as Work;
      return data.id === workId ? data : undefined;
    },
  };
}
