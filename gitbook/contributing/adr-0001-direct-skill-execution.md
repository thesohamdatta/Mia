# ADR-0001: Eliminate the daemon

**Status:** Accepted

## Context

MIA previously used a CLI communicating over HTTP with a separate daemon. This added another process and lifecycle management without a demonstrated need for an independent service.

## Decision

Execute skills directly inside the CLI process:

```text
mia <skill> → execution context → middleware
            → skill executor → shared store and local files
```

The daemon and HTTP control plane are not part of the current runtime.

## Consequences

Benefits include a single normal execution path, fewer moving parts, direct skill testing, and explicit skill wiring.

Trade-offs remain: concurrent writers to the same local JSONL file need care, background work is not provided by a daemon, and host integrations remain separate concerns.

Consider a background service only if a concrete requirement cannot be met cleanly through direct process execution.

Canonical source: [ADR-0001 in the repository](https://github.com/thesohamdatta/Mia/blob/master/docs/decisions/ADR-0001-eliminate-daemon.md).