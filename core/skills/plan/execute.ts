import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRootPlan } from '../../root/types.js';
import { createWorkFromRootPlan } from '../../work/from-root-plan.js';
import { loadGrillSession } from '../../work/grill-session.js';
import { saveWork } from '../../work/persistence.js';
import type { ExecutionContext, LearningRecord, SkillResult } from '../types.js';

const DEFAULT_EVIDENCE = ['Tests pass'];

function makePlan(request: string, learnings: string[], successCriteria: string[]) {
  return createRootPlan(
    {
      request,
      projectContext: [],
      currentWorkState: 'draft',
      availableCapabilities: ['software'],
      learnings,
      authority: {
        humanApprovalRequired: true,
        allowedAutonomy: 'execute-within-scope',
      },
    },
    {
      objective: request,
      ambiguities: [],
      capabilities: ['software'],
      dependencies: [],
      nextActions: ['Implement the planned work'],
      approvals: [],
      expectedEvidence: successCriteria,
    }
  );
}

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'create';
  const objective = args.slice(1).join(' ').trim();

  if (subcmd === 'template') {
    return {
      ok: true,
      status: 'success',
      output: [
        '## Objective',
        '[one sentence]',
        '',
        '## Success Criteria',
        '- [ ] observable outcome',
        '',
        '## Steps',
        '1. [small vertical slice]',
        '',
        '## Risks',
        '- [risk and mitigation]',
        '',
        '## Out of Scope',
        '- [explicit exclusion]',
      ].join('\n'),
    };
  }

  if (subcmd === 'create') {
    if (!objective) {
      return { ok: false, status: 'blocked', error: 'Usage: mia plan create <objective>' };
    }

    // Consume the shared design concept: planning is blocked until the grill
    // interview has resolved every design branch.
    const grill = await loadGrillSession(ctx);
    if (grill) {
      const unresolved = grill.questions.filter((question) => !question.resolved);
      if (unresolved.length > 0) {
        return {
          ok: false,
          status: 'blocked',
          error: `Cannot plan: ${unresolved.length} unresolved design decision(s). Next: ${unresolved[0]?.prompt}\nResolve with: mia grill answer <decision>`,
        };
      }
    }
    const resolved = grill?.questions ?? [];
    const successQuestion = resolved.find((question) => question.id === 'success');
    const successCriteria = successQuestion?.answer?.trim()
      ? [successQuestion.answer.trim()]
      : DEFAULT_EVIDENCE;

    const learningEvents = await ctx.unifiedStore.listLearnings(
      ctx.config.projectsDir,
      ctx.slug,
      5
    );
    const learnings = learningEvents
      .map((event) => (event.data as Partial<LearningRecord>).insight)
      .filter((insight): insight is string => Boolean(insight?.trim()));

    const plan = makePlan(objective, learnings, successCriteria);
    const work = createWorkFromRootPlan(plan);
    await saveWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, work);

    const path = join(ctx.config.projectsDir, ctx.slug, 'PLAN.md');
    const content = [
      '# MIA Plan',
      '',
      `Run: ${ctx.run.id}`,
      `Work: ${work.id}`,
      '',
      '## Objective',
      work.objective,
      '',
      '## Success Criteria',
      ...work.successCriteria.map((criterion) => `- [ ] ${criterion}`),
      '',
      ...(resolved.length > 0
        ? [
            '## Design Concept',
            ...resolved.map(
              (question) => `- ${question.prompt} — ${question.answer ?? '(unresolved)'}`
            ),
            '',
          ]
        : []),
      '## Steps',
      ...plan.nextActions.map((action, index) => `${index + 1}. [ ] ${action}`),
      '',
      '## Dependencies',
      ...(work.dependencies.length > 0
        ? work.dependencies.map((dependency) => `- ${dependency}`)
        : ['- None recorded']),
      '',
      '## Learnings Applied',
      ...(plan.learnings.length > 0
        ? plan.learnings.map((learning) => `- ${learning}`)
        : ['- None recorded']),
      '',
      '## Capabilities',
      ...(work.capabilities.length > 0
        ? work.capabilities.map((capability) => `- ${capability}`)
        : ['- None recorded']),
    ].join('\n');

    await writeFile(path, content, 'utf8');
    return {
      ok: true,
      status: 'success',
      output: `Plan written to ${path}\nWork: ${work.id}`,
    };
  }

  return { ok: false, status: 'blocked', error: 'Usage: mia plan [create <objective>|template]' };
}

