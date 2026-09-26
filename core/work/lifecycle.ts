import type { Work } from './types.js';
import { transitionWork } from './types.js';

export interface VerificationOutcome {
  passed: boolean;
}

export interface ReviewOutcome {
  passed: boolean;
}

export function startWork(work: Work): Work {
  return transitionWork(work, 'in_progress');
}

export function enterVerification(work: Work): Work {
  return transitionWork(work, 'verification');
}

export function completeVerification(work: Work, outcome: VerificationOutcome): Work {
  return transitionWork(work, outcome.passed ? 'review' : 'in_progress');
}

export function completeReview(work: Work, outcome: ReviewOutcome): Work {
  return transitionWork(work, outcome.passed ? 'ready_to_ship' : 'in_progress');
}
