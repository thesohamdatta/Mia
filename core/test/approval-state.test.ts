import { describe, expect, it } from 'bun:test';
import { loadApproval, saveApproval } from '../approval/persistence.js';
import { createApproval, resolveApproval } from '../approval/types.js';
import { createUnifiedStore } from '../state/unified-store.js';

describe('Approval state', () => {
  it('creates a pending approval request', () => {
    const approval = createApproval({
      workId: 'work-1',
      runId: 'run-1',
      action: 'ship',
    });

    expect(approval.id).toMatch(/^approval_/);
    expect(approval.workId).toBe('work-1');
    expect(approval.runId).toBe('run-1');
    expect(approval.action).toBe('ship');
    expect(approval.status).toBe('pending');
    expect(approval.requestedAt).toBe(approval.updatedAt);
  });

  it('resolves an approval without changing its identity', () => {
    const approval = createApproval({ workId: 'work-1', runId: 'run-1', action: 'ship' });
    const resolved = resolveApproval(approval, 'approved', 'Human approved release');

    expect(resolved.id).toBe(approval.id);
    expect(resolved.runId).toBe(approval.runId);
    expect(resolved.status).toBe('approved');
    expect(resolved.note).toBe('Human approved release');
  });

  it('does not allow a resolved approval to be changed again', () => {
    const approval = createApproval({ workId: 'work-1', runId: 'run-1', action: 'ship' });
    const resolved = resolveApproval(approval, 'rejected');

    expect(() => resolveApproval(resolved, 'approved')).toThrow(/already resolved/);
  });

  it('persists and recovers the latest approval state', async () => {
    const store = createUnifiedStore();
    const approval = createApproval({ runId: 'run-1', action: 'ship' });
    const resolved = resolveApproval(approval, 'approved');

    const projectsDir = '/tmp/mia-approval-test';
    await saveApproval(store, projectsDir, 'mia', approval);
    await saveApproval(store, projectsDir, 'mia', resolved);

    const restored = await loadApproval(store, projectsDir, 'mia', approval.id);

    expect(restored).toEqual(resolved);
  });
});
