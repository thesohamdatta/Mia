// Grill Skill Executor - Persisted design interview
// Runs: mia grill
//
// "Grill me" is a real interview, not a static prompt: it captures decisions
// one question at a time and persists a shared design concept that later
// phases can consume. Sessions are stored as `timeline` events with a
// `kind` discriminator (the same pattern used for operational observations),
// so no new store or event type is introduced. GRILL.md is a derived artifact.

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

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
const DESIGN_QUESTIONS: readonly { id: string; prompt: string }[] = [
  { id: 'problem', prompt: "What's the actual problem we're solving?" },
  { id: 'assumptions', prompt: 'What do we believe is true (assumptions)?' },
  { id: 'risks', prompt: 'What could go wrong (technical, product, timeline)?' },
  { id: 'success', prompt: "What does 'done' look like (verifiable criteria)?" },
  { id: 'dependencies', prompt: 'What do we need from others (dependencies)?' },
  { id: 'scope', prompt: "What's explicitly NOT in scope?" },
];

function newSession(objective: string): GrillSession {
  const now = new Date().toISOString();
  return {
    objective,
    questions: DESIGN_QUESTIONS.map((q) => ({ ...q, resolved: false })),
    startedAt: now,
    updatedAt: now,
  };
}

function nextUnresolved(session: GrillSession): GrillQuestion | undefined {
  return session.questions.find((question) => !question.resolved);
}

async function saveSession(ctx: ExecutionContext, session: GrillSession): Promise<void> {
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

async function writeGrillArtifact(ctx: ExecutionContext, session: GrillSession): Promise<string> {
  const path = join(ctx.config.projectsDir, ctx.slug, 'GRILL.md');
  const content = [
    '# MIA Design Concept',
    '',
    `Objective: ${session.objective}`,
    `Updated: ${session.updatedAt}`,
    '',
    '## Decisions',
    ...session.questions.map((question) => {
      const status = question.resolved ? '[x]' : '[ ]';
      const answer = question.resolved && question.answer ? ` — ${question.answer}` : '';
      return `- ${status} ${question.prompt}${answer}`;
    }),
  ].join('\n');
  await writeFile(path, content, 'utf8');
  return path;
}

function renderSession(session: GrillSession): string {
  const unresolved = session.questions.filter((question) => !question.resolved);
  const lines = [`🔥 GRILL: ${session.objective}`, ''];
  session.questions.forEach((question, index) => {
    const mark = question.resolved ? '✓' : '·';
    const answer = question.resolved && question.answer ? ` → ${question.answer}` : '';
    lines.push(`${mark} ${index + 1}. ${question.prompt}${answer}`);
  });
  lines.push('');
  if (unresolved.length > 0) {
    lines.push(`${unresolved.length} unresolved. Next: ${unresolved[0]?.prompt}`);
    lines.push('Answer with: mia grill answer <your decision>');
  } else {
    lines.push('All design questions resolved. Proceed to mia plan create "<objective>".');
  }
  return lines.join('\n');
}

const NO_SESSION = "No active grill session. Run 'mia grill start <objective>' first.";

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'start';

  if (subcmd === 'start') {
    const objective = args.slice(1).join(' ').trim();
    const session = await loadGrillSession(ctx);

    if (!objective) {
      if (session) {
        return { ok: true, status: 'success', output: renderSession(session) };
      }
      return {
        ok: true,
        status: 'success',
        output: [
          '🔥 GRILL MODE ACTIVATED',
          '',
          'Golden Rule: never jump to code without a grill session for non-trivial work.',
          'Start one with: mia grill start <objective>',
          'Then resolve each design branch with: mia grill answer <decision>',
        ].join('\n'),
      };
    }

    const created = newSession(objective);
    await saveSession(ctx, created);
    const path = await writeGrillArtifact(ctx, created);
    return {
      ok: true,
      status: 'success',
      output: `${renderSession(created)}\n\nDesign concept written to ${path}`,
    };
  }

  if (subcmd === 'answer') {
    const answer = args.slice(1).join(' ').trim();
    if (!answer) {
      return { ok: false, status: 'blocked', error: 'Usage: mia grill answer <decision>' };
    }

    const session = await loadGrillSession(ctx);
    if (!session) {
      return { ok: false, status: 'blocked', error: NO_SESSION };
    }

    const question = nextUnresolved(session);
    if (!question) {
      return {
        ok: true,
        status: 'success',
        output:
          'All design questions are already resolved. Proceed to mia plan create "<objective>".',
      };
    }

    question.resolved = true;
    question.answer = answer;
    await saveSession(ctx, session);
    await writeGrillArtifact(ctx, session);
    return { ok: true, status: 'success', output: renderSession(session) };
  }

  if (subcmd === 'status') {
    const session = await loadGrillSession(ctx);
    if (!session) {
      return { ok: true, status: 'success', output: NO_SESSION };
    }
    return { ok: true, status: 'success', output: renderSession(session) };
  }

  if (subcmd === 'questions') {
    return {
      ok: true,
      status: 'success',
      output: [
        'Grill Questions Template:',
        '',
        ...DESIGN_QUESTIONS.map((question) => `- ${question.prompt}`),
        '',
        'Run "mia grill start <objective>" to begin a persisted session.',
      ].join('\n'),
    };
  }

  return {
    ok: false,
    status: 'blocked',
    error: 'Usage: mia grill [start <objective>|answer <decision>|status|questions]',
  };
}

export const executor: SkillExecutor = { execute };
