import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createUnifiedStore } from '../state/unified-store.js';
import {
  createMaintenanceWork,
  createOperationalObservation,
  listOperationalObservations,
  saveOperationalObservation,
} from '../work/maintenance.js';
import { shipWork } from '../work/ship.js';
import { transitionWork } from '../work/types.js';

describe('maintenance seam', () => {
  it('records an operational observation and recovers it from the shared timeline', async () => {
    const tempDir = mkdtempSync(join('/tmp', 'mia-maintenance-'));
    const store = createUnifiedStore();

    try {
      const observation = createOperationalObservation({
        severity: 'warning',
        summary: 'Release smoke check reported an intermittent timeout',
        workId: 'work_release',
      });

      await saveOperationalObservation(store, tempDir, 'project', observation);

      const observations = await listOperationalObservations(store, tempDir, 'project');

      expect(observations).toEqual([observation]);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('turns an observation into ordinary Work that returns to maintained after verification and ship', () => {
    const observation = createOperationalObservation({
      severity: 'incident',
      summary: 'Production endpoint intermittently times out',
      workId: 'work_release',
    });

    let work = createMaintenanceWork({
      objective: 'Fix the endpoint timeout',
      observation,
      sourceWorkId: 'work_release',
      successCriteria: ['Endpoint no longer times out in the reproduction'],
      capabilities: ['software'],
    });

    expect(work.state).toBe('draft');
    expect(work.maintenance).toEqual({
      observationId: observation.id,
      sourceWorkId: 'work_release',
    });

    work = transitionWork(work, 'specified');
    work = transitionWork(work, 'planned');
    work = startWork(work);
    work = transitionWork(work, 'verification');
    work = recordVerification(work, {
      runId: 'maintenance-run',
      passed: true,
      records: [
        {
          runId: 'maintenance-run',
          name: 'tests',
          status: 'passed',
        },
      ],
    });
    work = completeVerification(work, { passed: true });
    work = completeReview(work, { passed: true });
    work = shipWork(work);
    work = transitionWork(work, 'maintained');

    expect(work.state).toBe('maintained');
    expect(work.maintenance?.observationId).toBe(observation.id);
  });
});

import {
  completeReview,
  completeVerification,
  recordVerification,
  startWork,
} from '../work/lifecycle.js';

