# MIA Architecture — Handoff Document

## Project Overview
**MIA (Machine Intelligence Architecture)** — Personal AI engineering OS built on gstack principles. Compiled Bun binary with persistent daemon, local-first, self-improving.

**Repository**: `/c/Users/Soham/Downloads/AI/mia/`  
**Git**: `master` branch at commit `9d38f13` (pushed to origin)  
**Branch**: No open PR — all work committed directly to master

---

## What's Done (All 8 Phases Complete ✅)

### Phase 1: Config System (`core/config/`)
- `schema.ts` — Zod schema with daemon, paths, skills, features
- `loader.ts` — File + env overlay, validation, cross-platform paths
- `paths.ts` — Convenience getters (`getMiaDir()`, `getSkillsDir()`, etc.)

### Phase 2: State Service (`core/state/`)
- `types.ts` — Learning, TimelineEvent, Checkpoint, MemoryEntry, ProjectSlug
- `store.ts` — Interfaces (LearningStore, TimelineStore, CheckpointStore, MemoryStore, SessionStore)
- `jsonl-store.ts` — Injection-safe JSONL append/read (guards against prompt injection)
- `service.ts` — FileSystem implementations + `createStateService()` composition

### Phase 3: Skill System (`core/skills/`)
- `types.ts` — SkillManifest, SkillExecutor, SkillRegistry interfaces
- `registry.ts` — FileSkillRegistry with lazy executor loading, user > builtin precedence
- `executor.ts` — `executeSkill()` wrapper with auto-logging
- `preamble.ts` — Tiered preamble (update check, session tracking, learnings load)

### Phase 4: Daemon (`core/daemon/`)
- `server.ts` — Bun.serve HTTP API on random port (10000-60000), Bearer token auth
- Routes: `/health`, `/skills`, `/command`, `/learn`, `/timeline`, `/memory`, `/checkpoints`
- Delegates to StateService + SkillRegistry — no business logic in routes

### Phase 5: CLI (`core/cli/index.ts`)
- Thin HTTP client → daemon
- Commands: `help`, `version`, `grill`, `plan`, `spec`, `ship`, `review`, `health`, `learn`, `retro`, `memory`, `checkpoint`
- `miad` handled specially (prints dev instructions)

### Phase 6: Generator (`core/generator/gen-skill-docs.ts`)
- Handlebars-like template → `docs/skills/*.md`
- Reads `skills/*/manifest.json` + `templates/skill.tmpl`
- 14 skill docs generated

### Phase 7: Host Adapters (`core/hosts/`)
| Adapter | Streaming | API |
|---------|-----------|-----|
| **Claude** | ✅ | Anthropic Messages API |
| **Codex** | ✅ | OpenAI Chat Completions |
| **Hermes** | ❌ | Local HTTP API |
| **OpenClaw** | ❌ | OpenCode local process |

- `types.ts` — HostAdapter, HostConfig, HostRegistry interfaces
- `registry.ts` — HostRegistryImpl with default adapter management
- `base-adapter.ts` — Abstract BaseHostAdapter
- Each adapter: `initialize()`, `execute()`, `executeStreaming?()`, `healthCheck()`, `shutdown()`

### Phase 8: Test Infrastructure (`core/test/`)
- `types.ts` — TestCase, TestSuite, TestResult, StaticAnalyzer, LLMJudge
- `runner.ts` — TestRunnerImpl executes skills with preamble + assertions
- `analyzer.ts` — StaticAnalyzerImpl (complexity, maintainability, issues)
- `judge.ts` — LLMJudgeImpl (heuristic: accuracy, completeness, clarity, style)

---

## Infrastructure (Working)

| Tool | Status |
|------|--------|
| **Git workflow** | GitHub Flow + Conventional Commits (husky: pre-commit, commit-msg, pre-push) |
| **CI** | `.github/workflows/ci.yml` — lint, typecheck, test, build, markdown, drift |
| **Markdown** | `markdownlint-cli2` — 0 errors |
| **Frontmatter** | Zod validation — 50/50 files pass |
| **Code quality** | Biome + Knip — passes |
| **Build** | `bun build --compile` → `bin/mia.exe`, `bin/miad.exe` |
| **Tests** | 8/8 integration tests pass (with daemon running) |

---

