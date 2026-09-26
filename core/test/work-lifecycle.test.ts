import { describe, expect, it } from 'bun:test';
import {
  WORK_STATES,
  createWork,
  transitionWork,
  type WorkState,
} from '../work/types.js';

describe('Work lifecycle', () => {
  it('defines the v0.4 lifecycle states', () => {
    expect(WORK_STATES).toEqual([
      'draft',
      'specified',
      'planned',
      'in_progress',
      'verification',
      'review',
      'ready_to_ship',
      'shipped',
      'maintained',
      'blocked',
      'failed',
      'needs_human',
    ]);
  });

  it('creates work in draft state with the core planning fields', () => {
    const work = createWork({
      objective: 'Build a small mobile app',
      successCriteria: ['App launches'],
      capabilities: ['mobile'],
    });

    expect(work.id).toMatch(/^work_/);
    expect(work.objective).toBe('Build a small mobile app');
    expect(work.state).toBe('draft');
    expect(work.successCriteria).toEqual(['App launches']);
    expect(work.capabilities).toEqual(['mobile']);
    expect(work.dependencies).toEqual([]);
    expect(work.createdAt).toEqual(work.updatedAt);
  });

  it('allows only defined forward lifecycle transitions', () => {
    let work = createWork({ objective: 'Build X' });

    const sequence: WorkState[] = [
      'specified',
      'planned',
      'in_progress',
      'verification',
      'review',
      'ready_to_ship',
      'shipped',
      'maintained',
    ];

    for (const state of sequence) {
      work = transitionWork(work, state);
      expect(work.state).toBe(state);
    }
  });

  it('allows recovery states and deterministic return to work', () => {
    let work = createWork({ objective: 'Build X' });

    work = transitionWork(work, 'blocked');
    expect(work.state).toBe('blocked');

    work = transitionWork(work, 'in_progress');
    expect(work.state).toBe('in_progress');

    work = transitionWork(work, 'failed');
    expect(work.state).toBe('failed');

    work = transitionWork(work, 'needs_human');
    expect(work.state).toBe('needs_human');
  });

  it('rejects invalid transitions', () => {
    const work = createWork({ objective: 'Build X' });

    expect(() => transitionWork(work, 'shipped')).toThrow(
      /Invalid work transition: draft -> shipped/
    );
  });

  it('preserves identity and updates the modification time on transition', () => {
    const work = createWork({ objective: 'Build X' });
    const next = transitionWork(work, 'specified');

    expect(next.id).toBe(work.id);
    expect(next.createdAt).toBe(work.createdAt);
    expect(next.updatedAt).not.toBe('');
  });
});
