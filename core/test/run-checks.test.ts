import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createExecutionContext } from '../context.js';
import { type VerificationCheck, runVerification } from '../verification/run-checks.js';

// The real command runner behind health/review/ship was never exercised by a
// test; every existing test injects a fake verification function. These tests
// spawn real processes so the pass/fail -> evidence path is actually proven.
describe('runVerification (real process execution)', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mia-run-checks-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function ctx() {
    const context = createExecutionContext(dir);
    context.config = { ...context.config, projectsDir: join(dir, 'projects') };
    return context;
  }

  function check(name: string, command: string[]): VerificationCheck {
    return { name, command, description: `${name} check` };
  }

  it('records a passing check with its command, exit status and captured output', async () => {
    const result = await runVerification(ctx(), [
      check('ok', ['bash', '-c', 'echo hello-from-check']),
    ]);

    expect(result.passed).toBe(true);
    expect(result.records).toHaveLength(1);
    const record = result.records[0];
    expect(record?.name).toBe('ok');
    expect(record?.status).toBe('passed');
    expect(record?.command).toBe('bash -c echo hello-from-check');
    expect(record?.detail).toContain('hello-from-check');
    expect(record?.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('marks a non-zero exit as failed and does not pass the suite', async () => {
    const result = await runVerification(ctx(), [check('boom', ['bash', '-c', 'exit 3'])]);

    expect(result.passed).toBe(false);
    expect(result.records[0]?.status).toBe('failed');
  });

  it('requires every check to pass', async () => {
    const result = await runVerification(ctx(), [
      check('ok', ['bash', '-c', 'exit 0']),
      check('boom', ['bash', '-c', 'exit 1']),
    ]);

    expect(result.records.map((r) => r.status)).toEqual(['passed', 'failed']);
    expect(result.passed).toBe(false);
  });

  it('fails a check that exceeds the timeout and records the reason', async () => {
    const result = await runVerification(ctx(), [check('slow', ['sleep', '5'])], 100);

    expect(result.passed).toBe(false);
    expect(result.records[0]?.status).toBe('failed');
    expect(result.records[0]?.detail).toContain('Timed out after 100ms');
  });

  it('does not pass an empty check list', async () => {
    const result = await runVerification(ctx(), []);
    expect(result.passed).toBe(false);
    expect(result.records).toEqual([]);
  });
});
