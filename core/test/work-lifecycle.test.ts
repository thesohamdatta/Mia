import { describe, expect, it } from 'bun:test';
import { recordVerification } from '../work/lifecycle.js';
import { shipWork } from '../work/ship.js';
import {
  WORK_STATES,
  type WorkState,
  type CriterionEvidence,
  createWork,
  transitionWork,
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
    ];

    for (const state of sequence) {
      work = transitionWork(work, state);
      expect(work.state).toBe(state);
    }

    work = recordVerification(work, {
      runId: 'run-1',
      passed: true,
      records: [
        {
          runId: 'run-1',
          name: 'tests',
          status: 'passed',
          command: 'bun test',
          durationMs: 1,
          detail: 'passed',
        },
      ],
    });
    work = shipWork(work);
    expect(work.state).toBe('shipped');

    work = transitionWork(work, 'maintained');
    expect(work.state).toBe('maintained');
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

  it('does not let needs_human bypass verification or review', () => {
    let work = createWork({ objective: 'Build X' });
    work = transitionWork(work, 'needs_human');

    expect(() => transitionWork(work, 'ready_to_ship')).toThrow(
      /Invalid work transition: needs_human -> ready_to_ship/
    );
    expect(() => transitionWork(work, 'shipped')).toThrow(
      /Invalid work transition: needs_human -> shipped/
    );
  });

  it('returns from needs_human only to an earlier actionable stage', () => {
    let work = createWork({ objective: 'Build X' });
    work = transitionWork(work, 'needs_human');

    const resumed = transitionWork(work, 'in_progress');
    expect(resumed.state).toBe('in_progress');
  });

  it('preserves identity and updates the modification time on transition', () => {
    const work = createWork({ objective: 'Build X' });
    const next = transitionWork(work, 'specified');

    expect(next.id).toBe(work.id);
    expect(next.createdAt).toBe(work.createdAt);
    expect(next.updatedAt).not.toBe('');
  });

  it('supports attaching criterion-level outcome evidence to verification', () => {
    let work = createWork({
      objective: 'Verify feature',
      successCriteria: ['Feature launches', 'Handles errors'],
    });
    work = transitionWork(work, 'specified');
    work = transitionWork(work, 'planned');
    work = transitionWork(work, 'in_progress');
    work = transitionWork(work, 'verification');

    const criteria: CriterionEvidence[] = [
      { criterion: 'Feature launches', status: 'passed', evidenceRef: 'test-1' },
      { criterion: 'Handles errors', status: 'passed', note: 'Error tests pass' },
    ];

    work = recordVerification(work, {
      runId: 'run-crit',
      passed: true,
      records: [
        {
          runId: 'run-crit',
          name: 'tests',
          status: 'passed',
          command: 'bun test',
          durationMs: 5,
          detail: 'passed',
        },
      ],
      criteria,
    });

    expect(work.verification?.criteria).toEqual(criteria);
  });
});
