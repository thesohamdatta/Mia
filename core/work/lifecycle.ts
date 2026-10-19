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
  if (!outcome.passed) {
    return transitionWork(work, 'in_progress');
  }

  const verification = work.verification;
  if (!verification) {
    throw new Error('Cannot complete verification: verification evidence is missing');
  }

  if (!verification.passed || verification.evidence.length === 0) {
    throw new Error('Cannot complete verification: verification evidence has not passed');
  }

  const failedEvidence = verification.evidence.filter((evidence) => evidence.status !== 'passed');
  if (failedEvidence.length > 0) {
    throw new Error(
      `Cannot complete verification: evidence has not passed: ${failedEvidence.map((evidence) => evidence.name).join(', ')}`
    );
  }

  return transitionWork(work, 'review');
}

export function completeReview(work: Work, outcome: ReviewOutcome): Work {
  if (!outcome.passed) {
    return transitionWork(work, 'in_progress');
  }

  if (work.state !== 'review') {
    throw new Error(`Cannot complete review from state: ${work.state}`);
  }

  if (!work.verification?.passed || work.verification.evidence.length === 0) {
    throw new Error('Cannot complete review: passing verification evidence is required');
  }

  const failedEvidence = work.verification.evidence.filter(
    (evidence) => evidence.status !== 'passed'
  );
  if (failedEvidence.length > 0) {
    throw new Error(
      `Cannot complete review: verification evidence has not passed: ${failedEvidence.map((evidence) => evidence.name).join(', ')}`
    );
  }

  return transitionWork(work, 'ready_to_ship');
}
