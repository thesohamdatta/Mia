import type { Work } from '../work/types.js';

/**
 * Factory outcome metrics. These measure delivery, maintenance, quality, and
 * spend rather than generated tokens or lines of code, which Goodhart's law
 * shows teams optimize without improving results.
 */

export type SignalKind = 'bug' | 'incident' | 'feedback' | 'request' | 'other';

export interface FactorySignal {
  id: string;
  /** The Work item the signal became, when one exists. */
  workId?: string;
  kind: SignalKind;
  observedAt: string;
}

export interface WorkCost {
  workId: string;
  modelCostUsd: number;
  humanInterventions: number;
}

export interface ShelfLifeObservation {
  workId: string;
  present: boolean;
}

export interface FactoryMetricsInput {
  signals: readonly FactorySignal[];
  works: readonly Work[];
  costs: readonly WorkCost[];
  shelfLife: readonly ShelfLifeObservation[];
}

export interface DurationSummary {
  count: number;
  medianMs: number | null;
}

export interface CostSummary {
  count: number;
  medianUsd: number | null;
  totalUsd: number;
}

export interface InterventionSummary {
  total: number;
  perShippedWork: number | null;
}

export interface ShelfLifeSummary {
  observed: number;
  present: number;
  ratio: number | null;
}

export interface FactoryMetrics {
  signalToProduction: DurationSummary;
  timeToRepair: DurationSummary;
  humanInterventions: InterventionSummary;
  codeShelfLife: ShelfLifeSummary;
  costPerPullRequest: CostSummary;
}

const REPAIR_KINDS: readonly SignalKind[] = ['bug', 'incident'];

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const lower = sorted[mid - 1] ?? sorted[mid] ?? 0;
    const upper = sorted[mid] ?? lower;
    return (lower + upper) / 2;
  }
  return sorted[mid] ?? null;
}

function elapsedMs(from: string, to: string): number | null {
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return end - start;
}

export function computeFactoryMetrics(input: FactoryMetricsInput): FactoryMetrics {
  const workById = new Map(input.works.map((work) => [work.id, work]));
  const shipped = input.works.filter((work) => work.state === 'shipped');

  const signalToProductionDurations: number[] = [];
  const repairDurations: number[] = [];

  for (const signal of input.signals) {
    const work = signal.workId ? workById.get(signal.workId) : undefined;
    if (!work || work.state !== 'shipped') continue;

    const duration = elapsedMs(signal.observedAt, work.updatedAt);
    if (duration === null) continue;

    signalToProductionDurations.push(duration);
    if (REPAIR_KINDS.includes(signal.kind)) {
      repairDurations.push(duration);
    }
  }

  // Each cost record describes one pull request, so the summaries use the
  // records directly; only the per-work intervention rate needs the shipped set.
  const totalInterventions = input.costs.reduce((sum, cost) => sum + cost.humanInterventions, 0);
  const costs = input.costs.map((cost) => cost.modelCostUsd);
  const present = input.shelfLife.filter((observation) => observation.present).length;

  return {
    signalToProduction: {
      count: signalToProductionDurations.length,
      medianMs: median(signalToProductionDurations),
    },
    timeToRepair: {
      count: repairDurations.length,
      medianMs: median(repairDurations),
    },
    humanInterventions: {
      total: totalInterventions,
      perShippedWork: shipped.length === 0 ? null : totalInterventions / shipped.length,
    },
    codeShelfLife: {
      observed: input.shelfLife.length,
      present,
      ratio: input.shelfLife.length === 0 ? null : present / input.shelfLife.length,
    },
    costPerPullRequest: {
      count: input.costs.length,
      medianUsd: median(costs),
      totalUsd: costs.reduce((sum, value) => sum + value, 0),
    },
  };
}
