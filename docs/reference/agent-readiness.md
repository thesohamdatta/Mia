---
type: reference
scope: project
status: active
owner: architecture
canonical: true
audience: agent
load: on-demand
title: "Agent readiness"
last_updated: "2026-10-11"
---

# Agent readiness

Agent readiness is the deterministic feedback a codebase gives an agent while it works. A codebase with more of this feedback lets an agent run longer on harder tasks without a human stepping in. A codebase without it degrades faster when more work is handed to agents.

The `factory` skill assesses eight areas and reports a status for each:

```bash
mia factory readiness
```

The command is read-only. It inspects the repository at the current working directory, or at a path passed as the first argument, and writes nothing.

## The eight areas

Each area has one or more probes. A probe is a deterministic check with recorded evidence. The status is derived from the probes:

| Status | Meaning |
|---|---|
| `ready` | The area has the checks an agent needs. |
| `partial` | Some probes pass; the area needs more coverage. |
| `missing` | No probe passes; the area needs to be built. |

| Area | What it checks | Ready when |
|---|---|---|
| Validation | a lint or format command or config, and a type checker | both probes pass |
| Build systems | a documented build command, and a build step in CI | both probes pass |
| Feedback loops | a test command, and at least one test file | both probes pass |
| Documentation | a README, agent instructions, and evidence or contribution docs | at least two probes pass |
| Reproducible environments | a lockfile, a pinned runtime, and a container or dev environment | at least two probes pass |
| Modular code | bounded source module directories, and an ownership or architecture entry point | both probes pass |
| Observability | a log or error signal in source, and a health or verification command | both probes pass |
| Security scanning | a security scan workflow or config, and secrets excluded from version control | a scan is configured |

The readiness score is the share of areas that are `ready`. The command reports the score, the counts per status, and the failing probes with a recommendation for each area that is not ready.

## Reading the result

A `ready` area means the checks exist; it does not mean the checks are good. The readiness command measures presence and structure, not coverage or correctness. Use it to find the next path to pave, then verify the paved path with the repository's own checks.

For MIA itself the assessment is stable and mostly ready. The security-scanning area is `partial` because the repository has no security scan workflow, even though secrets are excluded from version control. The reproducible-environments area is `ready` on the lockfile and pinned-runtime probes but has no container definition. Those are recorded facts, not judgements.

## Why this matters for the factory

Readiness is the limit on autonomy. Linters, type checkers, security scans, tests, and other pass/fail checks give an agent feedback while it works. With more of these checks, an agent can work longer on harder tasks before a human has to intervene. If you can frame a problem as the set of verification systems that need to validate it, you can hand that problem to an agent with a bounded definition of done.

## Related

- [The MIA software factory](../core/software-factory.md)
- [Factory metrics](factory-metrics.md)
- [Testing and verification](testing-strategy.md)
