// MIA Daemon - Persistent HTTP server for state, skills, and RPC
// Runs as a compiled Bun binary: `bun build --compile src/daemon/server.ts --outfile bin/miad`

import { serve } from "bun";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { STATE_FILE, DEFAULT_PORT_RANGE } from "../shared/types";
import {
  appendLearning, readLearnings, appendTimeline, readTimeline,
  saveCheckpoint, listCheckpoints, getSlug, ensureProject,
  readMemory, appendMemory, ensureMemory,
  type Learning, type TimelineEvent, type Checkpoint
} from "./learning";

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
  skills.set("learn", { name: "learn", description: "Manage project learnings", triggers: ["learn"] });
  skills.set("memory", { name: "memory", description: "Read/write long-term memory", triggers: ["memory"] });
  skills.set("checkpoint", { name: "checkpoint", description: "Save/resume working state", triggers: ["checkpoint"] });
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

    case "learn": {
      const slug = getSlug();
      const subcmd = args[0] || "list";
      if (subcmd === "list") {
        const learnings = readLearnings(slug, 20);
        if (learnings.length === 0) return { ok: true, output: "No learnings yet. Run skills and MIA will learn from sessions. please" };
        const lines = [`📚 Learnings for ${slug} (${learnings.length} shown):`, ""];
        for (const l of learnings) {
          lines.push(`  [${l.type}] ${l.key} (conf: ${l.confidence}) — ${l.insight}`);
        }
        return { ok: true, output: lines.join("\n") };
      }
      if (subcmd === "add") {
        const slug2 = getSlug();
        const learning: Learning = {
          ts: new Date().toISOString(),
          skill: args[1] || "manual",
          type: (args[2] as Learning["type"]) || "preference",
          key: args[3] || "untitled",
          insight: args.slice(4).join(" ") || "No insight recorded",
          confidence: 7,
          source: "user-stated",
        };
        appendLearning(slug2, learning);
        return { ok: true, output: `✓ Learning saved: ${learning.key}\n  ${learning.insight}` };
      }
      return { ok: true, output: "Usage: mia learn [list|add <skill> <type> <key> <insight>]" };
    }

    case "retro": {
      const slug = getSlug();
      const timeline = readTimeline(slug, 20);
      const learnings = readLearnings(slug, 10);
      const lines = [`📊 Retrospective for ${slug}`, ""];
      if (timeline.length > 0) {
        lines.push("## Recent Activity");
        for (const t of timeline) {
          lines.push(`  ${t.ts} | ${t.skill} | ${t.event}${t.outcome ? " | " + t.outcome : ""}`);
        }
      } else {
        lines.push("## Recent Activity", "  (no timeline events yet)");
      }
      lines.push("");
      if (learnings.length > 0) {
        lines.push("## Key Learnings");
        for (const l of learnings) {
          lines.push(`  [${l.type}] ${l.key} — ${l.insight}`);
        }
      } else {
        lines.push("## Key Learnings", "  (no learnings yet)");
      }
      lines.push("", "## What went well", "  (reflect and add)", "## What to improve", "  (reflect and add)", "## Next steps", "  (plan for next session)", "", "~ observe → learn → distill → apply → verify → evolve ~");
      return { ok: true, output: lines.join("\n") };
    }

    case "memory": {
      ensureMemory();
      const subcmd = args[0] || "read";
      if (subcmd === "read") {
        const mem = readMemory();
        return { ok: true, output: mem };
      }
      if (subcmd === "add") {
        const text = args.slice(1).join(" ");
        if (!text) return { ok: false, error: "Usage: mia memory add <text to remember>" };
        appendMemory(text);
        return { ok: true, output: `✓ Memory updated. ~/​.mia/memory.md` };
      }
      return { ok: true, output: "Usage: mia memory [read|add <text>]" };
    }

    case "checkpoint": {
      const slug = getSlug();
      const subcmd = args[0] || "list";
      if (subcmd === "list") {
        const cps = listCheckpoints(slug);
        if (cps.length === 0) return { ok: true, output: "No checkpoints. Run 'mia checkpoint save' to create one. please" };
        return { ok: true, output: `💾 Checkpoints for ${slug}:\n${cps.map(c => "  " + c).join("\n")}` };
      }
      if (subcmd === "save") {
        const cp: Checkpoint = {
          ts: new Date().toISOString(),
          branch: args[1] || "unknown",
          phase: args[2] || "working",
          summary: args.slice(3).join(" ") || "Manual checkpoint",
          remaining: [],
          files: [],
        };
        saveCheckpoint(slug, cp);
        return { ok: true, output: `✓ Checkpoint saved at ${cp.ts}` };
      }
      return { ok: true, output: "Usage: mia checkpoint [list|save <branch> <phase> <summary>]" };
    }

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

    // Learning API: POST /learn → append learning
    if (url.pathname === "/learn" && req.method === "POST") {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      return req.json().then((body: Learning) => {
        const slug = getSlug();
        appendLearning(slug, body);
        return Response.json({ ok: true, message: "Learning saved" });
      }).catch(() => Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
    }

    // Learning API: GET /learn?limit=20 → list learnings
    if (url.pathname === "/learn" && req.method === "GET") {
      const slug = getSlug();
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const learnings = readLearnings(slug, limit);
      return Response.json({ ok: true, learnings });
    }

    // Timeline API: POST /timeline → append event
    if (url.pathname === "/timeline" && req.method === "POST") {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      return req.json().then((body: TimelineEvent) => {
        const slug = getSlug();
        appendTimeline(slug, body);
        return Response.json({ ok: true, message: "Timeline event saved" });
      }).catch(() => Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
    }

    // Timeline API: GET /timeline?limit=30 → list events
    if (url.pathname === "/timeline" && req.method === "GET") {
      const slug = getSlug();
      const limit = parseInt(url.searchParams.get("limit") || "30");
      const events = readTimeline(slug, limit);
      return Response.json({ ok: true, events });
    }

    // Memory API: GET /memory → read, POST /memory → append
    if (url.pathname === "/memory" && req.method === "GET") {
      const mem = readMemory();
      return Response.json({ ok: true, memory: mem });
    }
    if (url.pathname === "/memory" && req.method === "POST") {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      return req.json().then((body: { text: string }) => {
        appendMemory(body.text);
        return Response.json({ ok: true, message: "Memory updated" });
      }).catch(() => Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
    }

    // Checkpoint API: GET /checkpoints → list
    if (url.pathname === "/checkpoints" && req.method === "GET") {
      const slug = getSlug();
      const cps = listCheckpoints(slug);
      return Response.json({ ok: true, checkpoints: cps });
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