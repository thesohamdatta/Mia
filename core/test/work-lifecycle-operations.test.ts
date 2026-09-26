import { describe, expect, it } from 'bun:test';
import {
  completeReview,
  completeVerification,
  enterVerification,
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
});
