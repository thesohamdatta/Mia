import type { Work } from './types.js';

export function shipWork(work: Work, requiredVerificationNames: readonly string[] = []): Work {
  if (work.state !== 'ready_to_ship') {
    throw new Error(`Work is not ready to ship: ${work.state}`);
  }

  if (!work.verification || work.verification.evidence.length === 0) {
    throw new Error('Work verification evidence is missing');
  }

  const evidenceByName = new Map(
    work.verification.evidence.map((evidence) => [evidence.name, evidence])
  );
  const missingVerification = requiredVerificationNames.filter(
    (name) => evidenceByName.get(name)?.status !== 'passed'
  );
  if (missingVerification.length > 0) {
    throw new Error(
      `Work verification is incomplete: ${missingVerification.join(', ')}`
    );
  }

  if (
    !work.verification.passed ||
    work.verification.evidence.some((evidence) => evidence.status !== 'passed')
  ) {
    throw new Error('Work verification has not passed');
  }

  if (work.requiresHumanApproval) {
    if (!work.approval) {
      throw new Error('Work human approval is required');
    }

    if (work.approval.action !== 'ship') {
      throw new Error(`Work approval is not for ship: ${work.approval.action}`);
    }

    if (work.approval.status !== 'approved') {
      throw new Error(`Work approval is not approved: ${work.approval.status}`);
    }
  }

  return {
    ...work,
    state: 'shipped',
    updatedAt: new Date().toISOString(),
  };
}
