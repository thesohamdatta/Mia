/**
 * Model routing: choose the cheapest tier predicted to clear the quality bar for
 * a task, then escalate when the task fails. Routing is deliberately rule-based
 * and inspectable, so a team can see and change why a task used a given tier.
 */

export const FACTORY_MODEL_TIERS = [
  {
    tier: 'fast',
    purpose: 'Deterministic, low-risk work such as triage, formatting, and simple fixes.',
  },
  {
    tier: 'balanced',
    purpose: 'Most implementation and review work that needs moderate judgment.',
  },
  {
    tier: 'frontier',
    purpose: 'High-complexity, high-risk, or reasoning-heavy work such as architecture.',
  },
] as const;

export type ModelTier = (typeof FACTORY_MODEL_TIERS)[number]['tier'];
export type TaskComplexity = 'low' | 'medium' | 'high';
export type TaskRisk = 'low' | 'medium' | 'high';

export interface TaskProfile {
  phase: string;
  complexity: TaskComplexity;
  risk: TaskRisk;
  requiresReasoning: boolean;
}

export interface RoutingDecision {
  tier: ModelTier;
  rationale: string;
  fallbackTier: ModelTier;
  escalateOnFailure: boolean;
}

const TIER_ORDER: readonly ModelTier[] = ['fast', 'balanced', 'frontier'];

function cheaperThan(tier: ModelTier): ModelTier {
  const index = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.max(0, index - 1)] ?? 'fast';
}

export function routeModel(profile: TaskProfile): RoutingDecision {
  if (profile.risk === 'high') {
    return {
      tier: 'frontier',
      rationale: 'High-risk work needs the most capable model for review and safety.',
      fallbackTier: cheaperThan('frontier'),
      escalateOnFailure: false,
    };
  }

  if (profile.complexity === 'high' || profile.requiresReasoning) {
    return {
      tier: 'frontier',
      rationale: profile.requiresReasoning
        ? 'The task requires reasoning, so route to the frontier tier.'
        : 'High-complexity work exceeds the balanced tier quality bar.',
      fallbackTier: cheaperThan('frontier'),
      escalateOnFailure: false,
    };
  }

  if (profile.complexity === 'low') {
    return {
      tier: 'fast',
      rationale: 'Low-complexity work clears the quality bar on the cheapest tier.',
      fallbackTier: 'balanced',
      escalateOnFailure: true,
    };
  }

  return {
    tier: 'balanced',
    rationale: 'Medium-complexity work needs moderate judgment; the balanced tier suffices.',
    fallbackTier: 'frontier',
    escalateOnFailure: true,
  };
}
