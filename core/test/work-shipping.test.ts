import { describe, expect, it } from 'bun:test';
import { createApproval, resolveApproval } from '../approval/types.js';
import { recordApproval, recordVerification } from '../work/lifecycle.js';
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

  function verifiedWork(requiresHumanApproval = false) {
    return recordVerification(readyWork(requiresHumanApproval), {
      runId: 'run-verify',
      passed: true,
      records: [
        {
          runId: 'run-verify',
          name: 'tests',
          status: 'passed',
          command: 'bun test',
          durationMs: 1,
          detail: 'passed',
        },
      ],
    });
  }

  it('does not allow direct transition to shipped', () => {
    const work = createWork({ objective: 'Release X' });
    expect(() => transitionWork(work, 'shipped')).toThrow(
      /Invalid work transition: draft -> shipped/
    );
  });

  it('blocks shipping when verification evidence is missing', () => {
    const work = readyWork();
    expect(() => shipWork(work)).toThrow(/verification evidence is missing/);
  });

  it('blocks shipping when a required verification check is missing', () => {
    const work = verifiedWork();

    expect(() => shipWork(work, ['tests', 'typecheck'])).toThrow(
      /Work verification is incomplete: typecheck/
    );
  });

  it('blocks shipping when verification has not passed', () => {
    const work = recordVerification(readyWork(), {
      runId: 'run-verify',
      passed: false,
      records: [
        {
          runId: 'run-verify',
          name: 'tests',
          status: 'failed',
          command: 'bun test',
          durationMs: 1,
          detail: 'failed',
        },
      ],
    });

    expect(() => shipWork(work)).toThrow(/verification has not passed/);
  });

  it('blocks shipping when required approval is missing', () => {
    const work = verifiedWork(true);
    expect(() => shipWork(work)).toThrow(/human approval is required/);
  });

  it('blocks shipping when approval is not approved', () => {
    const work = verifiedWork(true);
    const approval = createApproval({ workId: work.id, runId: 'run-1', action: 'ship' });
    const withApproval = recordApproval(work, approval);

    expect(() => shipWork(withApproval)).toThrow(/approval is not approved/);
  });

  it('blocks shipping when the approval is for another action', () => {
    const work = verifiedWork(true);
    const approval = resolveApproval(
      createApproval({ workId: work.id, runId: 'run-1', action: 'delete' }),
      'approved'
    );
    const withApproval = recordApproval(work, approval);

    expect(() => shipWork(withApproval)).toThrow(/approval is not for ship/);
  });

  it('ships only after verification and required approval are satisfied', () => {
    const work = verifiedWork(true);
    const approval = resolveApproval(
      createApproval({ workId: work.id, runId: 'run-1', action: 'ship' }),
      'approved'
    );
    const withApproval = recordApproval(work, approval);

    const shipped = shipWork(withApproval);

    expect(shipped.state).toBe('shipped');
    expect(shipped.id).toBe(work.id);
  });

  it('allows shipping without approval when Work does not require it', () => {
    const shipped = shipWork(verifiedWork(false));
    expect(shipped.state).toBe('shipped');
  });
});
