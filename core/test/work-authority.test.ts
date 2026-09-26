import { describe, expect, it } from 'bun:test';
import { createRootPlan } from '../root/types.js';
import { createWork } from '../work/types.js';
import { createWorkFromRootPlan } from '../work/from-root-plan.js';

describe('Work authority', () => {
  it('defaults standalone Work to no required human approval', () => {
    const work = createWork({ objective: 'Build X' });
    expect(work.requiresHumanApproval).toBe(false);
  });

  it('records an explicit human approval requirement', () => {
    const work = createWork({
      objective: 'Release X',
      requiresHumanApproval: true,
    });

    expect(work.requiresHumanApproval).toBe(true);
  });

  it('carries RootPlan authority into planned Work', () => {
    const plan = createRootPlan(
      {
        request: 'Release X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software'],
        learnings: [],
        authority: {
          humanApprovalRequired: true,
          allowedAutonomy: 'execute-within-scope',
        },
      },
      {
        objective: 'Release X',
        ambiguities: [],
        capabilities: ['software'],
        dependencies: [],
        nextActions: ['Run verification'],
        approvals: ['Human approval before release'],
        expectedEvidence: ['Tests pass'],
      }
    );

    const work = createWorkFromRootPlan(plan);
    expect(work.requiresHumanApproval).toBe(true);
  });
});
