# MIA Agent Coordination Protocol

> One engineering system. Explicit stages. Evidence before progression.

## Purpose

This protocol coordinates independent agents working on MIA. Each agent has bounded authority and shares repository-visible handoffs so work can progress without contradictory writes or stale assumptions.

The protocol coordinates the development process. It does not replace MIA runtime state in `~/.mia/`.

## Canonical development flow

`TRIAGE → GRILL → PLAN → SPEC → EXECUTE → VERIFY → REVIEW → SHIP → LEARN`

The flow is serialized by work item. Repository-changing agents must establish the work item, scope, owner, and current branch before writing code.

## Agent pipeline

```text
SENTRY → PULSE → MAINTAINER → ORCHESTRATOR
```

The stages are serialized. A stage may act only after the previous stage has produced a valid handoff against the current integration branch.

## Integration branch

- The repository's default branch is the canonical integration branch.
- The current integration branch is `master`.
- Every coordinated PR must target `master`.
- `main` is not an integration branch for MIA.
- A stale, duplicated, or conflicting PR is evidence for `HOLD`, not permission to overwrite newer work.
- Historical branches may remain for traceability. They are not active work unless an explicit open PR points to them and that PR is current.

## Non-negotiable rules

1. Read `AGENTS.md`, `PRINCIPLES.md`, this protocol, and current shared state before acting.
2. Triage the relevant issue/PR before implementation.
3. Run a grill for ambiguous, architectural, or multi-file work.
4. Define executable acceptance criteria before implementation.
5. Use TDD for behavior and regressions: RED → GREEN → REFACTOR → VERIFY.
6. Inspect current `master`, open PRs, recent history, and branch ancestry before repository mutations.
7. Never use schedule timing as a dependency lock.
8. Missing, stale, malformed, duplicated, or conflicting handoff means `HOLD`.
9. One repository-changing writer at a time.
10. Sentry is review authority, Pulse is verification authority, Maintainer is repository-health authority, and Orchestrator is coordination authority.
11. No agent may approve, merge, or release its own work.
12. Evidence outranks agent confidence, PR summaries, or generated claims.
13. Do not silently widen scope or override another stage's authority.
14. Never create a second copy of an active cycle's state or handoff merely because another branch contains one.
15. Handoffs identify evidence. They do not grant merge authority.
16. Human review remains the final gate for consequential integration.

## Priority levels

- `P0`: integrity or destructive-risk emergency. Halt normal work.
- `P1`: broken integration branch, CI, build, tests, or verification path. Block normal feature work.
- `P2`: confirmed security issue, regression, or architectural invariant violation. Resolve before normal feature work.
- `P3`: important maintenance, dependency, documentation, configuration, or coordination drift.
- `P4`: planned feature, refactor, optimization, or enhancement.
- `P5`: opportunistic cleanup.

Higher-priority work may preempt the normal sequence, but the preemption must be recorded in shared state and the relevant handoff.

## Triage

Triage is required before implementation when work originates from an issue, PR, or agent proposal.

Triage must establish:

- the problem is still valid;
- the intended outcome is clear;
- the priority is appropriate;
- the owner is explicit;
- dependencies and conflicts are known;
- existing PRs are either reusable, superseded, or closed;
- the work has one canonical issue/PR path.

When a PR is stale or duplicated, close it with a clear reason and preserve useful work by reapplying only the required change onto current `master`.

## Grill

Grill is mandatory for non-trivial work.

The grill must answer:

- What problem are we solving?
- Why now?
- What is explicitly out of scope?
- What assumptions must be true?
- What are the failure modes?
- What is the smallest useful design?
- What evidence proves completion?
- What can remain deterministic instead of model-driven?

No implementation starts while critical ambiguity remains.

## Plan and spec

A plan must contain executable acceptance criteria and identify affected ownership boundaries.

A spec is required when the work changes:

- an interface or public contract;
- lifecycle/state transitions;
- agent/skill/harness behavior;
- persistence semantics;
- security or authority boundaries;
- architecture.

Do not create a spec for trivial maintenance that can be safely proven by focused checks.

## TDD

For behavior changes:

`RED → GREEN → REFACTOR → VERIFY`

- **RED**: create a focused failing test or executable acceptance check.
- **GREEN**: implement the smallest change that satisfies it.
- **REFACTOR**: remove duplication and keep ownership boundaries simple.
- **VERIFY**: rerun the focused check, then the required repository gate.

