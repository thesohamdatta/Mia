export const WORK_STATES = [
  'draft',
  'specified',
  'planned',
  'in_progress',
  'verification',
  'review',
  'ready_to_ship',
  'shipped',
  'maintained',
  'blocked',
  'failed',
  'needs_human',
] as const;

export type WorkState = (typeof WORK_STATES)[number];

export interface Work {
  id: string;
  objective: string;
  state: WorkState;
  successCriteria: string[];
  capabilities: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkInput {
  objective: string;
  successCriteria?: string[];
  capabilities?: string[];
  dependencies?: string[];
}

const TRANSITIONS: Record<WorkState, readonly WorkState[]> = {
  draft: ['specified', 'blocked', 'failed', 'needs_human'],
  specified: ['planned', 'blocked', 'failed', 'needs_human'],
  planned: ['in_progress', 'blocked', 'failed', 'needs_human'],
  in_progress: ['verification', 'blocked', 'failed', 'needs_human'],
  verification: ['review', 'in_progress', 'blocked', 'failed', 'needs_human'],
  review: ['ready_to_ship', 'in_progress', 'blocked', 'failed', 'needs_human'],
  ready_to_ship: ['shipped', 'review', 'blocked', 'needs_human'],
  shipped: ['maintained'],
  maintained: ['in_progress', 'maintained'],
  blocked: ['specified', 'planned', 'in_progress', 'needs_human', 'failed'],
  failed: ['in_progress', 'needs_human'],
  needs_human: ['draft', 'specified', 'planned', 'in_progress', 'verification', 'review', 'ready_to_ship', 'failed', 'blocked'],
};

function makeId(): string {
  return `work_${crypto.randomUUID()}`;
}

export function createWork(input: CreateWorkInput): Work {
  const objective = input.objective.trim();
  if (!objective) {
    throw new Error('Work objective is required');
  }

  const now = new Date().toISOString();

  return {
    id: makeId(),
    objective,
    state: 'draft',
    successCriteria: [...(input.successCriteria ?? [])],
    capabilities: [...(input.capabilities ?? [])],
    dependencies: [...(input.dependencies ?? [])],
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionWork(work: Work, nextState: WorkState): Work {
  if (!TRANSITIONS[work.state].includes(nextState)) {
    throw new Error(`Invalid work transition: ${work.state} -> ${nextState}`);
  }

  return {
    ...work,
    state: nextState,
    updatedAt: new Date().toISOString(),
  };
}
