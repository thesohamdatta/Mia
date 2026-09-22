import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const subcmd = args[0] || 'create';
  const problem = args.slice(1).join(' ').trim();

  if (subcmd !== 'create') {
    return { ok: false, status: 'blocked', error: 'Usage: mia spec create <problem>' };
  }

  if (!problem) {
    return { ok: false, status: 'blocked', error: 'Usage: mia spec create <problem>' };
  }

  const path = join(ctx.config.projectsDir, ctx.slug, 'SPEC.md');
  const content = [
    '# MIA Specification',
    '',
    `Run: ${ctx.run.id}`,
    '',
    '## Problem',
    problem,
    '',
    '## User / System Outcome',
    '- [ ] Define who or what benefits',
    '',
    '## Acceptance Criteria',
    '- [ ] Observable criterion',
    '',
    '## Technical Approach',
    '- [ ] Identify affected modules and interfaces',
    '',
    '## Risks',
    '- [ ] Record material risks and mitigations',
    '',
    '## Out of Scope',
    '- [ ] Record explicit exclusions',
  ].join('\n');

  await writeFile(path, content, 'utf8');
  return { ok: true, status: 'success', output: `Specification written to ${path}` };
}

export const executor: SkillExecutor = { execute };