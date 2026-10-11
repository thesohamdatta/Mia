import { loadApprovalForWork, saveApproval } from '../../approval/persistence.js';
import { createApproval, resolveApproval } from '../../approval/types.js';
import { loadWork } from '../../work/persistence.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

// Human approval is the final gate before shipping. `plan` marks Work as
// requiring approval, and `ship` refuses without one, so this skill is the
// explicit CLI path that records the decision. It never ships work itself.

const USAGE = [
  'Usage: mia approve [--reject] [--status] <workId> [note]',
  '',
  '  <workId> [note]        Approve shipping the work item.',
  '  --reject <workId> ...  Record a rejection instead of an approval.',
  '  --status <workId>      Show the current ship approval, if any.',
].join('\n');

interface ParsedArgs {
  action: 'approve' | 'reject' | 'status';
  workId: string;
  note?: string;
}

function parseArgs(args: readonly string[]): ParsedArgs | null {
  const rest = [...args];
  let action: ParsedArgs['action'] = 'approve';

  if (rest[0] === '--status') {
    action = 'status';
    rest.shift();
  } else if (rest[0] === '--reject') {
    action = 'reject';
    rest.shift();
  }

  const workId = rest.shift()?.trim();
  if (!workId) return null;

  const note = rest.join(' ').trim();
  return { action, workId, note: note || undefined };
}

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const parsed = parseArgs(args);
  if (!parsed) {
    return { ok: false, status: 'blocked', error: USAGE };
  }

  const { action, workId, note } = parsed;
  const { projectsDir } = ctx.config;
  const work = await loadWork(ctx.unifiedStore, projectsDir, ctx.slug, workId);
  if (!work) {
    return { ok: false, status: 'blocked', error: `Work not found: ${workId}` };
  }

  const existing = await loadApprovalForWork(
    ctx.unifiedStore,
    projectsDir,
    ctx.slug,
    workId,
    'ship'
  );

  if (action === 'status') {
    const status = existing ? `${existing.status} (${existing.id})` : 'No approval recorded';
    return {
      ok: true,
      status: 'success',
      output: `MIA approval status\n\nWork: ${workId}\nState: ${work.state}\nShip approval: ${status}`,
    };
  }

  if (existing && existing.status !== 'pending') {
    return {
      ok: true,
      status: 'success',
      output: `Work ${workId} is already ${existing.status} for ship; no change recorded.`,
    };
  }

  // Approval is a deliberate handoff decision, so the work must already be
  // ready to ship. Refusing earlier states prevents approving work that the
  // verification gate has not yet cleared.
  if (work.state !== 'ready_to_ship') {
    return {
      ok: false,
      status: 'blocked',
      error: `Cannot approve work in state "${work.state}". Approve only work that is ready_to_ship.`,
    };
  }

  const pending = createApproval({ workId, runId: ctx.run.id, action: 'ship' });
  const resolved = resolveApproval(pending, action === 'reject' ? 'rejected' : 'approved', note);
  await saveApproval(ctx.unifiedStore, projectsDir, ctx.slug, resolved);

  const decision = action === 'reject' ? 'REJECTED' : 'APPROVED';
  return {
    ok: true,
    status: 'success',
    output: [
      `MIA approval: ${decision}`,
      '',
      `Work: ${workId}`,
      `Approval: ${resolved.id}`,
      'Action: ship',
      ...(note ? [`Note: ${note}`] : []),
      '',
      action === 'reject'
        ? 'Ship remains blocked until an approval is recorded.'
        : 'Run: mia ship <workId>',
    ].join('\n'),
  };
}

export const executor: SkillExecutor = { execute };
