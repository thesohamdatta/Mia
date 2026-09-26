import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import { createUnifiedStore } from '../state/unified-store.js';
import { loadWork, saveWork } from '../work/persistence.js';
import { createWork, transitionWork } from '../work/types.js';

describe('Work persistence', () => {
  it('round-trips a Work item through the UnifiedStore', async () => {
    const store = createUnifiedStore();
    const work = transitionWork(
      createWork({
        objective: 'Build X',
        successCriteria: ['Tests pass'],
        capabilities: ['software'],
        dependencies: ['API'],
      }),
      'specified'
    );

    const projectsDir = mkdtempSync(join(tmpdir(), 'mia-work-test-'));
    try {
      await saveWork(store, projectsDir, 'mia', work);
      const restored = await loadWork(store, projectsDir, 'mia', work.id);

      expect(restored).toEqual(work);
    } finally {
      rmSync(projectsDir, { recursive: true, force: true });
    }
  });

  it('returns undefined for an unknown Work id', async () => {
    const store = createUnifiedStore();
    const projectsDir = mkdtempSync(join(tmpdir(), 'mia-work-test-'));
    try {
      const restored = await loadWork(store, projectsDir, 'mia', 'work_unknown');
      expect(restored).toBeUndefined();
    } finally {
      rmSync(projectsDir, { recursive: true, force: true });
    }
  });

  it('persists each update as an event without mutating the Work object', async () => {
    const store = createUnifiedStore();
    const original = createWork({ objective: 'Build X' });
    const updated = transitionWork(original, 'specified');

    const projectsDir = mkdtempSync(join(tmpdir(), 'mia-work-test-'));
    try {
      await saveWork(store, projectsDir, 'mia', original);
      await saveWork(store, projectsDir, 'mia', updated);

    expect(original.state).toBe('draft');
    expect(updated.state).toBe('specified');

      const events = await store.query(
        projectsDir,
        'mia',
        'timeline',
      (event) => {
        const data = event.data as { kind?: string; workId?: string };
        return data.kind === 'work';
      },
        10
      );

      expect(events).toHaveLength(2);
      expect((events[0]?.data as { workId: string }).workId).toBe(updated.id);
    } finally {
      rmSync(projectsDir, { recursive: true, force: true });
    }
  });
});
