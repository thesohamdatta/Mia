import type { RootPlan } from '../root/types.js';
import { createWork, type Work } from './types.js';

export function createWorkFromRootPlan(plan: RootPlan): Work {
  if (plan.ambiguities.length > 0) {
    throw new Error('Cannot create Work with unresolved ambiguities');
  }

  return {
    ...createWork({
      objective: plan.objective,
      successCriteria: plan.expectedEvidence,
      capabilities: plan.capabilities,
      dependencies: plan.dependencies,
    }),
    state: 'planned',
  };
}
