import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MIA_VERSION } from '../core/version.js';

const root = mkdtempSync(join(tmpdir(), 'mia-binary-'));
const project = join(root, 'project');
const miaDir = join(root, '.mia');
const binary = join(process.cwd(), 'bin', 'mia');

function run(args: string[]): string {
  return execFileSync(binary, args, {
    cwd: project,
    env: { ...process.env, MIA_DIR: miaDir },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function assertContains(output: string, value: string): void {
  if (!output.includes(value)) {
    throw new Error(`Expected output to contain "${value}"`);
  }
}

try {
  mkdirSync(project, { recursive: true });
  runGit('init');
  runGit('config', 'user.email', 'mia@example.com');
  runGit('config', 'user.name', 'MIA Smoke Test');
  runGit('commit', '--allow-empty', '-m', 'test: initialize binary smoke fixture');

  assertContains(run(['--help']), 'MIA (Machine Intelligence Architecture) CLI');
  assertContains(run(['--help']), 'plan');
  assertContains(run(['--help']), 'learn');
  assertContains(run(['--version']), `MIA v${MIA_VERSION}`);

  assertContains(run(['plan', 'create', 'Verify compiled MIA']), 'Work: work_');
  assertContains(
    run(['learn', 'add', 'workflow', 'binary-smoke', 'Compiled binary can persist project state']),
    'Learning saved: binary-smoke'
  );
  assertContains(
    run(['checkpoint', 'save', 'smoke', 'Compiled binary checkpoint']),
    'Checkpoint saved: smoke'
  );
  assertContains(run(['memory', 'append', 'Binary smoke executed']), 'Appended to memory.md');

  const events = join(miaDir, 'projects', 'project', 'events.jsonl');
  const checkpoint = join(miaDir, 'projects', 'project', 'checkpoints', 'smoke.md');
  const memory = join(miaDir, 'memory.md');

  for (const path of [events, checkpoint, memory]) {
    if (!Bun.file(path).size) {
      throw new Error(`Expected persisted artifact: ${path}`);
    }
  }

  console.log('Binary smoke test passed.');
} finally {
  rmSync(root, { recursive: true, force: true });
}

function runGit(...args: string[]): void {
  execFileSync('git', args, {
    cwd: project,
    stdio: 'ignore',
  });
}
