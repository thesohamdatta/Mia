import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

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
    const path = join(ctx.config.projectsDir, ctx.slug, 'PLAN.md');
    const content = [
      '# MIA Plan',
      '',
      `Run: ${ctx.run.id}`,
      '',
      '## Objective',
      objective,
      '',
      '## Success Criteria',
      '- [ ] Define observable outcomes',
      '- [ ] Define required verification',
      '',
      '## Steps',
      '1. [ ] Identify the smallest vertical slice',
      '2. [ ] Implement the slice',
      '3. [ ] Verify the slice',
      '',
      '## Risks',
      '- [ ] Record material risks and mitigations',
      '',
      '## Out of Scope',
      '- [ ] Record explicit exclusions',
    ].join('\n');
    await writeFile(path, content, 'utf8');
    return { ok: true, status: 'success', output: `Plan written to ${path}` };
  }

  return { ok: false, status: 'blocked', error: 'Usage: mia plan [create <objective>|template]' };
}

export const executor: SkillExecutor = { execute };