import type { Approval } from '../approval/types.js';
import type { EvidenceRecord } from '../skills/types.js';
import type { Work } from './types.js';
import { transitionWork } from './types.js';

interface VerificationRecordOutcome {
  runId: string;
  records: readonly EvidenceRecord[];
  passed: boolean;
}

interface VerificationOutcome {
  passed: boolean;
}

interface ReviewOutcome {
  passed: boolean;
}

export function startWork(work: Work): Work {
  return transitionWork(work, 'in_progress');
}

export function enterVerification(work: Work): Work {
  return transitionWork(work, 'verification');
}

export function recordVerification(work: Work, outcome: VerificationRecordOutcome): Work {
  for (const record of outcome.records) {
    if (record.runId !== outcome.runId) {
      throw new Error(`Verification evidence belongs to another run: ${record.runId}`);
    }
  }

  return {
    ...work,
    verification: {
      runId: outcome.runId,
      passed: outcome.passed,
      evidence: outcome.records.map((record) => ({
        runId: record.runId,
        name: record.name,
        status: record.status,
      })),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function recordApproval(work: Work, approval: Approval): Work {
  if (approval.workId !== work.id) {
    throw new Error(`Approval belongs to another Work item: ${approval.workId}`);
  }

  return {
    ...work,
    approval: {
      id: approval.id,
      runId: approval.runId,
      action: approval.action,
      status: approval.status,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function completeVerification(work: Work, outcome: VerificationOutcome): Work {
  return transitionWork(work, outcome.passed ? 'review' : 'in_progress');
}

export function completeReview(work: Work, outcome: ReviewOutcome): Work {
  return transitionWork(work, outcome.passed ? 'ready_to_ship' : 'in_progress');
}