## Verified Commands (All Pass)
```bash
bun run lint:md           # 0 errors
bun run validate:frontmatter  # 50/50 files
bun run lint              # passes (3 non-null assertion warnings in claude-adapter)
bun run build             # both binaries compile
bun test                  # 8/8 pass (requires: ./bin/miad.exe running in background)
```

---

## Key Files to Know
```
/c/Users/Soham/Downloads/AI/mia/
├── core/
│   ├── config/          # Phase 1 — single source of truth
│   ├── state/           # Phase 2 — deep module, injection-safe JSONL
│   ├── skills/          # Phase 3 — registry, executor, preamble
│   ├── daemon/          # Phase 4 — slim HTTP routes
│   ├── cli/             # Phase 5 — thin HTTP client
│   ├── generator/       # Phase 6 — template → skill docs
│   ├── hosts/           # Phase 7 — 4 adapters (Claude, Codex, Hermes, OpenClaw)
│   └── test/            # Phase 8 — runner, analyzer, judge
├── skills/              # Skill manifests + executors (source of truth)
├── docs/skills/         # Generated skill documentation
├── bin/mia.exe          # Compiled CLI
├── bin/miad.exe         # Compiled daemon
├── .github/workflows/ci.yml
├── .husky/              # pre-commit, commit-msg, pre-push
└── tests/integration.test.ts
```

---

## Next Steps (Phase 9+)

### Immediate
1. **Wire host adapters into CLI/daemon** — Currently adapters exist but aren't invoked. Add `--host` flag to `mia` command, register adapters at startup.
2. **Add adapter config** — `~/.mia/hosts.json` with API keys, model preferences
3. **Integration tests for adapters** — Mock HTTP or use test API keys

### Short-term
4. **Skill-to-host mapping** — Some skills may prefer specific hosts (e.g., `spec` → Claude for reasoning)
5. **Streaming output in CLI** — Surface `executeStreaming()` chunks in real-time
6. **Static analysis in CI** — Run `StaticAnalyzer` on changed files in PR

### Medium-term
7. **LLM Judge eval harness** — Nightly eval of skill outputs against golden datasets
8. **Diff-based test selection** — Only run tests affected by changed files
9. **Self-improvement loop** — Daemon learns from execution patterns, suggests skill updates

---

## Known Issues / Gotchas

| Issue | Location | Workaround |
|-------|----------|------------|
| Non-null assertions in claude-adapter | `core/hosts/claude-adapter.ts:104,139,198` | `this.client` guarded by `initialize()` — safe but biome warns |
| Tests require daemon | `tests/integration.test.ts` | Start `./bin/miad.exe` in background before `bun test` |
| `private` class fields in registry | `core/skills/registry.ts` | Uses `private` — works in TS but biome parses strictly |

---

## Architecture Principles (Non-Negotiable)
From MIA Codebase Design Philosophy:
- **Simple > Clever** — No overengineering
- **Deep Modules** — Simple interfaces, rich internals
- **Verification over Confidence** — CI gates, deterministic tests
- **Single Source of Truth** — Config, state, skills in one place
- **Bounded Contexts** — Each core/ module owns its domain
- **Harness > Model** — Infrastructure first, models plug in

---

## How to Resume

```bash
cd /c/Users/Soham/Downloads/AI/mia

# Start daemon (in background)
./bin/miad.exe &

# Run tests
bun test

# Or run full verification
bun run lint:md && bun run validate:frontmatter && bun run lint && bun run build && bun test

# Use CLI
./bin/mia.exe health
./bin/mia.exe grill
./bin/mia.exe plan
```

---

## Context for Next Agent

**You are continuing the MIA architecture implementation.** The core infrastructure is complete and verified. The immediate next step is **integrating the host adapters (Phase 7) into the actual execution pipeline** — currently they're built but not invoked.

**Start by:**
1. Adding a `--host` flag to `core/cli/index.ts`
2. Registering adapters at daemon startup in `core/daemon/server.ts`
3. Routing skill execution through the selected host adapter instead of local executors

**Reference files:**
- `core/hosts/registry.ts` — `getHostRegistry()`, `initializeHosts()`
- `core/hosts/claude-adapter.ts` — Example of full streaming implementation
- `core/skills/executor.ts` — Where execution currently happens locally
- `core/daemon/routes/command.ts` — Daemon route that calls `executeSkill()`

The foundation is solid. Build on it.