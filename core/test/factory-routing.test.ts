import { describe, expect, it } from 'bun:test';
import { FACTORY_MODEL_TIERS, type TaskProfile, routeModel } from '../factory/routing.js';

function profile(overrides: Partial<TaskProfile> = {}): TaskProfile {
  return {
    phase: 'execute',
    complexity: 'medium',
    risk: 'medium',
    requiresReasoning: false,
    ...overrides,
  };
}

describe('factory model routing', () => {
  it('defines a tier ladder from cheapest to most capable', () => {
    const tiers = FACTORY_MODEL_TIERS.map((tier) => tier.tier);
    expect(tiers).toEqual(['fast', 'balanced', 'frontier']);
  });

  it('routes low-complexity deterministic work to the cheapest tier', () => {
    const decision = routeModel(profile({ complexity: 'low' }));
    expect(decision.tier).toBe('fast');
    expect(decision.escalateOnFailure).toBe(true);
  });

  it('routes high-complexity reasoning work to the frontier tier', () => {
    const decision = routeModel(profile({ complexity: 'high', requiresReasoning: true }));
    expect(decision.tier).toBe('frontier');
  });

  it('routes high-risk work to the frontier tier regardless of complexity', () => {
    const decision = routeModel(profile({ complexity: 'low', risk: 'high' }));
    expect(decision.tier).toBe('frontier');
  });

  it('keeps medium work on the balanced tier', () => {
    const decision = routeModel(profile());
    expect(decision.tier).toBe('balanced');
  });

  it('explains the routing decision and names a cheaper fallback', () => {
    const decision = routeModel(profile({ complexity: 'high', requiresReasoning: true }));
    expect(decision.rationale.trim().length).toBeGreaterThan(0);
    expect(decision.fallbackTier).not.toBe(decision.tier);
  });

  it('is deterministic for the same profile', () => {
    expect(routeModel(profile())).toEqual(routeModel(profile()));
  });
});
