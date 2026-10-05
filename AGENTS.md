# MIA Agent Entry

MIA is a local-first AI engineering OS. Keep the repository coherent, explicit, and verifiable.

## First Read & Context Router

Load depth progressively as required by the task:

1. This file.
2. [CONTEXT.md](CONTEXT.md) for MIA vocabulary.
3. [docs/core/architecture.md](docs/core/architecture.md) for runtime truth.
4. [docs/core/skills-index.md](docs/core/skills-index.md) for executable skill surface.
5. [docs/workflows/grill-to-ship.md](docs/workflows/grill-to-ship.md) for the development loop.
6. Relevant canonical docs: [docs/core/principles.md](docs/core/principles.md), [docs/core/agent-engineering.md](docs/core/agent-engineering.md), [docs/core/context.md](docs/core/context.md), [docs/reference/evidence.md](docs/reference/evidence.md), [docs/reference/testing-strategy.md](docs/reference/testing-strategy.md), [docs/reference/review-standards.md](docs/reference/review-standards.md), [.agents/PROTOCOL.md](.agents/PROTOCOL.md).

## Non-Negotiables

- Executable source code is authoritative over prose.
- One owner per responsibility. Do not create competing registries or workflow engines.
- Preserve direct path: CLI → ExecutionContext → Middleware → Skill Executor → store/files.
- TDD default (`RED → GREEN → REFACTOR → VERIFY`). Claims require scoped executable evidence.
- Human approval stays explicit for consequential decisions.
- Context is a budget. Use progressive disclosure; do not read whole repository by default.

## Canonical Ownership

| Concern | Canonical owner | Concern | Canonical owner |
| :--- | :--- | :--- | :--- |
| Entry rules | `AGENTS.md` | Vocabulary | `CONTEXT.md` |
| Architecture | `docs/core/architecture.md` | Principles | `docs/core/principles.md` |
| Agent Guidance | `docs/core/agent-engineering.md` | Context Engineering | `docs/core/context.md` |
| Executable Skills | `core/skills/index.ts` & `core/skills/*` | Workflows | `docs/workflows/` |
| Testing Strategy | `docs/reference/testing-strategy.md` | Review Standards | `docs/reference/review-standards.md` |
| Evidence Semantics | `docs/reference/evidence.md` | Coordination State | `.agents/state.json` & `.agents/PROTOCOL.md` |

## Development Loop & Governance

- Product workflow: `triage → grill → plan → spec → execute → verify → review → ship → learn`.
- Agent pipeline: `SENTRY → PULSE → MAINTAINER → ORCHESTRATOR` (see [.agents/PROTOCOL.md](.agents/PROTOCOL.md)).
- Stage completion rule: Complete only when work is done, evidence names exact observed commit, checks pass, and state/handoff is valid.

## Git & PR Discipline

- Target integration branch `master`. One repository-changing writer at a time.
- Never self-approve, self-merge, force-push, or bypass required verification.
- Close stale/duplicate PRs; preserve useful work by reapplying onto current `master`.
- Verification sequence: focused test → lint → typecheck → static analysis → tests → build.
- Recovery: reproduce → isolate root cause → smallest correction → re-run checks.
