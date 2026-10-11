import { computeFactoryMetrics } from '../../factory/metrics.js';
import { assessAgentReadiness } from '../../factory/readiness.js';
import { FACTORY_LOOPS, FACTORY_PHASES, FACTORY_ROLES } from '../../factory/roles.js';
import { FACTORY_MODEL_TIERS, type TaskProfile, routeModel } from '../../factory/routing.js';
import type { ExecutionContext, SkillExecutor, SkillResult } from '../types.js';

const USAGE = [
  'Usage: mia factory <command>',
  '',
  'Commands:',
  '  readiness [root]   Assess the eight agent-readiness areas (read-only).',
  '  metrics [root]     Report factory outcome metrics from local state (read-only).',
  '  route [flags]      Route a task profile to a model tier.',
  '  map                Show the factory phases, loops, and roles.',
  '  help               Show this help.',
].join('\n');

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseProfile(args: readonly string[]): TaskProfile {
  const complexity = option(args, '--complexity');
  const risk = option(args, '--risk');
  return {
    phase: option(args, '--phase') ?? 'execute',
    complexity: complexity === 'low' || complexity === 'high' ? complexity : 'medium',
    risk: risk === 'low' || risk === 'high' ? risk : 'medium',
    requiresReasoning: args.includes('--reasoning'),
  };
}

function formatReadiness(root: string): SkillResult {
  const report = assessAgentReadiness(root);
  const lines = [
    'MIA factory readiness',
    '',
    `Root: ${report.root}`,
    `Ready: ${report.readyCount}/8 (partial ${report.partialCount}, missing ${report.missingCount})`,
    '',
  ];

  for (const area of report.areas) {
    lines.push(`[${area.status.toUpperCase()}] ${area.label}`);
    for (const probe of area.probes) {
      lines.push(`  ${probe.passed ? 'PASS' : 'FAIL'} ${probe.name} — ${probe.evidence}`);
    }
    if (area.recommendation) {
      lines.push(`  Next: ${area.recommendation}`);
    }
  }

  return { ok: true, status: 'success', output: lines.join('\n') };
}

function formatMetrics(ctx: ExecutionContext): SkillResult {
  const metrics = computeFactoryMetrics({ signals: [], works: [], costs: [], shelfLife: [] });
  const formatDuration = (ms: number | null) =>
    ms === null ? 'no data' : `${Math.round(ms / 3_600_000)}h (median)`;
  const formatUsd = (value: number | null) => (value === null ? 'no data' : `$${value}`);

  return {
    ok: true,
    status: 'success',
    output: [
      'MIA factory metrics',
      '',
      `Signal to production: ${formatDuration(metrics.signalToProduction.medianMs)}`,
      `Time to repair: ${formatDuration(metrics.timeToRepair.medianMs)}`,
      `Human interventions: ${metrics.humanInterventions.total}`,
      `Code shelf life: ${metrics.codeShelfLife.ratio === null ? 'no data' : `${Math.round(metrics.codeShelfLife.ratio * 100)}%`}`,
      `Cost per pull request: ${formatUsd(metrics.costPerPullRequest.medianUsd)}`,
      '',
      'These are delivery and quality outcomes, not token or line counts.',
      `No factory signals are recorded in local state for ${ctx.slug} yet; the measures stay empty until signals and shipped Work exist.`,
    ].join('\n'),
  };
}

function formatRoute(profile: TaskProfile): SkillResult {
  const decision = routeModel(profile);
  return {
    ok: true,
    status: 'success',
    output: [
      'MIA factory routing',
      '',
      `Profile: phase=${profile.phase} complexity=${profile.complexity} risk=${profile.risk} reasoning=${profile.requiresReasoning}`,
      `Tier: ${decision.tier}`,
      `Fallback: ${decision.fallbackTier}`,
      `Escalate on failure: ${decision.escalateOnFailure}`,
      `Rationale: ${decision.rationale}`,
    ].join('\n'),
  };
}

function formatMap(): SkillResult {
  return {
    ok: true,
    status: 'success',
    output: [
      'MIA factory map',
      '',
      `Phases: ${FACTORY_PHASES.join(' → ')}`,
      '',
      'Loops:',
      ...FACTORY_LOOPS.map(
        (loop) => `  ${loop.id} loop — runs ${loop.runsWhen}; improves ${loop.improves}`
      ),
      '',
      'Model tiers:',
      ...FACTORY_MODEL_TIERS.map((tier) => `  ${tier.tier} — ${tier.purpose}`),
      '',
      'Roles:',
      ...FACTORY_ROLES.map((role) => `  ${role.id} — ${role.authority} (${role.mode})`),
    ].join('\n'),
  };
}

export async function execute(args: string[], ctx: ExecutionContext): Promise<SkillResult> {
  const command = args[0]?.toLowerCase() ?? 'help';

  switch (command) {
    case 'help':
      return { ok: true, status: 'success', output: USAGE };
    case 'readiness':
      return formatReadiness(args[1] ?? ctx.cwd);
    case 'metrics':
      return formatMetrics(ctx);
    case 'route':
      return formatRoute(parseProfile(args));
    case 'map':
      return formatMap();
    default:
      return { ok: false, status: 'blocked', error: `${USAGE}\n\nUnknown command: ${command}` };
  }
}

export const executor: SkillExecutor = { execute };
