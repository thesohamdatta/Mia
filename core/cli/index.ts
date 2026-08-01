import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStateFile, initializeConfig } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getStateFilePath(): string {
  return getStateFile();
}

function loadState(): { port: number; token: string } | null {
  try {
    if (existsSync(getStateFilePath())) {
      return JSON.parse(readFileSync(getStateFilePath(), 'utf-8'));
    }
  } catch {}
  return null;
}

async function ensureDaemonRunning(): Promise<{ port: number; token: string }> {
  const state = loadState();

  if (state) {
    try {
      const res = await fetch(`http://127.0.0.1:${state.port}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return state;
    } catch {
      // Daemon not responding
    }
  }

  throw new Error(
    'MIA daemon (miad) is not running.\n' +
      'Start it with: miad\n' +
      'Or run: bun run core/daemon/server.ts (dev mode)'
  );
}

async function sendCommand(skill: string, args: string[] = []): Promise<void> {
  const state = await ensureDaemonRunning();

  const res = await fetch(`http://127.0.0.1:${state.port}/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`,
    },
    body: JSON.stringify({ skill, args }),
  });

  const result = (await res.json()) as { ok: boolean; error?: string; output?: string };

  if (!result.ok) {
    console.error(`❌ ${result.error ?? 'Unknown error'}`);
    process.exit(1);
  }

  if (result.output) {
    console.log(result.output);
  }
}

function showHelp(): void {
  console.log(`MIA (Machine Intelligence Architecture) CLI
Version: 0.2.0

Usage: mia <skill> [args...]

Core skills:
  help        Show this help message
  version     Show MIA version
  grill       Start a clarification interview (golden rule enforcement)
  plan        Create a verifiable plan with success criteria
  spec        Turn intent into PRD → issues
  ship        Test → review → push → PR
  review      Pre-landing PR review
  health      Code quality dashboard

Learning skills:
  learn       Manage project learnings (list, add)
  retro       Weekly retrospective with timeline + learnings
  memory      Read/write long-term memory (~/.mia/memory.md)
  checkpoint  Save/resume working state

Daemon:
  miad                Start the MIA daemon (runs in foreground)

Run 'mia <skill> --help' for skill-specific usage.

~ maximum value per line ~`);
}

function showVersion(): void {
  console.log('MIA v0.2.0 (Machine Intelligence Architecture)');
  console.log('Built on gstack principles. ~ maximum value per line ~');
}

async function main(): Promise<void> {
  // Initialize config
  const builtinSkillsPath = join(__dirname, '..', '..', '..', 'skills');
  initializeConfig(builtinSkillsPath);

  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || 'help';
  const cmdArgs = args.slice(1);

  // Special commands that don't need daemon
  if (command === 'miad') {
    console.log('Use "bun run core/daemon/server.ts" to start the daemon in dev mode.');
    console.log('Or compile with: bun build --compile core/daemon/server.ts --outfile bin/miad');
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion();
    return;
  }

  // All other commands go through the daemon
  try {
    await sendCommand(command, cmdArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${error.message}`);
    } else {
      console.error(`❌ Unknown error: ${error}`);
    }
    process.exit(1);
  }
}

main();
