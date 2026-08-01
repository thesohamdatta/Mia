import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

const BIN_DIR = join(__dirname, '..', 'bin');
const MIA_CLI = join(BIN_DIR, 'mia.exe');
const STATE_FILE = join(process.env.HOME || process.env.USERPROFILE || '', '.mia', 'state.json');

let daemonPort = 0;
let daemonToken = '';

interface DaemonResponse {
  ok: boolean;
  output?: string;
  error?: string;
  service?: string;
  skills?: unknown[];
  version?: string;
  uptime?: number;
  idleTimeoutMs?: number;
}

function loadState(): boolean {
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    daemonPort = state.port;
    daemonToken = state.token;
    return true;
  } catch {
    return false;
  }
}

async function sendCommand(skill: string, args: string[] = []): Promise<DaemonResponse> {
  if (!daemonPort || !daemonToken) {
    throw new Error('Daemon not running - loadState() failed');
  }

  const response = await fetch(`http://127.0.0.1:${daemonPort}/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${daemonToken}`,
    },
    body: JSON.stringify({ skill, args }),
  });

  return response.json() as Promise<DaemonResponse>;
}

async function getHealth(): Promise<DaemonResponse> {
  if (!daemonPort) throw new Error('Daemon not running');
  const response = await fetch(`http://127.0.0.1:${daemonPort}/health`);
  return response.json() as Promise<DaemonResponse>;
}

describe('MIA Daemon', () => {
  beforeAll(() => {
    const loaded = loadState();
    expect(loaded).toBe(true);
    expect(daemonPort).toBeGreaterThan(0);
    expect(daemonToken).toBeTruthy();
  });

  it('should respond to health check', async () => {
    const health = await getHealth();
    expect(health.ok).toBe(true);
    expect(health.service).toBe('miad');
  });

  it('should list skills', async () => {
    const response = await fetch(`http://127.0.0.1:${daemonPort}/skills`);
    const data = (await response.json()) as { ok: boolean; skills: unknown[] };
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.skills)).toBe(true);
    expect(data.skills.length).toBeGreaterThan(0);
  });
});

describe('MIA CLI - Grill Skill', () => {
  beforeEach(async () => {
    const health = await getHealth();
    expect(health.ok).toBe(true);
  });

  it('should show help via CLI', async () => {
    const proc = spawn(MIA_CLI, ['grill', '--help'], { stdio: 'pipe' });
    let output = '';
    proc.stdout?.on('data', (d) => {
      output += d.toString();
    });
    await new Promise((r) => proc.on('close', r));
    expect(output).toContain('Usage: mia grill');
  });

  it('should start grill session via daemon', async () => {
    const result = await sendCommand('grill', ['start']);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('GRILL MODE ACTIVATED');
  });

  it('should handle grill with context', async () => {
    const result = await sendCommand('grill', ['start', 'Build an AI agent']);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('GRILL MODE');
  });
});

describe('MIA CLI - Health Skill', () => {
  beforeEach(async () => {
    const health = await getHealth();
    expect(health.ok).toBe(true);
  });

  it('should show health check info', async () => {
    const result = await sendCommand('health', []);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('HEALTH CHECK');
    expect(result.output).toContain('TypeScript');
  });

  it('should show health history', async () => {
    const result = await sendCommand('health', ['history']);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('health-history.jsonl');
  });
});

describe('MIA CLI - Plan Skill', () => {
  beforeEach(async () => {
    const health = await getHealth();
    expect(health.ok).toBe(true);
  });

  it('should show plan info', async () => {
    const result = await sendCommand('plan', ['create']);
    expect(result.ok).toBe(true);
    expect(result.output).toContain('PLAN MODE');
  });
});
