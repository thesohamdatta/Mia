import { describe, expect, it } from 'bun:test';
import { validateSkillDefinition } from './executor.js';
import type { SkillDefinition } from './types.js';

const definition: SkillDefinition = {
  manifest: {
    name: 'example',
    version: '1.0.0',
    description: 'Example skill',
    allowedTools: [],
    sideEffects: 'none',
    verification: [],
    phase: 'execute',
    invocation: 'model',
  },
  executor: { execute: async () => ({ ok: true, status: 'success' }) },
};

describe('skill contract', () => {
  it('accepts supported invocation metadata', () => {
    expect(() => validateSkillDefinition(definition)).not.toThrow();
  });

  it('rejects unsupported invocation metadata', () => {
    const invalid = {
      ...definition,
      manifest: { ...definition.manifest, invocation: 'automatic' as never },
    };
    expect(() => validateSkillDefinition(invalid)).toThrow(/unsupported invocation/);
  });
});
