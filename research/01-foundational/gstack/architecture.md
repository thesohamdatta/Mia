# gstack Landscape Survey — Architecture, Decisions, Gaps

> **Source:** MIA codebase (derived from gstack), user's private gstack repo
> **Accessed:** 2026-08-01
> **Confidence:** HIGH (direct code inspection)

---

## Repository Structure (Inferred from MIA)

```
gstack/
├── src/
│   ├── cli/           # CLI entry point (mia)
│   │   └── index.ts   # HTTP client → daemon
│   ├── daemon/        # Persistent HTTP server (miad)
│   │   ├── server.ts  # Main daemon: serve, skills, RPC, learning, memory
│   │   ├── skill-loader.ts  # Filesystem skill discovery
│   │   └── learning.ts      # Timeline, learnings, checkpoints, memory
│   └── shared/
│       └── types.ts   # Shared TypeScript interfaces
├── skills/            # Built-in skills (core/, learning/, agent/, life/)
│   ├── core/
│   │   ├── grill/
│   │   ├── plan/
│   │   ├── spec/
│   │   ├── ship/
│   │   ├── review/
│   │   ├── health/
│   │   └── constitution-check/
│   ├── learning/
│   │   ├── learn/
│   │   ├── retro/
│   │   ├── memory/
│   │   └── checkpoint/
│   ├── agent/
│   │   ├── claude/
│   │   ├── hermes/
│   │   └── opencode/
│   └── life/
│       ├── morning/
│       ├── evening/
│       └── weekly/
├── package.json
├── tsconfig.json
└── bun.lock
```

---

## Core Modules Analysis

### 1. Daemon (`src/daemon/server.ts`)
**Architecture:** Single-process HTTP server using `Bun.serve()`

**Key Components:**
- **Port allocation:** Random 10000-60000, persisted to `~/.mia/state.json`
- **Auth:** Bearer token (UUID), verified on `/command` and mutating endpoints
- **Skill loading:** `loadAllSkills()` at startup only — **no hot reload**
- **Request routing:**
  - `GET /health` — No auth, returns version + uptime
  - `POST /command` — Main RPC: `{skill, args}` → skill.execute()
  - `GET /skills` — Lists loaded skills
  - `POST/GET /learn` — Learning append/list
  - `POST/GET /timeline` — Event log append/list
  - `GET/POST /memory` — Memory read/append
  - `GET /checkpoints` — List checkpoints

**Concurrency Model:** Single-threaded event loop (Bun default). Skills execute sequentially per request.

**Startup Sequence:**
1. Pick random port, generate token
2. Save state to `~/.mia/state.json` (mode 0o600)
3. `loadAllSkills()` — scans `~/.mia/skills/` then builtin `skills/`
4. Start `Bun.serve()` on port
5. Log readiness, enter idle loop

**Shutdown:** SIGINT/SIGTERM handlers stop server, exit 0.

---

### 2. Skill Loader (`src/daemon/skill-loader.ts`)
**Discovery Order:**
1. `~/.mia/skills/{category}/{skill}/` — User skills (take precedence)
2. `repo-root/skills/{category}/{skill}/` — Built-in fallback

**Manifest Schema:**
```json
{
  "name": "string",
  "version": "string",
  "description": "string",
  "preambleTier": "number",
  "allowedTools": "string[]",
  "triggers": "string[]",
  "whenToInvoke": "string",
  "workflow": "string"
}
```

**Executor Resolution:**
1. `execute.ts` → dynamic `import()` (TypeScript, JIT compiled by Bun)
2. `execute.js` → CommonJS/ESM import
3. Fallback: stub executor returning "Not yet implemented"

**Skill Interface:**
```typescript
interface Skill {
  name: string;
  description: string;
  triggers: string[];
  manifest: SkillManifest;
  execute: (args: string[], token: string) => Promise<{ok, output?, error?}>;
}
```

**Auto-logging:** Timeline events appended on skill start/complete with outcome.

---

### 3. Learning System (`src/daemon/learning.ts`)
**Storage:** JSON Lines (`.jsonl`) files per project slug

**Project Slug Detection:**
- Git root → `git rev-parse --show-toplevel` → basename
- Fallback: cwd basename

**Files per project:**
- `~/.mia/learnings/{slug}.jsonl` — Structured learnings
- `~/.mia/timeline/{slug}.jsonl` — Event timeline
- `~/.mia/checkpoints/{slug}/` — Checkpoint directories
- `~/.mia/memory.md` — Global memory (single file)

**Learning Entry:**
```json
{"ts":"2026-08-01T20:00:00Z","title":"...","content":"...","tags":["tag1"]}
```

**Timeline Entry:**
```json
{"ts":"2026-08-01T20:00:00Z","skill":"grill","event":"started"}
{"ts":"2026-08-01T20:00:05Z","skill":"grill","event":"completed","outcome":"success"}
```

**Checkpoint:** Full working state snapshot (files + metadata)

---

### 4. CLI (`src/cli/index.ts`)
**Architecture:** Thin HTTP client → daemon

**Commands Requiring Daemon:**
- All skills (`grill`, `plan`, `spec`, `ship`, `review`, `learn`, `retro`, `memory`, `checkpoint`)

