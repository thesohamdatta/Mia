import type { StoredEvent, UnifiedStore } from '../state/unified-store.js';
import { type Work, createWork } from './types.js';

export type ObservationSeverity = 'info' | 'warning' | 'incident';

export interface OperationalObservation {
  id: string;
  severity: ObservationSeverity;
  summary: string;
  workId?: string;
  observedAt: string;
}

interface ObservationEvent {
  kind: 'operational-observation';
  observation: OperationalObservation;
}

export interface CreateMaintenanceWorkInput {
  objective: string;
  observation: OperationalObservation;
  sourceWorkId?: string;
  successCriteria?: string[];
  capabilities?: string[];
  dependencies?: string[];
  requiresHumanApproval?: boolean;
}

function makeObservationId(): string {
  return `observation_${crypto.randomUUID()}`;
}

export function createOperationalObservation(input: {
  severity: ObservationSeverity;
  summary: string;
  workId?: string;
  observedAt?: string;
}): OperationalObservation {
  const summary = input.summary.trim();
  if (!summary) {
    throw new Error('Operational observation summary is required');
  }

  return {
    id: makeObservationId(),
    severity: input.severity,
    summary,
    ...(input.workId ? { workId: input.workId } : {}),
    observedAt: input.observedAt ?? new Date().toISOString(),
  };
}

export async function saveOperationalObservation(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  observation: OperationalObservation
): Promise<void> {
  const event: ObservationEvent = {
    kind: 'operational-observation',
    observation: structuredClone(observation),
  };

  await store.appendTimeline(projectsDir, slug, event);
}

export async function listOperationalObservations(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  limit = 20
): Promise<OperationalObservation[]> {
  const events = await store.query(
    projectsDir,
    slug,
    'timeline',
    (event: StoredEvent) => {
      const data = event.data as Partial<ObservationEvent>;
      return data.kind === 'operational-observation' && data.observation !== undefined;
    },
    limit
  );

  return events.map((event) => {
    const data = event.data as ObservationEvent;
    return structuredClone(data.observation);
  });
}

export function createMaintenanceWork(input: CreateMaintenanceWorkInput): Work {
  const work = createWork({
    objective: input.objective,
    successCriteria: input.successCriteria,
    capabilities: input.capabilities,
    dependencies: input.dependencies,
    requiresHumanApproval: input.requiresHumanApproval,
  });

  return {
    ...work,
    maintenance: {
      observationId: input.observation.id,
      ...(input.sourceWorkId ? { sourceWorkId: input.sourceWorkId } : {}),
    },
  };
}
