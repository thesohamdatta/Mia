import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill } from '../skills/index.js';
import type { ExecutionContext } from '../skills/types.js';
import { loadWork } from '../work/persistence.js';

// plan must consume the shared design concept: refuse to plan while design
// questions are unresolved, carry the resolved success decision into the Work
// as its success criteria, and surface the concept in PLAN.md — instead of the
// constant "Tests pass".
describe('plan consumes the grill design concept', () => {
  const cleanups: string[] = [];

  afterEach(() => {
    for (const dir of cleanups.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function contextFor(): ExecutionContext {
    const dir = mkdtempSync(join(tmpdir(), 'mia-plan-grill-'));
    cleanups.push(dir);
    const ctx = createExecutionContext(dir);
    ctx.config = { ...ctx.config, projectsDir: join(dir, '.mia-state', 'projects') };
    return { ...ctx, slug: 'demo' };
  }

  async function run(ctx: ExecutionContext, skill: string, args: string[]) {
    const definition = getSkill(skill);
    if (!definition) throw new Error(`${skill} definition not found`);
    return executeSkillDefinition(definition, args, ctx);
  }

  // Order of DESIGN_QUESTIONS: problem, assumptions, risks, success, dependencies, scope.
  async function resolveAll(ctx: ExecutionContext, objective: string) {
    await run(ctx, 'grill', ['start', objective]);
    for (let i = 0; i < 6; i++) {
      await run(ctx, 'grill', ['answer', `answer-${i}`]);
    }
  }

  it('blocks planning while grill decisions are unresolved', async () => {
    const ctx = contextFor();
    await run(ctx, 'grill', ['start', 'add login']);

    const result = await run(ctx, 'plan', ['create', 'add login']);

    expect(result.ok).toBe(false);
    expect(result.error).toContain('unresolved');
  });

  it('uses the resolved success decision as the Work success criteria', async () => {
    const ctx = contextFor();
    await resolveAll(ctx, 'add login');

    const result = await run(ctx, 'plan', ['create', 'add login']);
    expect(result.ok).toBe(true);

    const workId = result.output?.match(/Work: (work_\S+)/)?.[1] as string;
    const work = await loadWork(ctx.unifiedStore, ctx.config.projectsDir, ctx.slug, workId);

    expect(work?.successCriteria).toEqual(['answer-3']);
    expect(work?.successCriteria).not.toContain('Tests pass');
  });

  it('surfaces the design concept in PLAN.md', async () => {
    const ctx = contextFor();
    await resolveAll(ctx, 'add login');
    await run(ctx, 'plan', ['create', 'add login']);

    const planText = await Bun.file(join(ctx.config.projectsDir, ctx.slug, 'PLAN.md')).text();

    expect(planText).toContain('Design Concept');
    expect(planText).toContain('answer-0');
  });

  it('keeps working without a grill session (backward compatible)', async () => {
    const ctx = contextFor();

    const result = await run(ctx, 'plan', ['create', 'unrelated task']);

    expect(result.ok).toBe(true);
    expect(result.output).toContain('PLAN.md');
  });
});
