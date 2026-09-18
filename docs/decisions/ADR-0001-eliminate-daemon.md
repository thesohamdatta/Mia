# ADR-0001: Eliminate Daemon — Direct Skill Execution

## Status

Accepted

## Context

MIA originally used a CLI + daemon architecture:

```text
mia CLI
  ↓ HTTP
miad daemon
  ↓
skill registry
  ↓
state
```

The daemon added a second process, an HTTP control path, lifecycle management, and state around a service that had no external consumers.

The application data itself was already persisted locally. The daemon therefore became an additional layer rather than a necessary boundary.

## Decision

**Execute skills directly inside the CLI process.**

The accepted architecture is:

```text
mia <skill>
  ↓
ExecutionContext
  ↓
middleware
  ↓
skill executor
  ↓
UnifiedStore / local files / optional host adapters
```

The daemon and its HTTP control plane are not part of the current runtime.

## Consequences

### Positive

- one normal CLI execution path
- no daemon lifecycle to manage
- no HTTP hop for local skill execution
- easier direct skill testing
- explicit skill wiring
- shared `UnifiedStore` boundary
- smaller conceptual surface

### Trade-offs

Direct local execution means:

- concurrent writers to the same JSONL file still need care
- long-running background work is not provided by a daemon
- host integrations remain separate concerns
- process-local state disappears when the command exits

These are accepted trade-offs for the current use case.

## Current implementation

The decision is reflected in:

- `core/cli/index.ts`
- `core/context.ts`
- `core/skills/index.ts`
- `core/skills/preamble.ts`
- `core/state/unified-store.ts`

## Configuration note

The current configuration schema still contains a small amount of daemon-era configuration such as port, idle timeout, and token fields.

Those fields are compatibility residue in the config layer. They do not mean that the current CLI launches or depends on a daemon.

## Historical note

Older planning and reference documents may still mention `miad`, HTTP routes, separate learning/timeline files, or broader future skill ecosystems.

Treat those as historical material unless the current source tree confirms the behaviour.

## Revisit condition

Reintroduce a background service only when there is a concrete requirement that direct process execution cannot satisfy cleanly, such as a demonstrated cross-process coordination need or a necessary long-running capability.

Until then, keep the core simple.