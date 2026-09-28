import { describe, expect, it } from 'bun:test';
import {
  VerificationContractError,
  resolveVerificationChecks,
} from '../verification/suite.js';
import { validateSkillDefinition } from './executor.js';
import type { SkillDefinition } from './types.js';

const definition: SkillDefinition = {
  manifest: {
    name: 'example',
    version: '1.0.0',
    description: 'Example skill',
    allowedTools: [],
    sideEffects: 'none',
    verification: ['tests'],
    phase: 'execute',
    invocation: 'model',
  },
  executor: { execute: async () => ({ ok: true, status: 'success' }) },
};

describe('skill contract', () => {
  it('accepts a complete manifest', () => {
    expect(() => validateSkillDefinition(definition)).not.toThrow();
  });

  it('rejects malformed versions', () => {
    const invalid = {
      ...definition,
      manifest: { ...definition.manifest, version: 'v1' },
    };

    expect(() => validateSkillDefinition(invalid)).toThrow(/semantic version/);
  });

  it('rejects duplicate verification names', () => {
    const invalid = {
      ...definition,
      manifest: { ...definition.manifest, verification: ['tests', 'tests'] },
    };

    expect(() => validateSkillDefinition(invalid)).toThrow(/duplicate verification/);
  });

  it('rejects empty tool names', () => {
    const invalid = {
      ...definition,
      manifest: { ...definition.manifest, allowedTools: [''] },
    };

    expect(() => validateSkillDefinition(invalid)).toThrow(/empty allowedTools/);
  });

  it('rejects unsupported invocation metadata', () => {
    const invalid = {
      ...definition,
      manifest: { ...definition.manifest, invocation: 'automatic' as never },
    };
    expect(() => validateSkillDefinition(invalid)).toThrow(/unsupported invocation/);
  });
});

describe('verification resolution', () => {
  it('resolves named checks in declared order', () => {
    const checks = resolveVerificationChecks(['tests', 'typecheck']);
    expect(checks.map((check) => check.name)).toEqual(['tests', 'typecheck']);
  });

  it('rejects unknown verification checks', () => {
    expect(() => resolveVerificationChecks(['missing'])).toThrow(VerificationContractError);
    expect(() => resolveVerificationChecks(['missing'])).toThrow(/Unknown verification check/);
  });
});
