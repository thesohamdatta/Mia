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
