import type { StoredEvent, UnifiedStore } from '../state/unified-store.js';
import type { Approval } from './types.js';

interface ApprovalEvent {
  kind: 'approval';
  approvalId: string;
  approval: Approval;
}

export async function saveApproval(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  approval: Approval
): Promise<void> {
  const event: ApprovalEvent = {
    kind: 'approval',
    approvalId: approval.id,
    approval: structuredClone(approval),
  };

  await store.appendApproval(projectsDir, slug, event);
}

export async function loadApproval(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  approvalId: string
): Promise<Approval | undefined> {
  const events = await store.query(
    projectsDir,
    slug,
    'approval',
    (event: StoredEvent) => {
      const data = event.data as Partial<ApprovalEvent>;
      return data.kind === 'approval' && data.approvalId === approvalId;
    },
    1
  );

  const latest = events[0];
  if (!latest) return undefined;

  const data = latest.data as ApprovalEvent;
  return structuredClone(data.approval);
}
