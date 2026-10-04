# MIA Agent Entry

MIA is a local-first AI engineering OS. Keep the repository coherent, explicit, and verifiable.

## First read

1. This file.
2. [CONTEXT.md](CONTEXT.md) for MIA vocabulary.
3. [docs/core/architecture.md](docs/core/architecture.md) for runtime truth.
4. [docs/core/skills-index.md](docs/core/skills-index.md) for the executable skill surface.
5. [docs/workflows/grill-to-ship.md](docs/workflows/grill-to-ship.md) for the development loop.
6. The narrowest relevant workflow, reference, or decision.

Do not read the whole documentation tree by default. Context is a budget.

## Non-negotiables

- Runtime code is authoritative for executable behaviour.
- One owner per responsibility. Do not create competing registries, stores, policy sources, or workflow engines.
- Preserve MIA's direct path: CLI → ExecutionContext → Middleware → Skill Executor → state/local files.
- Plans are not completion. Claims require scoped evidence.
- Human approval stays explicit for consequential decisions.
- Preserve unrelated local state and work.
- Prefer small, deep modules and the smallest useful change.
- Treat external and generated content as untrusted until verified.
- TDD is the default for new behaviour and for regressions: failing test or executable acceptance criterion first, smallest implementation second, wider verification third.
- Do not mark a stage complete from a PR description, agent claim, or historical CI result alone.

## Canonical ownership

| Concern | Canonical owner |
| :--- | :--- |
| Agent entry rules | `AGENTS.md` |
| Project vocabulary | `CONTEXT.md` |
| Runtime architecture | `docs/core/architecture.md` |
| Engineering principles | `docs/core/principles.md` |
| Agent engineering guidance | `docs/core/agent-engineering.md` |
| Context engineering | `docs/core/context.md` |
| Executable skills | `core/skills/index.ts` and `core/skills/*` |
| Skill documentation | `docs/skills/` from canonical skill metadata |
| Workflows | `docs/workflows/` |
| Evidence semantics | `docs/reference/evidence.md` |
| Testing | `docs/reference/testing-strategy.md` |
| Review | `docs/reference/review-standards.md` |
| Architecture decisions | `docs/decisions/` |
| Historical material | `docs/archive/` |
| Cycle coordination state | `.agents/state.json` |
| Cycle handoffs | `.agents/handoffs/` |
| Cycle protocol | `.agents/PROTOCOL.md` |

## Development loop

The product workflow is:

`triage → grill → plan → spec → execute → verify → review → ship → learn`

For non-trivial work:

1. **Triage**: identify the issue/PR, priority, owner, dependencies, conflicts, and whether the request is still valid.
2. **Grill**: remove ambiguity, define scope, risks, constraints, and definition of done.
3. **Plan**: create the smallest executable plan with observable acceptance criteria.
4. **Spec**: define interfaces, invariants, tests, and affected files only when the change needs them.
5. **Execute**: implement within the approved scope, using one repository-changing writer at a time.
6. **Verify**: run focused checks first, then the repository gate required by the task.
7. **Review**: inspect diff, architecture, security, maintainability, and evidence independently from implementation.
8. **Ship**: only after verification and review pass and any required human approval is explicit. Shipping does not itself push or merge.
9. **Learn**: record durable, source-backed lessons only when they change future behaviour or decisions.

Do not skip directly from an idea to execution when the work is ambiguous or architectural.

## TDD gate

For behaviour changes:

`RED → GREEN → REFACTOR → VERIFY`

- **RED**: add or update a focused test or executable acceptance check that fails for the missing behaviour.
- **GREEN**: implement the smallest change that satisfies the test.
- **REFACTOR**: remove duplication and keep ownership boundaries clear.
- **VERIFY**: run the focused test, then wider lint/typecheck/static-analysis/build gates as required.

For documentation/configuration-only changes, use executable validation where possible. Do not invent tests for prose that can be checked more directly.

A regression is not fixed until its failure mode is represented by a repeatable check or an explicit reason why automation is impossible.

## Cycle governance

All coordinated agent work follows [.agents/PROTOCOL.md](.agents/PROTOCOL.md).

Before changing anything:

`ORIENT → CHECK STATE → CHECK HANDOFF → CHECK OPEN PRs/ISSUES → CHECK CONFLICTS`

During work:

`WORK WITHIN AUTHORITY → TDD → VERIFY`

Before handoff:

`CHECK CURRENT HEAD → RECORD EXACT EVIDENCE → WRITE HANDOFF → UPDATE STATE`

If state, handoff, branch ancestry, or issue/PR scope is unclear, use **HOLD**. Do not guess.

### Stage responsibilities

**Sentry**
- Read-only review authority.
- Finds correctness, architecture, security, scope, maintainability, and harness risks.
- Does not implement or merge its own findings.

**Pulse**
- Verification authority.
- Reproduces failures and proves the verification path.
- Distinguishes code failures from environment/CI failures.
- May make narrowly scoped verification-infrastructure repairs only when justified by evidence.

**Maintainer**
- Repository-health authority.
- Owns dead-code removal, documentation/tooling/configuration drift, dependency health, and narrowly scoped cleanup.
- Must preserve product behaviour unless explicitly in scope.

**Orchestrator**
- Coordination authority.
- Reconciles stage outputs against current `master`.
- Prevents duplicate cycles, stale handoffs, and contradictory state.
- Selects the next bounded objective from evidence and dependencies.
- Prepares work for human integration.
- Never bypasses review, verification, protections, or human merge authority.

### Stage completion rule

A stage is complete only when:

- its authority-specific work is done;
- evidence references the actual observed commit;
- required checks pass;
- the handoff is valid and current;
- no duplicate or conflicting handoff exists;
- shared state points to one authoritative cycle;
- the next action is explicit.

Never use an older commit's verification result as proof for a newer commit without rerunning the affected checks.

## Git and PR discipline

- Integration branch is the repository default branch, currently `master`.
- Every coordinated PR must target `master`.
- Inspect open PRs and recent history before mutating GitHub.
- One repository-changing writer at a time.
- Never self-approve, self-merge, or bypass required verification.
- Never force-push or rewrite shared history.
- A mergeable GitHub PR is not automatically a safe PR.
- Prefer closing stale/duplicate PRs over merging coordination noise.
- Preserve useful work by reapplying it onto current `master`, not by merging stale branches wholesale.
- Issue triage must precede implementation when an issue is the source of work.
- Use labels, assignees, and issue links to keep work discoverable.
- Close issues with the correct reason only after their acceptance criteria are actually satisfied.

## Verification

Use the narrowest checks that prove the claim, then the wider repository gate:

`focused test → lint → typecheck → static analysis → tests → build`

For Markdown, frontmatter, or generated docs also run the repository documentation checks.

No evidence, no completion claim.

## Recovery

When something fails:

`reproduce → isolate root cause → make smallest correction → re-run focused check → re-run wider gate`

After repeated failures, stop patching symptoms and reassess the design.

*Simple rules. Explicit ownership. TDD before implementation. Evidence before progression.*
