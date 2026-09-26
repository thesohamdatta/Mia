import { describe, expect, it } from 'bun:test';
import { selectCapabilities } from '../capabilities/select.js';
import { createRootPlan } from '../root/types.js';

describe('Capability selection', () => {
  it('selects only capabilities made available to the root plan', () => {
    const plan = createRootPlan(
      {
        request: 'Build X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software', 'qa', 'design'],
        learnings: [],
        authority: { humanApprovalRequired: true, allowedAutonomy: 'execute-within-scope' },
      },
      {
        objective: 'Build X',
        ambiguities: [],
        capabilities: ['software', 'qa'],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: ['Tests pass'],
      }
    );

    expect(selectCapabilities(plan)).toEqual(['software', 'qa']);
  });

  it('rejects a capability that was not made available', () => {
    const plan = createRootPlan(
      {
        request: 'Build X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software'],
        learnings: [],
        authority: { humanApprovalRequired: true, allowedAutonomy: 'execute-within-scope' },
      },
      {
        objective: 'Build X',
        ambiguities: [],
        capabilities: ['hardware'],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: [],
      }
    );

    expect(() => selectCapabilities(plan)).toThrow(/Unavailable capability: hardware/);
  });

  it('returns a detached selection array', () => {
    const plan = createRootPlan(
      {
        request: 'Build X',
        projectContext: [],
        currentWorkState: 'draft',
        availableCapabilities: ['software'],
        learnings: [],
        authority: { humanApprovalRequired: true, allowedAutonomy: 'execute-within-scope' },
      },
      {
        objective: 'Build X',
        ambiguities: [],
        capabilities: ['software'],
        dependencies: [],
        nextActions: [],
        approvals: [],
        expectedEvidence: [],
      }
    );

    const selected = selectCapabilities(plan);
    selected.push('qa');

    expect(plan.capabilities).toEqual(['software']);
  });
});
