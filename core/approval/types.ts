export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  workId: string;
  runId: string;
  action: string;
  status: ApprovalStatus;
  requestedAt: string;
  updatedAt: string;
  note?: string;
}

export interface CreateApprovalInput {
  workId: string;
  runId: string;
  action: string;
}

function makeId(): string {
  return `approval_${crypto.randomUUID()}`;
}

export function createApproval(input: CreateApprovalInput): Approval {
  const workId = input.workId.trim();
  const runId = input.runId.trim();
  const action = input.action.trim();

  if (!workId) throw new Error('Approval work id is required');

  if (!runId) throw new Error('Approval run id is required');
  if (!action) throw new Error('Approval action is required');

  const now = new Date().toISOString();

  return {
    id: makeId(),
    workId,
    runId,
    action,
    status: 'pending',
    requestedAt: now,
    updatedAt: now,
  };
}

export function resolveApproval(
  approval: Approval,
  status: Exclude<ApprovalStatus, 'pending'>,
  note?: string
): Approval {
  if (approval.status !== 'pending') {
    throw new Error(`Approval is already resolved: ${approval.status}`);
  }

  return {
    ...approval,
    status,
    updatedAt: new Date().toISOString(),
    ...(note === undefined ? {} : { note: note.trim() }),
  };
}
