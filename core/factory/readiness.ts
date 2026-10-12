import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Agent readiness: the deterministic feedback the surrounding engineering system
 * gives an agent. This mirrors the eight readiness areas used to decide how much
 * work can be handed to agents before the codebase degrades.
 */
export const READINESS_AREAS = [
  'validation',
  'build-systems',
  'feedback-loops',
  'documentation',
  'reproducible-environments',
  'modular-code',
  'observability',
  'security-scanning',
] as const;

export type ReadinessAreaId = (typeof READINESS_AREAS)[number];
export type ReadinessStatus = 'ready' | 'partial' | 'missing';

export interface ReadinessProbe {
  name: string;
  passed: boolean;
  evidence: string;
}

export interface ReadinessArea {
  id: ReadinessAreaId;
  label: string;
  status: ReadinessStatus;
  probes: ReadinessProbe[];
  recommendation?: string;
}

export interface ReadinessReport {
  root: string;
  areas: ReadinessArea[];
  score: number;
  readyCount: number;
  partialCount: number;
  missingCount: number;
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'bin',
  'coverage',
  'vendor',
  '__pycache__',
]);

function full(root: string, relative: string): string {
  return join(root, relative);
}

function exists(root: string, relative: string): boolean {
  return existsSync(full(root, relative));
}

function readText(root: string, relative: string): string | null {
  try {
    return readFileSync(full(root, relative), 'utf8');
  } catch {
    return null;
  }
}

function listDir(root: string, relative: string): string[] {
  try {
    return readdirSync(full(root, relative)).sort();
  } catch {
    return [];
  }
}

function isDirectory(root: string, relative: string): boolean {
  try {
    return statSync(full(root, relative)).isDirectory();
  } catch {
    return false;
  }
}

function packageScripts(root: string): Record<string, string> {
  const raw = readText(root, 'package.json');
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
}

function hasScript(scripts: Record<string, string>, ...names: string[]): boolean {
  return names.some((name) => typeof scripts[name] === 'string' && scripts[name].trim() !== '');
}

function workflowText(root: string): string {
  const dir = '.github/workflows';
  return listDir(root, dir)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .map((name) => readText(root, `${dir}/${name}`) ?? '')
    .join('\n');
}

function anyFile(root: string, candidates: string[]): string | null {
  return candidates.find((candidate) => exists(root, candidate)) ?? null;
}

/** Bounded directory walk that never descends into dependency or build output trees. */
function walk(root: string, maxDepth: number): { dirs: string[]; files: string[] } {
  const dirs: string[] = [];
  const files: string[] = [];

  const visit = (relative: string, depth: number): void => {
    for (const name of listDir(root, relative)) {
      if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
      const child = relative ? `${relative}/${name}` : name;
      if (isDirectory(root, child)) {
        dirs.push(child);
        if (depth < maxDepth) visit(child, depth + 1);
      } else {
        files.push(child);
      }
    }
  };

  visit('', 1);
  return { dirs, files };
}

interface AreaSpec {
  id: ReadinessAreaId;
  label: string;
  probes: (root: string) => ReadinessProbe[];
  readyAt: number;
  recommendation: string;
  classify?: (probes: ReadinessProbe[]) => ReadinessStatus;
}

