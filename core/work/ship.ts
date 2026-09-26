import type { Approval } from '../approval/types.js';
import { type Work } from './types.js';

export interface ShipWorkOptions {
  verificationPassed: boolean;
  approval?: Approval;
}

export function shipWork(work: Work, options: ShipWorkOptions): Work {
  if (work.state !== 'ready_to_ship') {
    throw new Error(`Work is not ready to ship: ${work.state}`);
  }

  if (!options.verificationPassed) {
    throw new Error('Work verification has not passed');
  }

  if (work.requiresHumanApproval) {
    if (!options.approval) {
      throw new Error('Work human approval is required');
    }

    if (options.approval.status !== 'approved') {
      throw new Error(`Work approval is not approved: ${options.approval.status}`);
    }
  }

  return {
    ...work,
    state: 'shipped',
    updatedAt: new Date().toISOString(),
  };
}
