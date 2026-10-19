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

function passingVerification() {
  return {
    runId: 'run-1',
    passed: true,
    records: [
      {
        runId: 'run-1',
        name: 'tests',
        status: 'passed' as const,
        command: 'bun test',
        durationMs: 10,
        detail: 'passed',
      },
    ],
  };
}

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

  it('moves verification to review only when persisted verification evidence passes', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'verification' };
    work = recordVerification(work, passingVerification());

    expect(completeVerification(work, { passed: true }).state).toBe('review');
  });

  it('does not advance verification without recorded evidence', () => {
    const work = { ...createWork({ objective: 'Build X' }), state: 'verification' as const };

    expect(() => completeVerification(work, { passed: true })).toThrow(
      /verification evidence is missing/
    );
  });

  it('does not advance verification when recorded evidence failed', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'verification' };
    work = recordVerification(work, {
      runId: 'run-1',
      passed: true,
      records: [{ runId: 'run-1', name: 'tests', status: 'failed' }],
    });

    expect(() => completeVerification(work, { passed: true })).toThrow(
      /evidence has not passed: tests/
    );
  });

  it('returns to active work when review fails', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'review' };

    expect(completeReview(work, { passed: false }).state).toBe('in_progress');
  });

  it('moves review to ready_to_ship only when review passes with verified evidence', () => {
    let work = createWork({ objective: 'Build X' });
    work = { ...work, state: 'verification' };
    work = recordVerification(work, passingVerification());
    work = completeVerification(work, { passed: true });

    expect(completeReview(work, { passed: true }).state).toBe('ready_to_ship');
  });

  it('does not mark review ready to ship without recorded verification evidence', () => {
    const work = { ...createWork({ objective: 'Build X' }), state: 'review' as const };

    expect(() => completeReview(work, { passed: true })).toThrow(
      /passing verification evidence is required/
    );
  });

  it('does not complete review from an unrelated state', () => {
    const work = createWork({ objective: 'Build X' });

    expect(() => completeReview(work, { passed: true })).toThrow(
      /Cannot complete review from state: draft/
    );
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
