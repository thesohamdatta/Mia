import { describe, expect, it } from 'bun:test';
import {
  type RootPlan,
  type RootPlanInput,
  createRootPlan,
} from '../root/types.js';

describe('Root AI planning contract', () => {
  const input: RootPlanInput = {
    request: ' Build a mobile app that summarizes meeting recordings ',
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
      objective: ' Build a mobile app that summarizes meeting recordings ',
      ambiguities: ['What audio providers are supported?'],
      capabilities: ['mobile', 'ai', 'qa'],
      dependencies: ['Backend transcription API'],
      nextActions: ['Clarify audio provider', 'Define acceptance criteria'],
      approvals: ['Human approval before release'],
      expectedEvidence: ['Acceptance criteria recorded', 'Tests pass'],
    });

    expect(plan.request).toBe(
      'Build a mobile app that summarizes meeting recordings'
    );
    expect(plan.objective).toBe(
      'Build a mobile app that summarizes meeting recordings'
    );
    expect(plan.ambiguities).toEqual(['What audio providers are supported?']);
    expect(plan.capabilities).toEqual(['mobile', 'ai', 'qa']);
    expect(plan.dependencies).toEqual(['Backend transcription API']);
    expect(plan.nextActions).toEqual([
      'Clarify audio provider',
      'Define acceptance criteria',
    ]);
    expect(plan.approvals).toEqual(['Human approval before release']);
    expect(plan.expectedEvidence).toEqual([
      'Acceptance criteria recorded',
      'Tests pass',
    ]);
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

  it('copies planning collections at the contract boundary', () => {
    const projectContext = ['repository'];
    const availableCapabilities = ['software'];
    const learnings = ['prefer small changes'];
    const proposal = {
      objective: 'Build X',
      ambiguities: ['Scope'],
      capabilities: ['software'],
      dependencies: ['API'],
      nextActions: ['Plan'],
      approvals: ['Human'],
      expectedEvidence: ['Tests'],
    };

    const plan = createRootPlan(
      {
        ...input,
        projectContext,
        availableCapabilities,
        learnings,
      },
      proposal
    );

    projectContext.push('new context');
    availableCapabilities.push('qa');
    learnings.push('new learning');
    proposal.ambiguities.push('Another ambiguity');
    proposal.capabilities.push('backend');

    expect(plan.projectContext).toEqual(['repository']);
    expect(plan.availableCapabilities).toEqual(['software']);
    expect(plan.learnings).toEqual(['prefer small changes']);
    expect(plan.ambiguities).toEqual(['Scope']);
    expect(plan.capabilities).toEqual(['software']);
  });
});
