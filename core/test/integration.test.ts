import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { getSkillExecutor, listSkills } from '../skills/index.js';
import { executeWithMiddlewares } from '../skills/preamble.js';
import { createUnifiedStore } from '../state/unified-store.js';

describe('Integration: CLI -> Skill -> Store', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'mia-test-'));
    process.chdir(testDir);

    // Initialize git repo for slug detection
    const { execSync } = require('node:child_process');
    execSync('git init', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: testDir, stdio: 'ignore' });
    execSync('git commit --allow-empty -m "initial"', { cwd: testDir, stdio: 'ignore' });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should list all registered skills', () => {
    const skills = listSkills();
    expect(skills.length).toBeGreaterThanOrEqual(10);
    expect(skills).toContain('grill');
    expect(skills).toContain('plan');
    expect(skills).toContain('spec');
    expect(skills).toContain('ship');
    expect(skills).toContain('health');
    expect(skills).toContain('learn');
    expect(skills).toContain('retro');
    expect(skills).toContain('memory');
    expect(skills).toContain('checkpoint');
    expect(skills).toContain('review');
    expect(skills).toContain('vc');
  });

  it('should execute vc skill through CLI path', async () => {
    const ctx = createExecutionContext();
    const executor = getSkillExecutor('vc');

    expect(executor).toBeDefined();
    if (!executor) throw new Error('vc executor not found');

    const result = await executeWithMiddlewares(executor, ['help'], ctx, 'vc');

    expect(result.ok).toBe(true);
    expect(result.output).toContain('mia vc — professional version control');
    expect(result.output).toContain('Commands:');
  });

  it('should execute grill skill through CLI path', async () => {
    const ctx = createExecutionContext();
    const executor = getSkillExecutor('grill');

    expect(executor).toBeDefined();
    if (!executor) throw new Error('grill executor not found');

    const result = await executeWithMiddlewares(executor, [], ctx, 'grill');

    // Grill skill should execute without error (may output help or start interview)
    expect(result.ok).toBe(true);
  });

  it('should persist and query events via UnifiedStore', async () => {
    const store = createUnifiedStore();
    const projectsDir = join(testDir, '.mia', 'projects');
    const slug = 'test-project';

    // Append a learning
    await store.appendLearning(projectsDir, slug, { insight: 'Test learning', key: 'test-key' });

    // Append a timeline event
    await store.appendTimeline(projectsDir, slug, { skill: 'test', event: 'started' });

    // Query learnings
    const learnings = await store.listLearnings(projectsDir, slug, 10);
    expect(learnings.length).toBe(1);
    const learning = learnings[0]!;
    expect(learning.data).toEqual({ insight: 'Test learning', key: 'test-key' });
    expect(learning.type).toBe('learning');

    // Query timeline
    const timeline = await store.listTimeline(projectsDir, slug, 10);
    expect(timeline.length).toBe(1);
    const tlEvent = timeline[0]!;
    expect(tlEvent.data).toEqual({ skill: 'test', event: 'started' });
    expect(tlEvent.type).toBe('timeline');

    // Query with filter
    const filtered = await store.query(projectsDir, slug, 'learning', (e) => {
      const data = e.data as { key?: string };
      return data.key === 'test-key';
    });
    expect(filtered.length).toBe(1);
  });

  it('should execute skill and timeline events are recorded', async () => {
    const ctx = createExecutionContext();
    const projectsDir = ctx.config.projectsDir;
    const slug = ctx.slug;
    const unifiedStore = ctx.unifiedStore;

    const executor = getSkillExecutor('vc');
    expect(executor).toBeDefined();
    if (!executor) throw new Error('vc executor not found');

    const result = await executeWithMiddlewares(executor, ['help'], ctx, 'vc');

    expect(result.ok).toBe(true);

    // Check timeline was recorded
    const timeline = await unifiedStore.listTimeline(projectsDir, slug, 5);

    expect(timeline.length).toBeGreaterThan(0);
    const lastEvent = timeline[0];
    expect(lastEvent).toBeDefined();
    if (!lastEvent) throw new Error('No timeline event');

    const eventData = lastEvent.data as { skill?: string; event?: string; outcome?: string };
    expect(eventData.skill).toBe('vc');
    expect(eventData.event).toBe('completed');
    expect(eventData.outcome).toBe('success');
  });
});
