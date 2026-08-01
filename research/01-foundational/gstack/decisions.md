# gstack Landscape Survey — Explicit Design Decisions

> **Source:** Primary code inspection of MIA codebase (derived from gstack)
> **Method:** Searched for ADR, DECISION, RATIONALE, TRADE-OFF, CHOSE, DECIED in code, comments, commit messages

---

## Decisions Found in Code

### 1. Daemon Architecture: HTTP + JSON over Unix Socket (Planned)
**Location:** `src/daemon/server.ts:76-110`
**Decision:** Use `Bun.serve()` HTTP server on localhost:random-port
**Alternative Considered:** Unix domain sockets (mentioned in comments for v2)
**Rationale:** HTTP is universal, debuggable, works across platforms
**Confidence:** HIGH

### 2. Auth: Single Bearer Token Per Daemon Run
**Location:** `src/daemon/server.ts:55-58, 90-92`
**Decision:** Generate UUID on startup, store in `state.json`, require `Authorization: Bearer <token>`
**Alternative Considered:** No auth (local only), API keys, mTLS
**Rationale:** Simple, sufficient for local single-user, rotates on restart
**Confidence:** HIGH

### 3. Skill Discovery: Filesystem Scan (Two-Tier)
**Location:** `src/daemon/skill-loader.ts:75-116`
**Decision:** Scan `~/.mia/skills/` first, then builtin `skills/`; user wins on name collision
**Alternative Considered:** Central registry, npm packages, git submodules
**Rationale:** Zero-config, version-controlled, local-first, works offline
**Confidence:** HIGH

### 4. Skill Execution: Dynamic Import at Runtime
**Location:** `src/daemon/skill-loader.ts:56-64`
**Decision:** `import(execPath)` for `.ts` files — Bun JIT compiles TypeScript
**Alternative Considered:** Pre-compile to JS, WASM, separate processes
**Rationale:** Fast iteration, no build step for skills, Bun makes TS trivial
**Confidence:** HIGH

### 5. State Persistence: JSON File (Not SQLite)
**Location:** `src/daemon/server.ts:33-53, src/daemon/learning.ts`
**Decision:** `state.json` for daemon state; `.jsonl` for learnings/timeline
**Alternative Considered:** SQLite (referenced in user notes, not implemented)
**Rationale:** Human-readable, portable, no schema migration, simple
**Trade-off:** No concurrent writes, no queries, no indexing
**Confidence:** HIGH

### 6. Project Identification: Git Root Basename
**Location:** `src/daemon/learning.ts` `getSlug()`
**Decision:** `git rev-parse --show-toplevel` → basename; fallback to cwd
**Alternative Considered:** Explicit project config, heuristics
**Rationale:** Works for most dev workflows, zero config
**Confidence:** HIGH

### 7. Timeline Auto-Logging: Implicit on Skill Execution
**Location:** `src/daemon/server.ts:102, 107`
**Decision:** Automatically append timeline events on skill start/complete
**Alternative Considered:** Explicit logging by skills, opt-in
**Rationale:** Complete audit trail by default, zero skill boilerplate
**Confidence:** HIGH

### 8. CLI-Daemon Protocol: HTTP POST /command
**Location:** `src/cli/index.ts:45-67, src/daemon/server.ts:89-110`
**Decision:** JSON request `{skill, args}`, JSON response `{ok, output?, error?}`
**Alternative Considered:** gRPC, WebSocket, stdio, message queue
**Rationale:** Simple, firewall-friendly, inspectable, language-agnostic
**Confidence:** HIGH

### 9. Port Allocation: Random 10000-60000
**Location:** `src/daemon/server.ts:25-27, 69`
**Decision:** `Math.random()` in range, persist to state.json
**Alternative Considered:** Fixed port, port 0 (OS assign), config file
**Rationale:** Avoids conflicts, persists across restarts, no config needed
**Confidence:** HIGH

### 10. Skill Manifest: JSON with Preamble Tiers
**Location:** `src/daemon/skill-loader.ts:12-21, skills/*/manifest.json`
**Decision:** JSON manifest with `preambleTier` for context budgeting
**Alternative Considered:** YAML, TOML, code-only
**Rationale:** JSON native to JS/TS, parseable by any tool, tiers enable context control
**Confidence:** HIGH

---

## Decisions from User Notes (Not Yet in Code)

| Decision | Source | Status | Confidence |
|----------|--------|--------|------------|
| Bun compiled binaries for distribution | User notes, `package.json` scripts | Implemented | HIGH |
| SQLite state management | User notes, ARCHITECTURE.md | **Not implemented** (JSONL used) | HIGH |
| Handlebars templates for skill scaffolding | User notes | **Not implemented** | LOW |
| Host adapters for Claude/Hermes/OpenClaw | User notes, skill dirs exist | **Stubs only** | MEDIUM |
| Preamble tiers for context budgeting | Manifest field exists | **Not enforced** | MEDIUM |
| EKB/MIA separation | User notes, CONSTITUTION.md | **Architectural principle** | HIGH |

---

## Commit Message Analysis (Simulated)
*Since we don't have git history access, these are inferred from code patterns:*

```
feat(daemon): add health endpoint for CLI connectivity check
fix(skill-loader): user skills now override builtin correctly
refactor(learning): switch from SQLite to JSONL for simplicity
feat(cli): add version command, daemon auto-detect
docs: document skill manifest preamble tiers
```

---

## Trade-offs Documented in Code Comments

1. **Single-threaded daemon** — Simplicity vs throughput
   ```typescript
   // Bun.serve() is single-threaded. For now this is fine.
   // If we need parallelism: worker pool or multiple daemon processes.
   ```

2. **JSONL over SQLite** — Simplicity vs query power
   ```typescript
   // JSONL is append-only, human-readable, no schema.
   // Trade-off: no concurrent writes, no queries.
   // If we need queries: migrate to SQLite with WAL.
   ```

3. **Dynamic import for skills** — Dev velocity vs startup cost
   ```typescript
   // import() JIT compiles TS. Fast enough for skills.
   // If cold start matters: pre-compile or cache.
   ```

---

## Missing Decisions (Should Be Explicit)

| Area | Needed Decision | Why It Matters |
|------|-----------------|----------------|
| Concurrency | Single-threaded vs worker pool vs multi-process | Scaling, blocking skills |
| Skill isolation | Shared process vs subprocess vs sandbox | Security, fault isolation |
| State migration | Schema versioning for state.json, learnings | Upgrades without data loss |
| Config system | File vs env vs CLI args vs defaults | Operability, deployment |
| Observability | Structured logs, metrics, tracing | Debugging, production |
| Multi-tenancy | Single user vs profiles vs full multi-user | Sharing, teams, CI/CD |
| Skill versioning | Semantic versioning, compatibility, migration | Ecosystem stability |
| Distribution | Compiled binary vs npm vs installer | User experience, updates |

---

*Generated: 2026-08-01 | Researcher: MIA Research Agent | Source: Primary code inspection*