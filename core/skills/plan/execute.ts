import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRootPlan } from '../../root/types.js';
import { createWorkFromRootPlan } from '../../work/from-root-plan.js';
import { saveWork } from '../../work/persistence.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

function makePlan(request: string) {
  return createRootPlan(
    {
      request,
      projectContext: [],
      currentWorkState: 'draft',
      availableCapabilities: ['software'],
      learnings: [],
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
      expectedEvidence: ['Tests pass'],
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

    const plan = makePlan(objective);
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
      '## Steps',
      ...plan.nextActions.map((action, index) => `${index + 1}. [ ] ${action}`),
      '',
      '## Dependencies',
      ...(work.dependencies.length > 0
        ? work.dependencies.map((dependency) => `- ${dependency}`)
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

export const executor: SkillExecutor = { execute };
