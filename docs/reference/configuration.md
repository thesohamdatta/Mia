# Configuration and local state

The active MIA CLI has a deliberately small configuration contract. This page documents the runtime path that is currently wired into execution; it does not describe every configuration type present in the repository.

## State root: `MIA_DIR`

Set `MIA_DIR` to choose the root directory for MIA's local state. When the variable is unset, MIA defaults to `~/.mia`.

The runtime derives its state paths from that root, including project records, memory, skills, and sessions.

Example for a temporary shell session:

```bash
MIA_DIR=/tmp/mia-state bun run core/cli/index.ts --help
```

This example is for POSIX-compatible shells. On Windows, set the environment variable using the syntax for your shell.

## Project identity

MIA derives the project slug from the Git repository root. When it cannot identify a Git repository, the runtime falls back to `default`.

Project event data is stored beneath the configured projects directory. The current event store uses an append-oriented `events.jsonl` file for event types such as learning, timeline, checkpoint, evidence, and approval.

## What is not part of the active contract

The repository contains a broader `core/config/ConfigLoader` with JSON and environment override support. That loader is not currently wired into `createExecutionContext()`; do not assume every option represented in that schema changes active CLI behaviour.

When configuration behaviour changes, update this page only after tracing the active execution path and its tests.
