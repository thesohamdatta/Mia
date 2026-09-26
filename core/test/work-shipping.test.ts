import { describe, expect, it } from 'bun:test';
import { createApproval, resolveApproval } from '../approval/types.js';
import { shipWork } from '../work/ship.js';
import { createWork, transitionWork } from '../work/types.js';

describe('Work shipping gate', () => {
  function readyWork(requiresHumanApproval = false) {
    let work = createWork({ objective: 'Release X', requiresHumanApproval });
    work = transitionWork(work, 'specified');
    work = transitionWork(work, 'planned');
    work = transitionWork(work, 'in_progress');
    work = transitionWork(work, 'verification');
    work = transitionWork(work, 'review');
    return transitionWork(work, 'ready_to_ship');
  }

  it('does not allow direct transition to shipped', () => {
    const work = createWork({ objective: 'Release X' });
    expect(() => transitionWork(work, 'shipped')).toThrow(
      /Invalid work transition: draft -> shipped/
    );
  });

  it('blocks shipping when verification has not passed', () => {
    const work = readyWork();
    expect(() => shipWork(work, { verificationPassed: false })).toThrow(
      /verification has not passed/
    );
  });

  it('blocks shipping when required approval is missing', () => {
    const work = readyWork(true);
    expect(() => shipWork(work, { verificationPassed: true })).toThrow(
      /human approval is required/
    );
  });

  it('blocks shipping when approval is not approved', () => {
    const work = readyWork(true);
    const approval = createApproval({ workId: work.id, runId: 'run-1', action: 'ship' });
    expect(() => shipWork(work, { verificationPassed: true, approval })).toThrow(
      /approval is not approved/
    );
  });

  it('ships only after verification and required approval are satisfied', () => {
    const work = readyWork(true);
    const approval = resolveApproval(
      createApproval({ workId: work.id, runId: 'run-1', action: 'ship' }),
      'approved'
    );

    const shipped = shipWork(work, { verificationPassed: true, approval });

    expect(shipped.state).toBe('shipped');
    expect(shipped.id).toBe(work.id);
  });

  it('allows shipping without approval when Work does not require it', () => {
    const shipped = shipWork(readyWork(false), { verificationPassed: true });
    expect(shipped.state).toBe('shipped');
  });
});
