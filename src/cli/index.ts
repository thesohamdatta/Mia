// MIA CLI - Talks to the miad daemon over HTTP
// Compiled with: bun build --compile src/cli/index.ts --outfile bin/mia

import { join } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";
import { STATE_FILE } from "../shared/types";

const HOME = homedir();
const MIA_DIR = join(HOME, ".mia");
const STATE_PATH = join(MIA_DIR, STATE_FILE);

function loadState(): { port: number; token: string } | null {
  try {
    if (existsSync(STATE_PATH)) {
      return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    }
  } catch {}
  return null;
}

async function ensureDaemonRunning(): Promise<{ port: number; token: string }> {
  let state = loadState();
  
  if (state) {
    // Check if daemon is actually alive
    try {
      const res = await fetch(`http://127.0.0.1:${state.port}/health`, { 
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) return state;
    } catch {
      // Daemon not responding, fall through to start new one
    }
  }
  
  // Daemon not running - in v0.1 we'll just error and tell user to start it
  throw new Error(
    "MIA daemon (miad) is not running.\n" +
    "Start it with: miad\n" +
    "Or run 'mia daemon start' (coming in v0.2)"
  );
}

async function sendCommand(skill: string, args: string[] = []): Promise<void> {
  const state = await ensureDaemonRunning();
  
  const res = await fetch(`http://127.0.0.1:${state.port}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${state.token}`,
    },
    body: JSON.stringify({ skill, args }),
  });
  
  const result = await res.json();
  
  if (!result.ok) {
    console.error(`❌ ${result.error}`);
    process.exit(1);
  }
  
  if (result.output) {
    console.log(result.output);
  }
}

function showHelp() {
  console.log(`MIA (Machine Intelligence Architecture) CLI
Version: 0.1.0

Usage: mia <skill> [args...]

Core skills:
  help        Show this help message
  version     Show MIA version
  grill       Start a clarification interview (golden rule enforcement)
  plan        Create a verifiable plan
  spec        Turn intent into PRD → issues
  ship        Test → review → push → PR
  review      Pre-landing PR review

Learning skills:
  learn       Manage project learnings (list, add)
  retro       Weekly retrospective with timeline + learnings
  memory      Read/write long-term memory (~/.mia/memory.md)
  checkpoint  Save/resume working state

Daemon:
  miad                Start the MIA daemon (runs in foreground)
  mia daemon status   Check daemon status (coming soon)

Run 'mia <skill> --help' for skill-specific usage.

~ maximum value per line ~`);
}

function showVersion() {
  console.log("MIA v0.1.0 (Machine Intelligence Architecture)");
  console.log("Built on gstack principles. ~ maximum value per line ~");
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || "help";
  const cmdArgs = args.slice(1);

  // Special commands that don't need daemon
  if (command === "miad") {
    // Import and run daemon - we'll handle this via a separate entry point
    console.log("Use 'bun run src/daemon/server.ts' to start the daemon in dev mode.");
    console.log("Or compile with: bun build --compile src/daemon/server.ts --outfile bin/miad");
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    showHelp();
    return;
  }

  if (command === "version" || command === "--version" || command === "-v") {
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