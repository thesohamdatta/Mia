// MIA Daemon - Persistent HTTP server for state, skills, and RPC
// Runs as a compiled Bun binary: `bun build --compile src/daemon/server.ts --outfile bin/miad`

import { serve } from "bun";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { STATE_FILE, DEFAULT_PORT_RANGE } from "../shared/types";

const HOME = homedir();
const MIA_DIR = join(HOME, ".mia");
const STATE_PATH = join(MIA_DIR, STATE_FILE);

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function randomPort(): number {
  return Math.floor(Math.random() * (DEFAULT_PORT_RANGE.max - DEFAULT_PORT_RANGE.min)) + DEFAULT_PORT_RANGE.min;
}

function generateToken(): string {
  return crypto.randomUUID();
}

function loadState(): { port: number; token: string } | null {
  try {
    if (existsSync(STATE_PATH)) {
      const data = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
      return { port: data.port, token: data.token };
    }
  } catch {}
  return null;
}

function saveState(port: number, token: string, version: string) {
  ensureDir(MIA_DIR);
  const state = {
    pid: process.pid,
    port,
    token,
    startedAt: new Date().toISOString(),
    version,
  };
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), { mode: 0o600 });
}

function verifyToken(req: Request, expectedToken: string): boolean {
  const auth = req.headers.get("Authorization");
  return auth === `Bearer ${expectedToken}`;
}

// In-memory skill registry (will be loaded from filesystem later)
const skills = new Map<string, { name: string; description: string; triggers: string[] }>();

function registerBuiltinSkills() {
  skills.set("help", { name: "help", description: "Show available commands", triggers: ["help", "--help", "-h"] });
  skills.set("version", { name: "version", description: "Show MIA version", triggers: ["version", "--version", "-v"] });
  skills.set("grill", { name: "grill", description: "Start a clarification interview (golden rule enforcement)", triggers: ["grill"] });
  skills.set("plan", { name: "plan", description: "Create a verifiable plan", triggers: ["plan"] });
  skills.set("spec", { name: "spec", description: "Turn intent into PRD → issues", triggers: ["spec"] });
  skills.set("ship", { name: "ship", description: "Test → review → push → PR", triggers: ["ship"] });
  skills.set("review", { name: "review", description: "Pre-landing PR review", triggers: ["review"] });
  skills.set("retro", { name: "retro", description: "Weekly retrospective", triggers: ["retro"] });
}

function handleCommand(skillName: string, args: string[], token: string): { ok: boolean; output?: string; error?: string } {
  const mutatingSkills = ["grill", "plan", "spec", "ship", "review", "retro"];
  if (mutatingSkills.includes(skillName)) {
    // Token verification for mutating commands would go here
  }

  const skill = skills.get(skillName);
  if (!skill) {
    return { ok: false, error: `Unknown skill: ${skillName}. Run 'mia help' for available commands.` };
  }

  switch (skillName) {
    case "help":
      const lines = ["MIA (Machine Intelligence Architecture) CLI", `Version: 0.1.0`, "", "Available skills:"];
      for (const [, s] of skills) {
        lines.push(`  ${s.name.padEnd(12)} - ${s.description}`);
      }
      lines.push("", "Run 'mia <skill> --help' for skill-specific usage.");
      return { ok: true, output: lines.join("\n") };

    case "version":
      return { ok: true, output: "MIA v0.1.0 (Machine Intelligence Architecture)\nBuilt on gstack principles. ~ maximum value per line ~" };

    case "grill":
      return { ok: true, output: "🔥 GRILL MODE ACTIVATED\n\nGolden Rule: Never jump to code without a grill session for anything non-trivial.\n\nLet's clarify:\n1. What's the actual problem we're solving?\n2. What are your assumptions?\n3. What could go wrong?\n4. What does 'done' look like?\n\nAnswer these, then we'll proceed. please" };

    case "plan":
      return { ok: true, output: "📋 PLAN MODE\n\nGrill-to-Ship pipeline:\nbrainstorm → grill → plan → PRD → issues → TDD → execute → review → commit\n\nWrite a verifiable plan with success criteria before implementing.\nRun 'mia spec' to turn intent into a PRD first. please" };

    default:
      return { ok: true, output: `[${skillName}] Skill stub - not yet implemented. Coming soon! please` };
  }
}

// Pick a port and start
const port = randomPort();
const token = generateToken();
const version = "0.1.0";

saveState(port, token, version);
registerBuiltinSkills();

const server = serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    const state = loadState();
    const currentToken = state?.token;

    // Health check - no auth required
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "miad", version: "0.1.0", uptime: process.uptime() });
    }

    // RPC endpoint for CLI commands
    if (url.pathname === "/command" && req.method === "POST") {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: "Unauthorized: invalid or missing Bearer token" }, { status: 401 });
      }

      return req.json().then((body: { skill: string; args?: string[] }) => {
        const { skill, args = [] } = body;
        const result = handleCommand(skill, args, currentToken || "");
        return Response.json(result);
      }).catch(() => Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 }));
    }

    // List skills
    if (url.pathname === "/skills" && req.method === "GET") {
      const list = Array.from(skills.values()).map(s => ({ name: s.name, description: s.description, triggers: s.triggers }));
      return Response.json({ ok: true, skills: list });
    }

    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  },
});

console.log(`🚀 MIA Daemon (miad) started`);
console.log(`   Port: ${port}`);
console.log(`   Token: ${token}`);
console.log(`   State: ${STATE_PATH}`);
console.log(`   PID: ${process.pid}`);
console.log(`   Ready for commands. ~ maximum value per line ~`);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down miad gracefully...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.stop();
  process.exit(0);
});

// Keep alive
setInterval(() => {}, 1000 * 60 * 60);