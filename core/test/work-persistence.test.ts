import { describe, expect, it } from 'bun:test';
import { createUnifiedStore } from '../state/unified-store.js';
import { createWork, transitionWork } from '../work/types.js';
import { loadWork, saveWork } from '../work/persistence.js';

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

    const projectsDir = '/tmp/mia-work-test';
    await saveWork(store, projectsDir, 'mia', work);
    const restored = await loadWork(store, projectsDir, 'mia', work.id);

    expect(restored).toEqual(work);
  });

  it('returns undefined for an unknown Work id', async () => {
    const store = createUnifiedStore();
    const restored = await loadWork(store, '/tmp/mia-work-test', 'mia', 'work_unknown');
    expect(restored).toBeUndefined();
  });

  it('persists each update as an event without mutating the Work object', async () => {
    const store = createUnifiedStore();
    const original = createWork({ objective: 'Build X' });
    const updated = transitionWork(original, 'specified');

    await saveWork(store, '/tmp/mia-work-test', 'mia', original);
    await saveWork(store, '/tmp/mia-work-test', 'mia', updated);

    expect(original.state).toBe('draft');
    expect(updated.state).toBe('specified');

    const events = await store.query(
      '/tmp/mia-work-test',
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
  });
});
