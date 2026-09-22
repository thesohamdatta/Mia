import type { ExecutionContext, EvidenceRecord } from '../skills/types.js';

export interface VerificationCheck {
  name: string;
  command: string[];
  description: string;
}

export interface VerificationResult {
  records: EvidenceRecord[];
  passed: boolean;
}

async function runOne(
  check: VerificationCheck,
  ctx: ExecutionContext,
  timeoutMs: number
): Promise<EvidenceRecord> {
  const started = performance.now();
  const proc = Bun.spawn(check.command, {
    cwd: ctx.cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, timeoutMs);

  const exitCode = await proc.exited;
  clearTimeout(timer);

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  const durationMs = Math.round(performance.now() - started);
  const detail = `${stdout}${stderr}`.trim().slice(-4000);

  return {
    runId: ctx.run.id,
    name: check.name,
    status: timedOut ? 'failed' : exitCode === 0 ? 'passed' : 'failed',
    command: check.command.join(' '),
    durationMs,
    detail: timedOut
      ? `Timed out after ${timeoutMs}ms${detail ? `\n${detail}` : ''}`
      : detail || check.description,
  };
}

export async function runVerification(
  ctx: ExecutionContext,
  checks: readonly VerificationCheck[],
  timeoutMs = 120_000
): Promise<VerificationResult> {
  const records: EvidenceRecord[] = [];

  for (const check of checks) {
    records.push(await runOne(check, ctx, timeoutMs));
  }

  return {
    records,
    passed: records.length > 0 && records.every((record) => record.status === 'passed'),
  };
}
