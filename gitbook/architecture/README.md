# Architecture

MIA is a compiled Bun CLI with direct skill execution. Its normal command path is in-process: no separate daemon or HTTP hop is required.

```text
CLI → execution context → capability admission → middleware
    → skill executor → result → UnifiedStore / local files
```

## Core components

- **CLI:** parses commands and dispatches to the skill map.
- **Execution context:** carries working directory, project identity, configuration, granted capabilities, and shared state.
- **Skills:** implement focused engineering workflows.
- **Middleware:** handles shared pre/post-execution behaviour.
- **UnifiedStore:** provides the persistence boundary for project events.
- **Verification:** supplies repeatable evidence about repository state.

## Local state

The active runtime uses `MIA_DIR`, defaulting to `~/.mia`. Project state includes memory and per-project event records. Project identity is derived from the Git repository root; outside a repository, MIA falls back to a default identity.

## Host boundary

An agent host such as Claude Code or Codex owns its model loop, tool routing, and session lifecycle. MIA provides engineering workflows, capability requirements, durable work state, and verification evidence around that host.

See [Memory and checkpoints](memory-and-checkpoints.md) and [ADR-0001](../contributing/adr-0001-direct-skill-execution.md).