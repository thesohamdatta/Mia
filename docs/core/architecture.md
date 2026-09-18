# MIA Architecture

> **Simple. Deep. Evolvable.** The harness is more important than the model.

## System overview

MIA is a compiled Bun CLI with direct skill execution.

```text
┌──────────────────────────────────────────────────────────────┐
│                            MIA                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CLI → ExecutionContext → Middleware → Skill Executor        │
│                         │                     │              │
│                         │                     ├→ local files │
│                         │                     ├→ UnifiedStore│
│                         │                     └→ host adapter│
│                         │                                    │
│                         └→ Config                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

There is no current daemon in this architecture. The old CLI → HTTP → daemon path was removed as an accepted architectural change and is retained only in the decision record for historical context.

## Core components

| Component | Current implementation | Purpose |
| :--- | :--- | :--- |
| **CLI** | `core/cli/index.ts` | Parses `mia <skill> [args...]` and dispatches directly |
| **Context** | `core/context.ts` | Carries cwd, project slug, config, and shared store |
| **Skills** | `core/skills/` | Small executable use-case modules |
| **Middleware** | `core/skills/preamble.ts` | Project checks, recent learnings, timeline logging |
| **State** | `core/state/` | JSONL storage interfaces and `UnifiedStore` |
| **Config** | `core/config/` | Local defaults, config-file loading, environment overrides |
| **Hosts** | `core/hosts/` | Optional integrations with external or local AI hosts |
| **Docs generator** | `core/generator/` | Skill documentation generation utility |
| **Tests** | `core/test/` | Current regression and integration-oriented coverage |

## Execution flow

```text
user
 ↓
mia <skill> [args]
 ↓
core/cli/index.ts
 ↓
createExecutionContext()
 ↓
executeWithMiddlewares()
 ↓
skill executor
 ↓
SkillResult
 ↓
timeline / learning / checkpoint persistence
```

The normal command path is in-process. There is no HTTP hop and no second MIA process to start.

## Project state

By default:

```text
~/.mia/
├── memory.md
├── skills/
├── projects/
│   └── <slug>/
│       └── events.jsonl
└── sessions/
```

Project slugs come from the git repository root name. When no git repository is available, MIA uses `default`.

`events.jsonl` stores typed events:

- `learning`
- `timeline`
- `checkpoint`

The append/query surface is exposed by `UnifiedStore`.

## Skills

The current executable map in `core/skills/index.ts` contains:

### Workflow
- `grill`
- `plan`
- `spec`
- `review`
- `health`
- `ship`

### Learning and state
- `learn`
- `retro`
- `memory`
- `checkpoint`

### Version control
- `vc`

Skills are imported directly into the map. The current runtime does not depend on filesystem scanning to discover the executable command set.

## Middleware

The current middleware chain is intentionally small:

```text
requireProject
    ↓
loadRecentLearnings
    ↓
logTimelineStart
    ↓
skill executor
    ↓
logTimelineComplete
```

This keeps cross-cutting behaviour separate from skill logic without recreating a service layer around the CLI.

## Host adapters

The host layer defines a stable adapter interface.

Current implementations include:

- Claude
- Codex
- Hermes
- OpenCode

These adapters provide integration boundaries for model hosts. They are not required for the core local CLI execution path.

## Configuration

The config layer currently loads in this order:

1. built-in defaults
2. `~/.mia/config.json` when present
3. environment-variable overrides

Relevant environment variables include:

```text
MIA_DIR
MIA_SKILLS_DIR
MIA_PROJECTS_DIR
MIA_STATE_FILE
MIA_MEMORY_FILE
MIA_TELEMETRY
MIA_AUTO_RESTART
MIA_HOT_RELOAD
```

The schema still contains a few daemon-related fields from the earlier architecture. Those are compatibility residue, not evidence that the current CLI runs a daemon.

## Design rules

### Simple

Use the smallest mechanism that solves the problem.

### Deep

Keep interfaces small and push complexity behind them.

### Evolvable

Prefer boundaries that let individual skills, stores, and adapters change independently.

### Verifiable

Treat tests, typechecks, linting, and targeted checks as evidence, not ceremony.

## Historical note

MIA originally used a CLI + daemon architecture with HTTP and a separate `miad` process.

ADR-0001 records why that was removed. The current code and accepted ADR define the present architecture.

See [`docs/decisions/ADR-0001-eliminate-daemon.md`](../decisions/ADR-0001-eliminate-daemon.md).