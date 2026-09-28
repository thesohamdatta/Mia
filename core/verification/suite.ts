import type { VerificationCheck } from './run-checks.js';

export const repositoryChecks: readonly VerificationCheck[] = [
  {
    name: 'typecheck',
    command: ['bun', 'run', 'typecheck'],
    description: 'TypeScript typecheck',
  },
  {
    name: 'lint',
    command: ['bun', 'run', 'lint:check'],
    description: 'Repository lint',
  },
  {
    name: 'unused-code',
    command: ['bun', 'run', 'knip'],
    description: 'Unused and unresolved code checks',
  },
  {
    name: 'tests',
    command: ['bun', 'test'],
    description: 'Repository test suite',
  },
  {
    name: 'build',
    command: ['bun', 'run', 'build'],
    description: 'Production build',
  },
];

export class VerificationContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerificationContractError';
  }
}

export function resolveVerificationChecks(
  names: readonly string[],
  catalog: readonly VerificationCheck[] = repositoryChecks
): readonly VerificationCheck[] {
  const checks = new Map(catalog.map((check) => [check.name, check]));
  const seen = new Set<string>();
  const resolved: VerificationCheck[] = [];

  for (const rawName of names) {
    const name = rawName.trim();

    if (!name) {
      throw new VerificationContractError('Verification name must not be empty');
    }

    if (seen.has(name)) {
      throw new VerificationContractError(`Duplicate verification check: ${name}`);
    }

    const check = checks.get(name);
    if (!check) {
      throw new VerificationContractError(`Unknown verification check: ${name}`);
    }

    seen.add(name);
    resolved.push(check);
  }

  return resolved;
}
