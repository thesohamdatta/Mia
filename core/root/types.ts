import type { WorkState } from '../work/types.js';

export type AutonomyLevel =
  | 'suggest-only'
  | 'execute-within-scope'
  | 'execute-and-verify';

export interface RootAuthority {
  humanApprovalRequired: boolean;
  allowedAutonomy: AutonomyLevel;
}

export interface RootPlanInput {
  request: string;
  projectContext: string[];
  currentWorkState: WorkState;
  availableCapabilities: string[];
  learnings: string[];
  authority: RootAuthority;
}

export interface RootPlan {
  request: string;
  objective: string;
  projectContext: string[];
  currentWorkState: WorkState;
  availableCapabilities: string[];
  learnings: string[];
  authority: RootAuthority;
  ambiguities: string[];
  capabilities: string[];
  dependencies: string[];
  nextActions: string[];
  approvals: string[];
  expectedEvidence: string[];
}

export interface RootPlanProposal {
  objective: string;
  ambiguities: string[];
  capabilities: string[];
  dependencies: string[];
  nextActions: string[];
  approvals: string[];
  expectedEvidence: string[];
}

export function createRootPlan(
  input: RootPlanInput,
  proposal: RootPlanProposal
): RootPlan {
  const request = input.request.trim();
  if (!request) {
    throw new Error('Root request is required');
  }

  const objective = proposal.objective.trim();
  if (!objective) {
    throw new Error('Root objective is required');
  }

  return {
    request,
    objective,
    projectContext: [...input.projectContext],
    currentWorkState: input.currentWorkState,
    availableCapabilities: [...input.availableCapabilities],
    learnings: [...input.learnings],
    authority: { ...input.authority },
    ambiguities: [...proposal.ambiguities],
    capabilities: [...proposal.capabilities],
    dependencies: [...proposal.dependencies],
    nextActions: [...proposal.nextActions],
    approvals: [...proposal.approvals],
    expectedEvidence: [...proposal.expectedEvidence],
  };
}
