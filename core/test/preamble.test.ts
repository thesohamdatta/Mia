import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeWithMiddlewares } from '../skills/preamble.js';
import type { ExecutionContext } from '../skills/types.js';
import type { UnifiedStore } from '../state/unified-store.js';

describe('skill execution lifecycle', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'mia-preamble-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(testDir, { recursive: true, force: true });
  });

  function createContext(store: UnifiedStore): ExecutionContext {
    return {
      cwd: testDir,
      slug: 'test-project',
      run: {
        id: randomUUID(),
        skill: 'test',
        startedAt: new Date().toISOString(),
        status: 'running',
      },
      unifiedStore: store,
      config: {
        miaDir: join(testDir, '.mia'),
        skillsDir: join(testDir, '.mia', 'skills'),
        projectsDir: join(testDir, '.mia', 'projects'),
        memoryFile: join(testDir, '.mia', 'memory.md'),
        sessionsDir: join(testDir, '.mia', 'sessions'),
      },
    };
  }

  function createStore(): UnifiedStore & {
    timeline: Array<{ event: string; outcome?: string }>;
  } {
    const timeline: Array<{ event: string; outcome?: string }> = [];
    const store: UnifiedStore = {
      append: async () => {},
      query: async () => [],
      listLearnings: async () => [],
      listTimeline: async () => [],
      appendLearning: async () => {},
      appendCheckpoint: async () => {},
      listEvidence: async () => [],
      appendEvidence: async () => {},
      appendTimeline: async (_projectsDir, _slug, data) => {
        const event = data as { event?: string; outcome?: string };
        timeline.push({ event: event.event ?? 'unknown', outcome: event.outcome });
      },
    };
    return Object.assign(store, { timeline });
  }

  it('records a failed timeline event when a skill returns a failure', async () => {
    const store = createStore();
    const ctx = createContext(store);

    const result = await executeWithMiddlewares(
      {
        execute: async () => ({ ok: false, error: 'verification failed' }),
      },
      [],
      ctx,
      'review',
      []
    );

    expect(result).toEqual({ ok: false, error: 'verification failed' });
    expect(store.timeline).toEqual([{ event: 'failed', outcome: 'failed' }]);
  });

  it('records failure instead of losing lifecycle state when a skill throws', async () => {
    const store = createStore();
    const ctx = createContext(store);

    const result = await executeWithMiddlewares(
      {
        execute: async () => {
          throw new Error('boom');
        },
      },
      [],
      ctx,
      'ship',
      []
    );

    expect(result).toEqual({ ok: false, error: 'boom' });
    expect(store.timeline).toEqual([{ event: 'failed', outcome: 'failed' }]);
  });

  it('keeps skill execution alive when timeline persistence fails', async () => {
    const store: UnifiedStore = {
      append: async () => {},
      query: async () => [],
      listLearnings: async () => [],
      listTimeline: async () => [],
      appendLearning: async () => {},
      appendCheckpoint: async () => {},
      listEvidence: async () => [],
      appendEvidence: async () => {},
      appendTimeline: async () => {
        throw new Error('timeline unavailable');
      },
    };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = createContext(store);

    const result = await executeWithMiddlewares(
      { execute: async () => ({ ok: true, output: 'done' }) },
      [],
      ctx,
      'health'
    );

    expect(result).toEqual({ ok: true, output: 'done' });
    expect(warn).toHaveBeenCalledWith('⚠️  Could not record timeline start: timeline unavailable');
    expect(warn).toHaveBeenCalledWith(
      '⚠️  Could not record timeline completion: timeline unavailable'
    );
  });
});
