import { describe, expect, it } from 'bun:test';
import { createApproval, resolveApproval } from '../approval/types.js';
import {
  completeReview,
  completeVerification,
  enterVerification,
  recordApproval,
  recordVerification,
  startWork,
} from '../work/lifecycle.js';
import { createWork } from '../work/types.js';

describe('Work lifecycle operations', () => {
  it('starts planned Work', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'planned' };

    const started = startWork(work);

    expect(started.state).toBe('in_progress');
    expect(started.id).toBe(work.id);
  });

  it('enters verification only from active work', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'in_progress' };

    expect(enterVerification(work).state).toBe('verification');
    expect(() => enterVerification(createWork({ objective: 'Build X' }))).toThrow(
      /Invalid work transition/
    );
  });

  it('returns to active work when verification fails', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'verification' };

    expect(completeVerification(work, { passed: false }).state).toBe('in_progress');
  });

  it('moves verification to review only when verification passes', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'verification' };

    expect(completeVerification(work, { passed: true }).state).toBe('review');
  });

  it('returns to active work when review fails', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'review' };

    expect(completeReview(work, { passed: false }).state).toBe('in_progress');
  });

  it('moves review to ready_to_ship only when review passes', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'review' };

    expect(completeReview(work, { passed: true }).state).toBe('ready_to_ship');
  });

  it('blocks ready_to_ship when declared success criteria are not verified as passed', () => {
    let work = createWork({
      objective: 'Build X',
      successCriteria: ['Feature works', 'Tests pass'],
    });
    work = { ...work, state: 'review' };

    expect(() => completeReview(work, { passed: true })).toThrow(
      /declared success criteria are not verified as passed/
    );

    work = {
      ...work,
      verification: {
        runId: 'run-1',
        passed: true,
        evidence: [],
        criteria: [{ criterion: 'Feature works', status: 'passed' }],
      },
    };
    expect(() => completeReview(work, { passed: true })).toThrow(
      /declared success criteria are not verified as passed/
    );
  });

  it('advances review to ready_to_ship when all success criteria have passed', () => {
    let work = createWork({
      objective: 'Build X',
      successCriteria: ['Feature works', 'Tests pass'],
    });
    work = {
      ...work,
      state: 'review',
      verification: {
        runId: 'run-1',
        passed: true,
        evidence: [],
        criteria: [
          { criterion: 'Feature works', status: 'passed' },
          { criterion: 'Tests pass', status: 'passed' },
        ],
      },
    };

    expect(completeReview(work, { passed: true }).state).toBe('ready_to_ship');
  });

  it('records a lightweight verification projection on Work', () => {
    const work = createWork({ objective: 'Build X' });

    const recorded = recordVerification(work, {
      runId: 'run-1',
      passed: true,
      records: [
        {
          runId: 'run-1',
          name: 'tests',
          status: 'passed',
          command: 'bun test',
          durationMs: 10,
          detail: 'full output stays in UnifiedStore',
        },
      ],
    });

    expect(recorded.verification).toEqual({
      runId: 'run-1',
      passed: true,
      evidence: [{ runId: 'run-1', name: 'tests', status: 'passed' }],
    });
    expect(recorded).not.toBe(work);
  });

  it('records a lightweight approval projection on Work', () => {
    const work = createWork({ objective: 'Release X' });
    const approval = resolveApproval(
      createApproval({ workId: work.id, runId: 'run-2', action: 'ship' }),
      'approved'
    );

    const recorded = recordApproval(work, approval);

    expect(recorded.approval).toEqual({
      id: approval.id,
      runId: 'run-2',
      action: 'ship',
      status: 'approved',
    });
    expect(recorded).not.toBe(work);
  });
});