**Commands NOT Requiring Daemon:**
- `help`, `version`, `miad` (dev instructions only)

**Flow:**
1. Load state from `~/.mia/state.json`
2. Health check `GET /health` (2s timeout)
3. If fail → error: "Start miad first"
4. `POST /command` with Bearer token
5. Print output or error

---

## Data Models

### Shared Types (`src/shared/types.ts`)
```typescript
interface DaemonState {
  pid: number;
  port: number;
  token: string;
  startedAt: string;
  version: string;
}

interface SkillManifest { /* as above */ }

interface CommandRequest { skill: string; args: string[]; context?: Record<string, unknown>; }

interface CommandResponse { ok: boolean; output?: string; error?: string; }
```

### State File (`~/.mia/state.json`)
```json
{
  "pid": 12345,
  "port": 45743,
  "token": "d1a134...0a6d",
  "startedAt": "2026-08-01T20:15:00.000Z",
  "version": "0.2.0"
}
```

---

## Explicit Design Decisions (from code inspection)

| Decision | Source | Confidence |
|----------|--------|------------|
| **Bun compiled binaries** for distribution | `package.json` build scripts, user notes | HIGH |
| **Daemon + CLI split** (persistent state) | `src/daemon/server.ts`, `src/cli/index.ts` | HIGH |
| **SQLite not used** — JSON/JSONL files instead | `learning.ts` uses `.jsonl`, no SQLite import | HIGH |
| **Filesystem skill discovery** (no registry) | `skill-loader.ts` scans directories | HIGH |
| **User skills override builtin** | `loadAllSkills()` loads user first, skips if exists | HIGH |
| **Bearer token auth** (single token per daemon run) | `server.ts` verifyToken(), state.json | HIGH |
| **Skills loaded once at startup** | `initializeSkills()` called once in server.ts | HIGH |
| **Single-threaded event loop** | Bun.serve() default, no worker pool | HIGH |
| **Project slug from git root** | `learning.ts` getSlug() uses git rev-parse | HIGH |
| **Timeline auto-logging on skill exec** | `server.ts` lines 102, 107 | HIGH |
| **Preamble tiers for context budgeting** | Manifest field, not yet enforced in code | MEDIUM |
| **Handlebars templates for skill scaffolding** | User notes, not in current code | LOW |

---

## Gaps & Missing Pieces

| Gap | Impact | Evidence |
|-----|--------|----------|
| **No skill hot-reload** | Daemon restart required for skill changes | `initializeSkills()` called once |
| **No SQLite** — JSONL files only | No queries, indexing, concurrent writes | `learning.ts` uses append-only JSONL |
| **No multi-user/tenant** | Single token, single state file | `state.json` has one token |
| **No skill versioning/migration** | Breaking manifest changes break skills | Manifest has version but no migration logic |
| **No observability** | No logs, metrics, tracing | Only console.log at startup |
| **No health check depth** | `/health` only returns uptime | No dependency checks |
| **No graceful degradation** | Skill error → full request failure | try/catch only at RPC level |
| **No request queuing/backpressure** | Burst requests could OOM | Single-threaded, no limits |
| **No skill dependency declaration** | Skills can't declare deps on other skills | Manifest has no `dependsOn` |
| **No test suite visible** | No test files in repo structure | Only integration test for CLI |
| **No config file** | Hardcoded paths, ports, timeouts | `DEFAULT_PORT_RANGE`, `IDLE_TIMEOUT` constants |
| **No plugin system beyond skills** | All extension via skills only | No hooks, middleware, lifecycle |

---

## Contradictions Found

| Claim | Code Reality | Confidence |
|-------|--------------|------------|
| "SQLite state" (user notes) | JSONL files, no SQLite import | HIGH |
| "Persistent daemon" | Daemon dies on SIGINT, state in JSON | MEDIUM (state persists, process doesn't) |
| "Skill templates with Handlebars" | No template engine in codebase | LOW (planned, not implemented) |
| "Host adapters for Claude/Hermes/OpenClaw" | Skill directories exist but executors are stubs | MEDIUM |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Daemon architecture | HIGH | Direct code reading |
| Skill loading | HIGH | Direct code reading |
| Learning/timeline | HIGH | Direct code reading |
| CLI ↔ daemon protocol | HIGH | Direct code reading |
| SQLite usage | HIGH | No SQLite imports found |
| Host adapters | LOW | Stubs only, no implementation |
| Handlebars templates | LOW | Not in codebase |
| Multi-user design | N/A | Not designed for |

---

## Open Questions for MIA

1. **OQ-001:** Should MIA adopt SQLite (as originally envisioned) or stay with JSONL?
2. **OQ-002:** How to implement skill hot-reload without breaking active requests?
3. **OQ-003:** Should daemon support multiple concurrent CLI clients (multi-session)?
4. **OQ-004:** What's the skill dependency story? (dependsOn, load order)
5. **OQ-005:** How to handle daemon upgrades with running skills? (hot code reload)
6. **OQ-006:** Observability: structured logging, metrics, tracing?
7. **OQ-007:** Config system: file-based, env vars, or both?

---

*Generated: 2026-08-01 | Researcher: MIA Research Agent | Source: Primary code inspection*