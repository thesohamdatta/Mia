import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createWork, transitionWork } from '../work/types.js';
import { createWorkStore } from '../work/store.js';

describe('Work persistence', () => {
  it('persists and recovers Work through the project store', async () => {
    const root = mkdtempSync(join(process.cwd(), 'work-store-test-'));
    try {
      const store = createWorkStore(root, 'demo');
      const work = createWork({
        objective: 'Ship the next MIA slice',
        successCriteria: ['Tests pass'],
        capabilities: ['software'],
        dependencies: ['GitHub'],
      });

      await store.save(work);
      const recovered = await store.get(work.id);

      expect(recovered).toEqual(work);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('updates an existing Work item by id', async () => {
    const root = mkdtempSync(join(process.cwd(), 'work-store-test-'));
    try {
      const store = createWorkStore(root, 'demo');
      const work = createWork({ objective: 'Ship MIA' });
      await store.save(work);

      const planned = transitionWork(work, 'specified');
      await store.save(planned);

      expect(await store.get(work.id)).toEqual(planned);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns no Work for an unknown id', async () => {
    const root = mkdtempSync(join(process.cwd(), 'work-store-test-'));
    try {
      const store = createWorkStore(root, 'demo');
      expect(await store.get('missing')).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
