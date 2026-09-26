import { describe, expect, it } from 'bun:test';
import { createRootPlan } from '../root/types.js';
import { createWorkFromRootPlan } from '../work/from-root-plan.js';

describe('RootPlan -> Work bridge', () => {
  it('creates a planned Work item from a root plan', () => {
    const plan = createRootPlan(
      {
        request: 'Build a meeting summarizer',
        projectContext: ['Existing app'],
        currentWorkState: 'draft',
        availableCapabilities: ['mobile', 'ai'],
        learnings: [],
        authority: { humanApprovalRequired: true, allowedAutonomy: 'execute-within-scope' },
      },
      {
        objective: 'Build a meeting summarizer',
        ambiguities: [],
        capabilities: ['mobile', 'ai'],
        dependencies: ['Transcription API'],
        nextActions: ['Define acceptance criteria'],
        approvals: ['Human approval before release'],
        expectedEvidence: ['Tests pass'],
      }
    );

    const work = createWorkFromRootPlan(plan);

    expect(work.objective).toBe(plan.objective);
    expect(work.state).toBe('planned');
    expect(work.capabilities).toEqual(plan.capabilities);
    expect(work.dependencies).toEqual(plan.dependencies);
    expect(work.successCriteria).toEqual(plan.expectedEvidence);
  });

  it('does not alias plan collections', () => {
    const plan = createRootPlan(
      {
        request: 'Build X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software'],
        learnings: [],
        authority: { humanApprovalRequired: false, allowedAutonomy: 'suggest-only' },
      },
      {
        objective: 'Build X',
        ambiguities: [],
        capabilities: ['software'],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: ['Tests pass'],
      }
    );

    const work = createWorkFromRootPlan(plan);
    plan.capabilities.push('qa');
    plan.dependencies.push('API');
    plan.expectedEvidence.push('CI');

    expect(work.capabilities).toEqual(['software']);
    expect(work.dependencies).toEqual([]);
    expect(work.successCriteria).toEqual(['Tests pass']);
  });

  it('refuses to skip required clarification', () => {
    const plan = createRootPlan(
      {
        request: 'Build X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software'],
        learnings: [],
        authority: { humanApprovalRequired: false, allowedAutonomy: 'suggest-only' },
      },
      {
        objective: 'Build X',
        ambiguities: ['What platform?'],
        capabilities: ['software'],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: [],
      }
    );

    expect(() => createWorkFromRootPlan(plan)).toThrow(/unresolved ambiguities/);
  });
});
