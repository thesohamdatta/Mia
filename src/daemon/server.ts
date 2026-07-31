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
import { loadAllSkills, type Skill } from "./skill-loader";

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

// Load skills from filesystem
let skills = new Map<string, Skill>();

async function initializeSkills() {
  skills = await loadAllSkills();
  console.log(`   Loaded ${skills.size} skills from filesystem`);
}

// Pick a port and start
const port = randomPort();
const token = generateToken();
const version = "0.1.0";

saveState(port, token, version);
await initializeSkills();

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

      return req.json().then(async (body: { skill: string; args?: string[] }) => {
        const { skill, args = [] } = body;
        const skillObj = skills.get(skill);
        if (!skillObj) {
          return Response.json({ ok: false, error: `Unknown skill: ${skill}. Run 'mia help' for available commands.` });
        }

        // Auto-log timeline event
        appendTimeline(getSlug(), { ts: new Date().toISOString(), skill, event: "started" });

        const result = await skillObj.execute(args, currentToken || "");

        // Auto-log completion
        appendTimeline(getSlug(), { ts: new Date().toISOString(), skill, event: "completed", outcome: result.ok ? "success" : "failed" });

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