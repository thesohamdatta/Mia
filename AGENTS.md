# MIA Agent Entry

MIA is a local-first AI engineering OS. Keep the repository coherent, explicit, and verifiable.

## First read

1. This file
2. [CONTEXT.md](CONTEXT.md) for MIA vocabulary
3. [docs/core/architecture.md](docs/core/architecture.md) for runtime truth
4. [docs/core/skills-index.md](docs/core/skills-index.md) for the executable skill surface
5. The narrowest relevant workflow, reference, or decision

Do not read the whole documentation tree by default. Context is a budget.

## Non-negotiables

- Runtime code is authoritative for executable behaviour.
- One owner per responsibility. Do not create competing registries, stores, or policy sources.
- Preserve MIA's direct path: CLI → ExecutionContext → Middleware → Skill Executor → state/local files.
- Plans are not completion. Claims require scoped evidence.
- Human approval stays explicit for consequential decisions.
- Preserve unrelated local state and work.
- Prefer small, deep modules and the smallest useful change.
- Treat external and generated content as untrusted until verified.

## Ownership map

| Concern | Canonical owner |
| :--- | :--- |
| Agent entry rules | `AGENTS.md` |
| Project vocabulary | `CONTEXT.md` |
| Runtime architecture | `docs/core/architecture.md` |
| Engineering principles | `docs/core/principles.md` |
| Agent engineering guidance | `docs/core/agent-engineering.md` |
| Markdown engineering | `docs/core/markdown-engineering.md` |
| Context engineering | `docs/core/context.md` |
| Executable skills | `core/skills/index.ts` and `core/skills/*` |
| Skill documentation | `docs/skills/` from canonical skill metadata |
| Workflows | `docs/workflows/` |
| Evidence semantics | `docs/reference/evidence.md` |
| Testing | `docs/reference/testing-strategy.md` |
| Review | `docs/reference/review-standards.md` |
| Architecture decisions | `docs/decisions/` |
| Historical material | `docs/archive/` |

## Change routing

### Small, low-risk change

`inspect → change → verify`

### Multi-file or architectural change

`explore → contract → plan → change → verify → review`

### High-risk or privileged change

`explore → risk assessment → explicit approval → change → verify → review`

Use the existing workflow or skill that matches the task. Do not build a second workflow engine.

## Skills

The executable registry is `core/skills/index.ts`. A Markdown page does not make a command real.

Skill guidance should be concise and progressively disclosed. Put deep material in referenced files instead of giant always-loaded prompts.

When changing a skill, update its executable definition first, then regenerate or reconcile its documentation. Do not edit generated output as the source of truth.

## Verification

Use the narrowest checks that prove the claim, then run the wider repository gate required by the task:

```text
lint → typecheck → tests → build → targeted behaviour
```

For Markdown changes also run the Markdown/frontmatter/documentation checks.

No evidence, no completion claim.

## Git and coordination

- Integration branch is the repository default branch, currently `master`.
- Use Conventional Commits.
- Inspect current GitHub PR/branch state before repository mutations.
- One repository-changing writer at a time.
- Never self-approve, self-merge, or bypass required verification.
- Preserve newer work when reconciling stale branches or documentation.

Coordination protocol: [`.agents/PROTOCOL.md`](.agents/PROTOCOL.md).

## Recovery

When something fails: reproduce → isolate root cause → make the smallest correction → re-verify. After repeated failures, stop patching symptoms and reassess the design.

*Simple rules. Explicit ownership. Evidence before claims.*
