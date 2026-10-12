import { describe, expect, it } from 'bun:test';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill, listSkills } from '../skills/index.js';

const definition = getSkill('factory');

if (!definition) {
  throw new Error('factory skill is not registered');
}

describe('factory skill', () => {
  it('is registered with read-only side effects', () => {
    expect(listSkills()).toContain('factory');
    expect(definition.manifest.sideEffects).toBe('none');
    expect(definition.manifest.phase).toBe('verify');
    expect(definition.manifest.allowedTools).toEqual([]);
  });

  it('exposes the factory phases through help', async () => {
    const result = await executeSkillDefinition(definition, ['help'], createExecutionContext());
    expect(result.ok).toBe(true);
    expect(result.output).toContain('readiness');
    expect(result.output).toContain('metrics');
    expect(result.output).toContain('route');
  });

  it('assesses readiness against the current repository without writing state', async () => {
    const result = await executeSkillDefinition(
      definition,
      ['readiness'],
      createExecutionContext()
    );
    expect(result.ok).toBe(true);
    expect(result.output).toContain('factory readiness');
    expect(result.output).toContain('Validation');
    expect(result.output).toContain('Security scanning');
  });

  it('reports the outcome metrics instead of token counts', async () => {
    const result = await executeSkillDefinition(definition, ['metrics'], createExecutionContext());
    expect(result.ok).toBe(true);
    expect(result.output).toContain('Signal to production');
    expect(result.output).toContain('Cost per pull request');
    expect(result.output).not.toContain('tokens generated');
  });

  it('routes a task profile with an explicit rationale', async () => {
    const result = await executeSkillDefinition(
      definition,
      ['route', '--complexity', 'high', '--risk', 'medium', '--reasoning'],
      createExecutionContext()
    );
    expect(result.ok).toBe(true);
    expect(result.output).toContain('frontier');
    expect(result.output).toContain('Rationale');
  });

  it('blocks an unknown factory subcommand with usage', async () => {
    const result = await executeSkillDefinition(definition, ['nonsense'], createExecutionContext());
    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain('Usage');
  });
});