For a regression, the failure mode must become a repeatable test or an explicit documented exception.

## Stage contracts

### Sentry

Default mode: read-only.

Sentry:
- reviews correctness, architecture, security, scope, maintainability, and risk;
- establishes a baseline from current `master`;
- records findings with evidence and severity;
- does not implement or approve its own findings.

Sentry completion means a review baseline exists. It does not mean the repository is merge-ready.

### Pulse

Default mode: verification authority.

Pulse:
- reproduces Sentry findings;
- validates tests, static analysis, build, and CI behavior;
- distinguishes code failures from environment or infrastructure failures;
- may repair verification infrastructure only when the root cause is understood and the repair is proportionate;
- records the exact commit verified.

Pulse completion means the verification path is explicit and reproducible.

### Maintainer

Maintainer owns repository health.

Maintainer:
- addresses verified documentation, tooling, configuration, dependency, dead-code, and coordination drift;
- keeps changes small and reviewable;
- does not implement unrelated product features;
- preserves current product and benchmark work unless directly in scope.

### Orchestrator

Orchestrator owns coordination.

Orchestrator:
- reads all handoffs and current shared state;
- reconciles stage outputs against current `master`;
- prevents duplicate or stale coordination state;
- selects the next bounded objective from evidence and dependencies;
- prepares work for human integration;
- never bypasses review, verification, repository protections, or human merge authority.

## Required lifecycle

```text
TRIAGE
→ GRILL
→ CHECK STATE
→ CHECK HANDOFF
→ CHECK OPEN PRs/ISSUES
→ CHECK CONFLICTS
→ PLAN
→ SPEC when required
→ TDD
→ EXECUTE
→ VERIFY
→ REVIEW
→ SHIP GATE
→ LEARN
```

If an agent cannot establish a safe, non-conflicting scope, it must stop and report `HOLD`.

## Handoff requirements

Every handoff must include:

- cycle identifier;
- repository integration branch;
- exact HEAD or verification commit;
- objective and scope;
- findings or changes;
- checks executed and results;
- blocking issues;
- remaining uncertainty;
- recommended next action;
- explicit status: `COMPLETE`, `BLOCKED`, `HOLD`, or `FAILED`.

A handoff must describe the state actually observed. It must not claim that a later branch, later PR, or later test result existed at the time of the handoff.

## Evidence rules

- A PR description is not verification evidence.
- Historical CI is not verification of a changed head.
- A stage may only claim a commit is verified when the checks were actually run against that commit or a functionally identical immutable artifact.
- Generated coordination state must not become a second source of truth for runtime behavior.
- Runtime code and executable tests outrank prose.

## Conflict handling

When agents disagree or branches diverge:

1. Stop conflicting writes.
2. Preserve current `master`.
3. Prefer executable source and observed test behavior.
4. Check accepted ADRs and canonical principles.
5. Identify useful work.
6. Reapply only useful work against current `master`.
7. Record reconciliation in the Orchestrator handoff.
8. Escalate unresolved architecture or product decisions to human review.

## PR and issue hygiene

- Keep one canonical PR per change.
- Link implementation PRs to their source issue.
- Use labels and assignees to make ownership visible.
- Close superseded or duplicate PRs instead of leaving them in the active queue.
- Do not merge a PR solely because GitHub reports it as mergeable.
- A merge candidate must have current-base ancestry, current verification, review clearance, and explicit scope.
- Keep research checkpoints separate from implementation PRs.
- Keep product-companion work separate from core MIA runtime work.
- Close issues only when their acceptance criteria are actually satisfied.

## Shipping gate

Shipping requires:

1. current branch targets `master`;
2. no unresolved blocking review findings;
3. focused tests pass;
4. required repository verification passes;
5. diff and architecture review pass;
6. required human approval is explicit;
7. the work is linked to the correct issue;
8. handoff/state are reconciled against the exact shipped commit.

The `ship` skill does not itself push, merge, or bypass GitHub protections.

## Cycle completion

A cycle is complete only when:

- each required stage has a valid handoff;
- shared state names one authoritative cycle;
- verification status is explicit and current;
- no duplicate or stale active coordination state remains;
- current `master` contains the intended result;
- the Orchestrator handoff states the next action;
- the required issue is either completed or deliberately left open with a documented acceptance gap;
- human merge authority remains explicit.

A complete cycle can still require human approval before merge.
