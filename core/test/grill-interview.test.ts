import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { listGrillDecisions, loadGrillSession } from '../skills/grill/execute.js';
import { getSkill } from '../skills/index.js';
import type { ExecutionContext } from '../skills/types.js';

// "Grill me" must be a real, persisted interview: it captures decisions one by
// one, keeps unresolved questions visible, and leaves a shared design concept
// that later phases can consume — not a one-shot string printer.
describe('grill persisted interview', () => {
  const cleanups: string[] = [];

  afterEach(() => {
    for (const dir of cleanups.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function contextFor(): ExecutionContext {
    const dir = mkdtempSync(join(tmpdir(), 'mia-grill-'));
    cleanups.push(dir);
    const ctx = createExecutionContext(dir);
    ctx.config = { ...ctx.config, projectsDir: join(dir, '.mia-state', 'projects') };
    return { ...ctx, slug: 'demo' };
  }

  async function grill(ctx: ExecutionContext, args: string[]) {
    const definition = getSkill('grill');
    if (!definition) throw new Error('grill definition not found');
    return executeSkillDefinition(definition, args, ctx);
  }

  it('opens a session with a numbered design tree', async () => {
    const ctx = contextFor();
    const result = await grill(ctx, ['start', 'add', 'login']);

    expect(result.ok).toBe(true);
    expect(result.output).toContain('add login');
    expect(result.output).toMatch(/1\./);
    expect(result.output).toContain('mia grill answer');

    const session = await loadGrillSession(ctx);
    expect(session?.objective).toBe('add login');
    expect(session?.questions.length).toBeGreaterThanOrEqual(4);
  });

  it('records answers one at a time and re-surfaces the next unresolved question', async () => {
    const ctx = contextFor();
    await grill(ctx, ['start', 'add', 'login']);

    const first = await grill(ctx, ['answer', 'We', 'are', 'solving', 'SSO', 'access']);
    expect(first.ok).toBe(true);
    expect(first.output).toContain('We are solving SSO access');

    const session = await loadGrillSession(ctx);
    expect(session?.questions[0]?.answer).toContain('We are solving SSO access');
  });

  it('blocks plan-style progress until every design question is resolved', async () => {
    const ctx = contextFor();
    await grill(ctx, ['start', 'add', 'login']);

    const status = await grill(ctx, ['status']);
    expect(status.ok).toBe(true);
    expect(status.output).toContain('unresolved');

    const decisions = await listGrillDecisions(ctx);
    expect(decisions.some((d) => !d.resolved)).toBe(true);
  });

  it('reports a complete session once all questions are answered', async () => {
    const ctx = contextFor();
    await grill(ctx, ['start', 'add', 'login']);
    const session = await loadGrillSession(ctx);
    const count = session?.questions.length ?? 0;

    for (let i = 0; i < count; i++) {
      await grill(ctx, ['answer', `decision-${i}`]);
    }

    const after = await loadGrillSession(ctx);
    expect(after?.questions.every((q) => q.resolved)).toBe(true);
    expect(after?.questions).toHaveLength(count);
  });
});
