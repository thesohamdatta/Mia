# MIA Agent Entry Router

MIA is a local-first AI engineering OS (`CLI → ExecutionContext → Middleware → Skill Executor → state/local files`).
Keep the repository simple, deep, evolvable, explicit, and verifiable. Context is a budget—read narrowly.

## Canonical Router

| Concern | Canonical Document |
| :--- | :--- |
| Project Vocabulary | [CONTEXT.md](CONTEXT.md) |
| System Architecture | [docs/core/architecture.md](docs/core/architecture.md) |
| Context Engineering | [docs/core/context.md](docs/core/context.md) |
| Core Principles | [docs/core/principles.md](docs/core/principles.md) |
| Agent Engineering | [docs/core/agent-engineering.md](docs/core/agent-engineering.md) |
| Executable Skills | [docs/core/skills-index.md](docs/core/skills-index.md) & `core/skills/` |
| Workflows | [docs/workflows/](docs/workflows/) & [docs/workflows/grill-to-ship.md](docs/workflows/grill-to-ship.md) |
| Testing Strategy | [docs/reference/testing-strategy.md](docs/reference/testing-strategy.md) |
| Review Standards | [docs/reference/review-standards.md](docs/reference/review-standards.md) |
| Evidence Semantics | [docs/reference/evidence.md](docs/reference/evidence.md) |

## Non-Negotiables

- **Executable Truth**: Runtime code and passing tests outrank prose, summaries, or claims.
- **Single Ownership**: Preserve MIA's execution pipeline. Do not introduce duplicate stores, registries, or engines.
- **TDD First**: `RED → GREEN → REFACTOR → VERIFY`. Fail first for new behavior or regressions.
- **Verification Gate**: No claim without evidence. Focused test → typecheck → lint → full repo gate.
- **Git Discipline**: Target `master`. Keep PRs focused. Never force-push, self-approve, or self-merge.
- **Human Control**: Do not change repository settings, secrets, release/tag state, or deployment settings without explicit human instruction.

## Development Loop

`triage → grill → plan → spec → execute → verify → review → ship → learn`

*Simple rules. Explicit ownership. TDD before implementation. Evidence before progression.*
