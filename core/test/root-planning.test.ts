import { describe, expect, it } from 'bun:test';
import { createRootPlan, type RootPlanInput, type RootPlan } from '../root/types.js';

describe('Root AI planning contract', () => {
  const input: RootPlanInput = {
    request: 'Build a mobile app that summarizes meeting recordings',
    projectContext: ['Existing Flutter app', 'Backend is FastAPI'],
    currentWorkState: 'draft',
    availableCapabilities: ['mobile', 'backend', 'ai', 'qa'],
    learnings: ['Keep the first release narrow'],
    authority: {
      humanApprovalRequired: true,
      allowedAutonomy: 'execute-within-scope',
    },
  };

  it('creates a deterministic planning shape from root inputs', () => {
    const plan: RootPlan = createRootPlan(input, {
      objective: 'Build a mobile app that summarizes meeting recordings',
      ambiguities: ['What audio providers are supported?'],
      capabilities: ['mobile', 'ai', 'qa'],
      dependencies: ['Backend transcription API'],
      nextActions: ['Clarify audio provider', 'Define acceptance criteria'],
      approvals: ['Human approval before release'],
      expectedEvidence: ['Acceptance criteria recorded', 'Tests pass'],
    });

    expect(plan.request).toBe(input.request);
    expect(plan.objective).toBe('Build a mobile app that summarizes meeting recordings');
    expect(plan.ambiguities).toEqual(['What audio providers are supported?']);
    expect(plan.capabilities).toEqual(['mobile', 'ai', 'qa']);
    expect(plan.dependencies).toEqual(['Backend transcription API']);
    expect(plan.nextActions).toEqual(['Clarify audio provider', 'Define acceptance criteria']);
    expect(plan.approvals).toEqual(['Human approval before release']);
    expect(plan.expectedEvidence).toEqual(['Acceptance criteria recorded', 'Tests pass']);
  });

  it('preserves planning context needed by the root agent', () => {
    const plan = createRootPlan(input, {
      objective: 'Build a meeting summarizer',
      ambiguities: [],
      capabilities: ['mobile'],
      dependencies: [],
      nextActions: ['Write the mobile spec'],
      approvals: [],
      expectedEvidence: [],
    });

    expect(plan.projectContext).toEqual(input.projectContext);
    expect(plan.currentWorkState).toBe('draft');
    expect(plan.availableCapabilities).toEqual(input.availableCapabilities);
    expect(plan.learnings).toEqual(input.learnings);
    expect(plan.authority).toEqual(input.authority);
  });

  it('rejects empty human requests and root objectives', () => {
    expect(() =>
      createRootPlan(
        { ...input, request: '   ' },
        {
          objective: 'Build X',
          ambiguities: [],
          capabilities: [],
          dependencies: [],
          nextActions: [],
          approvals: [],
          expectedEvidence: [],
        }
      )
    ).toThrow(/Root request is required/);

    expect(() =>
      createRootPlan(input, {
        objective: '   ',
        ambiguities: [],
        capabilities: [],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: [],
      })
    ).toThrow(/Root objective is required/);
  });
});
