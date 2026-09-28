import { describe, expect, it } from 'bun:test';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import type { SkillDefinition } from '../skills/types.js';

function skill(allowedTools: readonly string[], execute: () => Promise<{ ok: true }>): SkillDefinition {
  return {
    manifest: {
      name: 'capability-probe',
      version: '1.0.0',
      description: 'Probe tool capability admission',
      allowedTools,
      sideEffects: 'none',
      verification: [],
      phase: 'execute',
    },
    executor: {
      execute,
    },
  };
}

describe('Skill capability admission', () => {
  it('allows execution when every declared tool is granted', async () => {
    const ctx = createExecutionContext();
    ctx.grantedTools = ['filesystem.read', 'git.read'];
    let executed = false;

    const result = await executeSkillDefinition(
      skill(['filesystem.read', 'git.read'], async () => {
        executed = true;
        return { ok: true };
      }),
      [],
      ctx
    );

    expect(result.ok).toBe(true);
    expect(executed).toBe(true);
  });

  it('blocks execution when a declared tool is not granted', async () => {
    const ctx = createExecutionContext();
    ctx.grantedTools = ['filesystem.read'];
    let executed = false;

    const result = await executeSkillDefinition(
      skill(['filesystem.read', 'git.write'], async () => {
        executed = true;
        return { ok: true };
      }),
      [],
      ctx
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain('git.write');
    expect(executed).toBe(false);
  });

  it('treats an omitted grant set as no granted tools', async () => {
    const ctx = createExecutionContext();
    ctx.grantedTools = [];
    let executed = false;

    const result = await executeSkillDefinition(
      skill(['network.fetch'], async () => {
        executed = true;
        return { ok: true };
      }),
      [],
      ctx
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain('network.fetch');
    expect(executed).toBe(false);
  });
});
