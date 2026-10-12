/**
 * Canonical factory vocabulary. One source of truth for the phases a signal
 * moves through and the three loops that place automation at different points.
 */

export const FACTORY_PHASES = [
  'signal',
  'triage',
  'plan',
  'spec',
  'execute',
  'verify',
  'review',
  'ship',
  'monitor',
] as const;

export type FactoryPhase = (typeof FACTORY_PHASES)[number];

export const FACTORY_LOOPS = [
  {
    id: 'inner',
    runsWhen: 'while an agent works, before a pull request is opened',
    cost: 'cheap and fast, run repeatedly',
    improves: 'autonomy',
  },
  {
    id: 'outer',
    runsWhen: 'when a pull request is opened',
    cost: 'expensive checks that are wasteful on every iteration',
    improves: 'automation',
  },
  {
    id: 'meta',
    runsWhen: 'outside development, over logs, pull requests, issues, and feedback',
    cost: 'scheduled review',
    improves: 'the inner and outer loops',
  },
] as const;

export type FactoryLoopId = (typeof FACTORY_LOOPS)[number]['id'];

/** Bounded authority for each stage, mirroring the repository agent protocol. */
export const FACTORY_ROLES = [
  { id: 'sentry', authority: 'review', mode: 'read-only' },
  { id: 'pulse', authority: 'verification', mode: 'read-only' },
  { id: 'maintainer', authority: 'repository health', mode: 'local-write' },
  { id: 'orchestrator', authority: 'coordination', mode: 'coordination' },
] as const;
