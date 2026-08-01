# gstack Analysis — Foundation for MIA

> **Source:** gstack framework by Soham (the user). This is the primary architectural model for MIA.

---

## Overview

gstack is a personal AI agent framework built on **Bun compiled binaries**, **persistent daemon**, **SQLite state**, **skill templates with Handlebars**, and **host adapters** for Claude/Hermes/OpenClaw.

---

## Core Architecture Patterns

### 1. Compiled Binary Distribution
- **Bun `--compile`** → single executable, no runtime dependencies
- Cross-platform: Linux, macOS, Windows
- Fast startup (<50ms cold)
- Self-contained distribution

### 2. Persistent Daemon (`miad`)
- Long-running HTTP server (ports 10000-60000)
- Token-based auth (Bearer tokens in `~/.mia/state.json`)
- Health endpoint (`/health`)
- Graceful shutdown (SIGINT/SIGTERM)
- Skill loading from filesystem at startup

### 3. SQLite State Management
- `~/.mia/state.json` — daemon port, token, PID, version
- `~/.mia/memory.md` — long-term memory (append-only markdown)
- `~/.mia/skills/` — user-installed skills (takes precedence over builtin)
- `~/.mia/checkpoints/` — working state snapshots
- **WAL mode** for concurrent reads/writes

### 4. Skill System (Filesystem-First)
```
~/.mia/skills/
├── core/
│   ├── grill/
│   │   ├── manifest.json
│   │   └── execute.ts
│   ├── plan/
│   ├── spec/
│   ├── ship/
│   ├── review/
│   └── health/
├── learning/
│   ├── learn/
│   ├── retro/
│   ├── memory/
│   └── checkpoint/
├── agent/
│   ├── claude/
│   ├── hermes/
│   └── opencode/
└── life/
    ├── morning/
    ├── evening/
    └── weekly/
```

**Skill Manifest:**
```json
{
  "name": "grill",
  "version": "1.0.0",
  "description": "Start a clarification interview",
  "preambleTier": 1,
  "allowedTools": ["Bash", "Read", "Write", "AskUserQuestion"],
  "triggers": ["grill", "clarify", "before coding"],
  "whenToInvoke": "ALWAYS before any non-trivial implementation",
  "workflow": "1. State problem\n2. List assumptions\n3. Identify risks\n4. Define 'done'\n5. Get human approval"
}
```

**Executor Pattern:**
```typescript
export async function execute(args: string[], token: string): Promise<{ ok: boolean; output?: string; error?: string }>
```

### 5. Host Adapters (Multi-Agent Support)
- **Claude Code** — Native CLI integration
- **Hermes Agent** — Skills, cron, delegation
- **OpenClaw** — Browser automation, planning
- **OpenCode** — Code-focused agent

Each adapter implements a common interface for:
- Spawning agent processes
- Sending/receiving messages
- Tool execution
- Session persistence

### 6. Learning & Timeline System
- **Learnings** — Structured insights appended per project
- **Timeline** — Event log: skill started/completed, outcomes
- **Checkpoints** — Serializable working state for resume
- **Project slug** — Auto-detected from git root or cwd

### 7. CLI ↔ Daemon Communication
- CLI (`mia`) → HTTP POST `/command` → Daemon
- Daemon loads skill → executes → returns JSON
- Auto-logs timeline events
- Token auth prevents unauthorized access

---

## Key Design Decisions for MIA

| Decision | Rationale |
|----------|-----------|
| **Bun compiled binary** | Zero-dep distribution, fast startup, native performance |
| **Daemon + CLI split** | Persistent state, background processing, multiple CLI clients |
| **Filesystem skills** | User-extensible, version-controlled, no registry needed |
| **SQLite + markdown** | Human-readable + queryable, portable, no external DB |
| **Token auth** | Simple, secure enough for local-only daemon |
| **Handlebars templates** | Familiar, logic-less, skill scaffolding |
| **Preamble tiers** | Context budgeting — tier 1 always, tier 2 on demand |

---

## Gaps / Questions for MIA

1. **Skill hot-reload** — Currently loads at startup only
2. **Inter-skill communication** — Skills run in isolation
3. **Distributed daemon** — Single machine only
4. **Skill marketplace** — No discovery/install mechanism
5. **Migration system** — Schema changes for state/skills
6. **Observability** — Logs, metrics, tracing

---

## MIA Adoption Checklist

- [ ] Compile `miad` with `bun build --compile src/daemon/server.ts --outfile bin/miad`
- [ ] Compile `mia` CLI with `bun build --compile src/cli/index.ts --outfile bin/mia`
- [ ] Install to `~/.mia/bin/` (in PATH)
- [ ] Initialize `~/.mia/skills/` with core skills from repo
- [ ] Add `vc` (version control) skill to core
- [ ] Test daemon startup, skill loading, CLI ↔ daemon RPC
- [ ] Verify token auth, health check, graceful shutdown
- [ ] Document skill development workflow

---

## References

- gstack repo (local): `/c/Users/Soham/Downloads/AI/gstack` or user's private repo
- Bun compile docs: https://bun.sh/docs/bundler/executables
- SQLite WAL mode: https://sqlite.org/wal.html
- Handlebars: https://handlebarsjs.com/

---

*Part of MIA Research: 01-foundational-engineering/gstack-analysis.md*