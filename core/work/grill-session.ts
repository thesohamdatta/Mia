import type { ExecutionContext } from '../skills/types.js';

// The grill design concept is shared state: grill writes it, plan reads it.
// It lives here, beside the other Work persistence, so neither skill owns the
// other's data. Sessions are stored as `timeline` events with a `kind`
// discriminator (the same pattern as operational observations), so no new store
// or event type is introduced.

export interface GrillQuestion {
  id: string;
  prompt: string;
  resolved: boolean;
  answer?: string;
}

export interface GrillSession {
  objective: string;
  questions: GrillQuestion[];
  startedAt: string;
  updatedAt: string;
}

interface GrillEvent {
  kind: 'grill-session';
  session: GrillSession;
}

// The design tree: each branch is resolved one by one before implementation.
export const DESIGN_QUESTIONS: readonly { id: string; prompt: string }[] = [
  { id: 'problem', prompt: "What's the actual problem we're solving?" },
  { id: 'assumptions', prompt: 'What do we believe is true (assumptions)?' },
  { id: 'risks', prompt: 'What could go wrong (technical, product, timeline)?' },
  { id: 'success', prompt: "What does 'done' look like (verifiable criteria)?" },
  { id: 'dependencies', prompt: 'What do we need from others (dependencies)?' },
  { id: 'scope', prompt: "What's explicitly NOT in scope?" },
];

export function createGrillSession(objective: string): GrillSession {
  const now = new Date().toISOString();
  return {
    objective,
    questions: DESIGN_QUESTIONS.map((question) => ({ ...question, resolved: false })),
    startedAt: now,
    updatedAt: now,
  };
}

export function nextUnresolved(session: GrillSession): GrillQuestion | undefined {
  return session.questions.find((question) => !question.resolved);
}

export async function saveGrillSession(
  ctx: ExecutionContext,
  session: GrillSession
): Promise<void> {
  session.updatedAt = new Date().toISOString();
  const event: GrillEvent = { kind: 'grill-session', session };
  await ctx.unifiedStore.appendTimeline(ctx.config.projectsDir, ctx.slug, event);
}

export async function loadGrillSession(ctx: ExecutionContext): Promise<GrillSession | null> {
  const events = await ctx.unifiedStore.query(
    ctx.config.projectsDir,
    ctx.slug,
    'timeline',
    (event) => {
      const data = event.data as Partial<GrillEvent>;
      return data.kind === 'grill-session' && data.session !== undefined;
    },
    1
  );
  const latest = events[0];
  return latest ? structuredClone((latest.data as GrillEvent).session) : null;
}

export async function listGrillDecisions(ctx: ExecutionContext): Promise<GrillQuestion[]> {
  const session = await loadGrillSession(ctx);
  return session ? session.questions.map((question) => ({ ...question })) : [];
}
