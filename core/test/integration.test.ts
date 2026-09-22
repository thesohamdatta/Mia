import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill, getSkillExecutor, listSkillDefinitions, listSkills } from '../skills/index.js';
import { executeWithMiddlewares } from '../skills/preamble.js';
import { createUnifiedStore } from '../state/unified-store.js';

describe('Integration: CLI -> Skill -> Store', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'mia-test-'));
    process.chdir(testDir);

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

  it('should execute vc skill through validated CLI path', async () => {
    const ctx = createExecutionContext();
    const definition = getSkill('vc');

    expect(definition).toBeDefined();
    if (!definition) throw new Error('vc definition not found');

    const result = await executeSkillDefinition(definition, ['help'], ctx);

    expect(result.ok).toBe(true);
    expect(result.output).toContain('mia vc — professional version control');
    expect(result.output).toContain('Commands:');
  });

  it('should expose executable skill definitions with explicit safety contracts', () => {
    const definitions = listSkillDefinitions();
    expect(definitions).toHaveLength(11);
    expect(getSkill('vc')?.manifest.sideEffects).toBe('git-write');
    expect(getSkill('health')?.manifest.verification).toEqual([
      'typecheck',
      'lint',
      'unused-code',
      'tests',
      'build',
    ]);
  });

  it('should create a unique run identity for each execution', () => {
    const first = createExecutionContext().run.id;
    const second = createExecutionContext().run.id;
    expect(first).not.toBe(second);
  });

  it('should create real plan and spec artifacts', async () => {
    const ctx = createExecutionContext();

    const plan = await getSkillExecutor('plan')?.execute(['create', 'Improve', 'MIA'], ctx);
    expect(plan?.ok).toBe(true);

    const spec = await getSkillExecutor('spec')?.execute(['create', 'Make', 'runs', 'explicit'], ctx);
    expect(spec?.ok).toBe(true);

    const projectDir = join(ctx.config.projectsDir, ctx.slug);
    const planText = await Bun.file(join(projectDir, 'PLAN.md')).text();
    const specText = await Bun.file(join(projectDir, 'SPEC.md')).text();

    expect(planText).toContain('Improve MIA');
    expect(planText).toContain(ctx.run.id);
    expect(specText).toContain('Make runs explicit');
  });

  it('should execute grill skill through validated CLI path', async () => {
    const ctx = createExecutionContext();
    const definition = getSkill('grill');

    expect(definition).toBeDefined();
    if (!definition) throw new Error('grill definition not found');

    const result = await executeSkillDefinition(definition, [], ctx);

    expect(result.ok).toBe(true);
  });

  it('should persist and query events via UnifiedStore', async () => {
    const store = createUnifiedStore();
    const projectsDir = join(testDir, '.mia', 'projects');
    const slug = 'test-project';

    await store.appendLearning(projectsDir, slug, { insight: 'Test learning', key: 'test-key' });
    await store.appendTimeline(projectsDir, slug, { skill: 'test', event: 'started' });

    const learnings = await store.listLearnings(projectsDir, slug, 10);
    expect(learnings.length).toBe(1);
    const learning = learnings[0];
    if (!learning) throw new Error('No learning found');
    expect(learning.data).toEqual({ insight: 'Test learning', key: 'test-key' });
    expect(learning.type).toBe('learning');

    const timeline = await store.listTimeline(projectsDir, slug, 10);
    expect(timeline.length).toBe(1);
    const tlEvent = timeline[0];
    if (!tlEvent) throw new Error('No timeline event found');
    expect(tlEvent.data).toEqual({ skill: 'test', event: 'started' });
    expect(tlEvent.type).toBe('timeline');

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

    const definition = getSkill('vc');
    expect(definition).toBeDefined();
    if (!definition) throw new Error('vc definition not found');

    const result = await executeSkillDefinition(definition, ['help'], ctx);

    expect(result.ok).toBe(true);

    const timeline = await unifiedStore.listTimeline(projectsDir, slug, 5);

    expect(timeline.length).toBeGreaterThan(0);
    const lastEvent = timeline[0];
    expect(lastEvent).toBeDefined();
    if (!lastEvent) throw new Error('No timeline event');

    const eventData = lastEvent.data as { skill?: string; event?: string; outcome?: string; runId?: string };
    expect(eventData.skill).toBe('vc');
    expect(eventData.event).toBe('completed');
    expect(eventData.outcome).toBe('success');
    expect(eventData.runId).toBe(ctx.run.id);

    const evidence = await unifiedStore.listEvidence(projectsDir, slug, 5);
    expect(evidence).toEqual([]);
  });

  it('blocks an invalid skill definition before execution', async () => {
    const ctx = createExecutionContext();
    let executed = false;
    const definition = {
      manifest: {
        name: 'broken',
        version: '',
        description: 'invalid',
        allowedTools: [],
        sideEffects: 'none' as const,
        verification: [],
        phase: 'execute' as const,
      },
      executor: {
        execute: async () => {
          executed = true;
          return { ok: true, output: 'should not run' };
        },
      },
    };

    const result = await executeSkillDefinition(definition, [], ctx);

    expect(result.ok).toBe(false);
    expect(result.status).toBe('blocked');
    expect(result.error).toContain('must declare a version');
    expect(executed).toBe(false);
  });
});
