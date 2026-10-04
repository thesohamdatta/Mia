import { describe, expect, it } from 'bun:test';
import { createExecutionContext } from '../context.js';
import { getSkill } from '../skills/index.js';

describe('execution contract', () => {
  it('requires an explicit active skill manifest at the execution boundary', () => {
    const ctx = createExecutionContext();
    expect(ctx.skill).toBeUndefined();
    const definition = getSkill('plan');

    if (!definition) throw new Error('plan skill is not registered');

    const executionContext = {
      ...ctx,
      skill: definition.manifest,
    };

    expect(executionContext.skill.name).toBe('plan');
    expect(executionContext.skill.invocation).toBe('both');
    expect(ctx.skill).toBeUndefined();
  });
});