const AREA_SPECS: readonly AreaSpec[] = [
  {
    id: 'validation',
    label: 'Validation',
    readyAt: 2,
    recommendation: 'Add a lint/format script and a type checker to package.json.',
    probes: (root) => {
      const scripts = packageScripts(root);
      const hasLint = hasScript(scripts, 'lint', 'lint:check', 'format', 'format:check');
      const config = anyFile(root, [
        'biome.json',
        '.eslintrc',
        '.eslintrc.json',
        '.eslintrc.js',
        '.prettierrc',
        'ruff.toml',
        '.golangci.yml',
        'tsconfig.json',
      ]);
      return [
        {
          name: 'lint or format command',
          passed: hasLint || config !== null,
          evidence: hasLint
            ? 'package.json declares a lint/format script'
            : config
              ? `linter/formatter config present: ${config}`
              : 'no lint/format script or config found',
        },
        {
          name: 'type checking',
          passed: hasScript(scripts, 'typecheck', 'types', 'check'),
          evidence: hasScript(scripts, 'typecheck', 'types', 'check')
            ? 'package.json declares a typecheck script'
            : 'no typecheck script found in package.json',
        },
      ];
    },
  },
  {
    id: 'build-systems',
    label: 'Build systems',
    readyAt: 2,
    recommendation: 'Document a build command and run it in CI.',
    probes: (root) => {
      const scripts = packageScripts(root);
      const hasBuild = hasScript(scripts, 'build', 'compile');
      const ci = workflowText(root);
      const ciBuilds = /\b(bun run|npm run|yarn|pnpm|make|cargo|go build)\b[^\n]*\bbuild\b/i.test(
        ci
      );
      return [
        {
          name: 'documented build command',
          passed: hasBuild,
          evidence: hasBuild
            ? 'package.json declares a build script'
            : 'no build script found in package.json',
        },
        {
          name: 'CI build step',
          passed: ciBuilds,
          evidence: ciBuilds
            ? 'CI workflow runs a build command'
            : 'no build step found in .github/workflows',
        },
      ];
    },
  },
  {
    id: 'feedback-loops',
    label: 'Feedback loops',
    readyAt: 2,
    recommendation: 'Add a fast test command and at least one focused test.',
    probes: (root) => {
      const scripts = packageScripts(root);
      const hasTests = hasScript(scripts, 'test');
      const { files } = walk(root, 4);
      const testFile = files.find((file) =>
        /(\.(test|spec)\.[cm]?[jt]sx?$)|(_test\.go$)|((^|\/)test_.*\.py$)/.test(file)
      );
      return [
        {
          name: 'test command',
          passed: hasTests,
          evidence: hasTests
            ? 'package.json declares a test script'
            : 'no test script found in package.json',
        },
        {
          name: 'test files present',
          passed: testFile !== undefined,
          evidence: testFile ? `test file found: ${testFile}` : 'no test or spec files found',
        },
      ];
    },
  },
  {
    id: 'documentation',
    label: 'Documentation',
    readyAt: 2,
    recommendation: 'Add a README, agent instructions, and a verification/evidence page.',
    probes: (root) => {
      const readme = anyFile(root, ['README.md', 'README.rst', 'README']);
      const agents = anyFile(root, ['AGENTS.md', 'CLAUDE.md', '.cursorrules']);
      const evidence = anyFile(root, [
        'docs/reference/evidence.md',
        'CONTRIBUTING.md',
        'docs/README.md',
      ]);
      return [
        {
          name: 'project README',
          passed: readme !== null,
          evidence: readme ? `README present: ${readme}` : 'no README found',
        },
        {
          name: 'agent instructions',
          passed: agents !== null,
          evidence: agents
            ? `agent instructions present: ${agents}`
            : 'no AGENTS.md or alias found',
        },
        {
          name: 'verification or contribution docs',
          passed: evidence !== null,
          evidence: evidence
            ? `documentation present: ${evidence}`
            : 'no evidence/contribution documentation found',
        },
      ];
    },
  },
  {
    id: 'reproducible-environments',
    label: 'Reproducible environments',
    readyAt: 2,
    recommendation:
      'Commit a lockfile, pin the runtime, and provide a reproducible dev environment.',
    probes: (root) => {
      const lock = anyFile(root, [
        'bun.lock',
        'bun.lockb',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'poetry.lock',
        'uv.lock',
        'Cargo.lock',
        'go.sum',
      ]);
      const raw = readText(root, 'package.json');
      let pinned = false;
      try {
        pinned =
          typeof (JSON.parse(raw ?? '') as { packageManager?: string }).packageManager === 'string';
      } catch {
        pinned = false;
      }
      const pinFile = anyFile(root, [
        '.nvmrc',
        '.tool-versions',
        '.python-version',
        '.node-version',
      ]);
      const container = anyFile(root, [
        'Dockerfile',
        'docker-compose.yml',
        'compose.yml',
        '.devcontainer/devcontainer.json',
        'flake.nix',
        'shell.nix',
      ]);
      return [
        {
          name: 'dependency lockfile',
          passed: lock !== null,
          evidence: lock ? `lockfile present: ${lock}` : 'no dependency lockfile found',
        },
        {
          name: 'pinned runtime',
          passed: pinned || pinFile !== null,
          evidence: pinned
            ? 'package.json declares packageManager'
            : pinFile
              ? `runtime version file present: ${pinFile}`
              : 'no pinned runtime (packageManager or version file) found',
        },
        {
          name: 'container or dev environment',
          passed: container !== null,
          evidence: container
            ? `reproducible environment present: ${container}`
            : 'no container or dev-environment definition found',
        },
      ];
    },
  },
  {
    id: 'modular-code',
    label: 'Modular code',
    readyAt: 2,
    recommendation: 'Separate the codebase into bounded modules and document ownership.',
    probes: (root) => {
      const { dirs } = walk(root, 2);
      const modules = dirs.filter((dir) => !dir.startsWith('docs') && !dir.startsWith('.github'));
      const ownership = anyFile(root, ['AGENTS.md', 'CONTEXT.md', 'docs/core/architecture.md']);
      return [
        {
          name: 'source module directories',
          passed: modules.length >= 3,
          evidence: `found ${modules.length} source module directory(ies)`,
        },
        {
          name: 'ownership or architecture entry point',
          passed: ownership !== null,
          evidence: ownership
            ? `ownership/architecture document present: ${ownership}`
            : 'no AGENTS.md, CONTEXT.md, or architecture doc found',
        },
      ];
    },
  },
  {
    id: 'observability',
    label: 'Observability',
    readyAt: 2,
    recommendation: 'Emit structured logs and expose a health or verification command.',
    probes: (root) => {
      const scripts = packageScripts(root);
      const health = hasScript(scripts, 'health', 'verify', 'verify:binary', 'doctor');
      const { files } = walk(root, 4);
      const sourceFiles = files.filter((file) =>
        /\.(ts|tsx|js|jsx|mjs|cjs|go|py|rs|rb)$/.test(file)
      );
      const instrumented = sourceFiles
        .slice(0, 300)
        .some((file) =>
          /\bconsole\.(log|error|warn|info)\b|\blogger\b|\bpino\b|\bwinston\b/.test(
            readText(root, file) ?? ''
          )
        );
      return [
        {
          name: 'logging or error signal in source',
          passed: instrumented,
          evidence: instrumented
            ? 'source emits log or error signals'
            : 'no log or error signal found in source files',
        },
        {
          name: 'health or verification command',
          passed: health,
          evidence: health
            ? 'package.json declares a health/verify script'
            : 'no health or verify script found in package.json',
        },
      ];
    },
  },
  {
    id: 'security-scanning',
    label: 'Security scanning',
    readyAt: 2,
    recommendation: 'Add a security scan workflow and keep secrets out of version control.',
    classify: (probes) => {
      if (probes[0]?.passed) return 'ready';
      return probes.some((probe) => probe.passed) ? 'partial' : 'missing';
    },
    probes: (root) => {
      const workflows = listDir(root, '.github/workflows');
      const scanWorkflow = workflows.find((name) => /security|codeql|sast|scan|trivy/i.test(name));
      const scanConfig = anyFile(root, [
        '.snyk',
        'semgrep.yml',
        '.semgrep.yml',
        'gitleaks.toml',
        '.gitleaks.toml',
        '.github/dependabot.yml',
      ]);
      const ignoresSecrets = /(^|\n)\s*\.env/.test(readText(root, '.gitignore') ?? '');
      return [
        {
          name: 'security scan configuration',
          passed: scanWorkflow !== undefined || scanConfig !== null,
          evidence: scanWorkflow
            ? `security workflow present: ${scanWorkflow}`
            : scanConfig
              ? `security scan config present: ${scanConfig}`
              : 'no security scan workflow or config found',
        },
        {
          name: 'secret files kept out of version control',
          passed: ignoresSecrets,
          evidence: ignoresSecrets
            ? '.gitignore excludes .env files'
            : '.gitignore does not exclude .env files',
        },
      ];
    },
  },
];

function classify(spec: AreaSpec, probes: ReadinessProbe[]): ReadinessStatus {
  if (spec.classify) return spec.classify(probes);
  const passed = probes.filter((probe) => probe.passed).length;
  if (passed >= spec.readyAt) return 'ready';
  if (passed === 0) return 'missing';
  return 'partial';
}

export function assessAgentReadiness(root: string): ReadinessReport {
  const areas: ReadinessArea[] = AREA_SPECS.map((spec) => {
    const probes = spec.probes(root);
    const status = classify(spec, probes);
    return {
      id: spec.id,
      label: spec.label,
      status,
      probes,
      recommendation: status === 'ready' ? undefined : spec.recommendation,
    };
  });

  const readyCount = areas.filter((area) => area.status === 'ready').length;
  const partialCount = areas.filter((area) => area.status === 'partial').length;
  const missingCount = areas.filter((area) => area.status === 'missing').length;

  return {
    root,
    areas,
    score: areas.length === 0 ? 0 : readyCount / areas.length,
    readyCount,
    partialCount,
    missingCount,
  };
}
