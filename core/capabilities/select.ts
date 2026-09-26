import type { RootPlan } from '../root/types.js';

export function selectCapabilities(plan: RootPlan): string[] {
  const available = new Set(plan.availableCapabilities);

  for (const capability of plan.capabilities) {
    if (!available.has(capability)) {
      throw new Error(`Unavailable capability: ${capability}`);
    }
  }

  return [...plan.capabilities];
}
