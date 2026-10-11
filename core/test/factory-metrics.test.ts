import { describe, expect, it } from 'bun:test';
import { computeFactoryMetrics } from '../factory/metrics.js';
import type { Work, WorkState } from '../work/types.js';

function work(id: string, state: WorkState, createdAt: string, updatedAt: string): Work {
  return {
    id,
    objective: `objective for ${id}`,
    state,
    successCriteria: [],
    capabilities: [],
    dependencies: [],
    requiresHumanApproval: false,
    createdAt,
    updatedAt,
  };
}

const DAY = 24 * 60 * 60 * 1000;

describe('factory metrics', () => {
  it('measures signal-to-production time from observed signal to shipped work', () => {
    const metrics = computeFactoryMetrics({
      signals: [
        { id: 's1', workId: 'w1', kind: 'bug', observedAt: '2026-01-01T00:00:00.000Z' },
        { id: 's2', workId: 'w2', kind: 'feedback', observedAt: '2026-01-01T00:00:00.000Z' },
      ],
      works: [
        work('w1', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-03T00:00:00.000Z'),
        work('w2', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-05T00:00:00.000Z'),
      ],
      costs: [],
      shelfLife: [],
    });

    expect(metrics.signalToProduction.count).toBe(2);
    expect(metrics.signalToProduction.medianMs).toBe(3 * DAY);
  });

  it('measures time-to-repair only for defects and incidents', () => {
    const metrics = computeFactoryMetrics({
      signals: [
        { id: 's1', workId: 'w1', kind: 'bug', observedAt: '2026-01-01T00:00:00.000Z' },
        { id: 's2', workId: 'w2', kind: 'request', observedAt: '2026-01-01T00:00:00.000Z' },
      ],
      works: [
        work('w1', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
        work('w2', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-09T00:00:00.000Z'),
      ],
      costs: [],
      shelfLife: [],
    });

    expect(metrics.timeToRepair.count).toBe(1);
    expect(metrics.timeToRepair.medianMs).toBe(DAY);
  });

  it('reports human interventions per shipped work item', () => {
    const metrics = computeFactoryMetrics({
      signals: [],
      works: [
        work('w1', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
        work('w2', 'shipped', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
      ],
      costs: [
        { workId: 'w1', modelCostUsd: 4, humanInterventions: 2 },
        { workId: 'w2', modelCostUsd: 6, humanInterventions: 0 },
      ],
      shelfLife: [],
    });

    expect(metrics.humanInterventions.total).toBe(2);
    expect(metrics.humanInterventions.perShippedWork).toBe(1);
  });

  it('measures code shelf life as the share of shipped work still present', () => {
    const metrics = computeFactoryMetrics({
      signals: [],
      works: [],
      costs: [],
      shelfLife: [
        { workId: 'w1', present: true },
        { workId: 'w2', present: false },
        { workId: 'w3', present: true },
        { workId: 'w4', present: true },
      ],
    });

    expect(metrics.codeShelfLife.observed).toBe(4);
    expect(metrics.codeShelfLife.present).toBe(3);
    expect(metrics.codeShelfLife.ratio).toBeCloseTo(0.75);
  });

  it('reports cost per pull request without inventing a token metric', () => {
    const metrics = computeFactoryMetrics({
      signals: [],
      works: [],
      costs: [
        { workId: 'w1', modelCostUsd: 2, humanInterventions: 0 },
        { workId: 'w2', modelCostUsd: 8, humanInterventions: 0 },
      ],
      shelfLife: [],
    });

    expect(metrics.costPerPullRequest.count).toBe(2);
    expect(metrics.costPerPullRequest.medianUsd).toBe(5);
    expect(metrics.costPerPullRequest.totalUsd).toBe(10);
    expect(Object.keys(metrics)).not.toContain('tokens');
  });

  it('returns empty summaries when no signals or works are recorded', () => {
    const metrics = computeFactoryMetrics({ signals: [], works: [], costs: [], shelfLife: [] });
    expect(metrics.signalToProduction).toEqual({ count: 0, medianMs: null });
    expect(metrics.timeToRepair).toEqual({ count: 0, medianMs: null });
    expect(metrics.costPerPullRequest).toEqual({ count: 0, medianUsd: null, totalUsd: 0 });
    expect(metrics.humanInterventions).toEqual({ total: 0, perShippedWork: null });
    expect(metrics.codeShelfLife).toEqual({ observed: 0, present: 0, ratio: null });
  });

  it('ignores signals whose work has not reached a shipped state', () => {
    const metrics = computeFactoryMetrics({
      signals: [{ id: 's1', workId: 'w1', kind: 'bug', observedAt: '2026-01-01T00:00:00.000Z' }],
      works: [work('w1', 'in_progress', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z')],
      costs: [],
      shelfLife: [],
    });

    expect(metrics.signalToProduction.count).toBe(0);
  });
});
