# MIA Agent Coordination Protocol

> One engineering system. Explicit stages. Evidence before progression.

## Purpose

This protocol coordinates independent Jules agents working on MIA. Each agent has a bounded authority and shares repository-visible handoffs so work can progress without contradictory writes or stale assumptions.

The protocol coordinates the development process. It does not replace MIA runtime state in `~/.mia/`.

## Pipeline

```text
SENTRY → PULSE → MAINTAINER → ORCHESTRATOR
```

The stages are serialized. A stage may act only after the previous stage has produced a valid handoff against the current integration branch.

## Integration branch

- The repository's default branch is the canonical integration branch.
- At the time of this protocol, that branch is `master`.
- Do not assume `main` is current merely because another PR targets it.
- Every coordinated PR must target the current integration branch.
- A stale, duplicated, or conflicting PR is evidence for `HOLD`, not permission to overwrite newer work.

## Non-negotiable rules

1. Read `AGENTS.md`, `PRINCIPLES.md`, this protocol, and current shared state before acting.
2. Inspect the current integration branch, open pull requests, and recent relevant history.
3. Never use schedule timing as a dependency lock.
4. Missing, stale, malformed, duplicated, or conflicting handoff means `HOLD`.
5. One repository-changing writer at a time.
6. Sentry is review authority, Pulse is verification authority, Maintainer is repository-health authority, and Orchestrator is coordination/execution authority.
7. No agent may approve, merge, or release its own work.
8. Preserve unrelated changes. Never rewrite shared history or force-push.
9. Evidence outranks agent confidence, PR summaries, or generated claims.
10. Do not silently widen scope or override another stage's authority.
11. Record facts, inferences, and uncertainty separately.
12. Convert repeated failures into tests, checks, rules, tooling, or focused documentation.
13. Never create a second copy of an active cycle's state or handoff merely because another branch contains one.
14. Handoffs identify evidence; they do not grant merge authority.
15. Human review remains the final gate for consequential integration.

## Priority levels

- `P0`: integrity or destructive-risk emergency. Halt normal work.
- `P1`: broken integration branch, CI, build, tests, or verification path. Block normal feature work.
- `P2`: confirmed security issue, regression, or architectural invariant violation. Resolve before normal feature work.
- `P3`: important maintenance, dependency, documentation, configuration, or coordination drift.
- `P4`: planned feature, refactor, optimization, or enhancement.
- `P5`: opportunistic cleanup.

Higher-priority work may preempt the normal sequence, but the preemption must be recorded in shared state and the relevant handoff.

## Stage contracts

### Sentry

Default mode: read-only.

Sentry:
- reviews correctness, architecture, security, scope, maintainability, and risk
- establishes a baseline from the current integration branch
- records findings with evidence and severity
- does not implement or approve its own findings

Sentry completion means a review baseline exists. It does not mean the repository is merge-ready.

### Pulse

Default mode: read-only.

Pulse:
- validates Sentry findings through reproducible checks
- distinguishes code failures from CI, dependency, environment, and infrastructure failures
- may repair verification infrastructure only when the root cause is understood and the repair is proportionate
- records exact checks and results

Pulse completion means the verified findings and verification path are explicit.

### Maintainer

Maintainer owns repository health.

Maintainer:
- addresses verified documentation drift, tooling drift, dependency/configuration issues, dead code, and narrowly scoped health work
- keeps changes small and reviewable
- does not implement unrelated product features
- preserves current product and benchmark work unless directly in scope

### Orchestrator

Orchestrator is the coordination and execution stage.

Orchestrator:
- reads all available handoffs and current shared state
- reconciles the stage outputs against the current integration branch
- selects the next bounded objective from evidence and dependencies
- prevents duplicate or stale coordination state
- prepares the repository for human integration
- never bypasses review, verification, repository protections, or human merge authority

## Required lifecycle

```text
ORIENT
→ CHECK STATE
→ CHECK HANDOFF
→ CHECK CONFLICTS
→ WORK WITHIN AUTHORITY
→ VERIFY
→ WRITE HANDOFF
→ UPDATE STATE
```

If an agent cannot establish a safe, non-conflicting scope, it must stop and report `HOLD`.

## Handoff requirements

Every handoff must include:

- cycle identifier
- repository integration branch
- HEAD or relevant verification commit
- objective and scope
- findings or changes
- checks executed and results
- blocking issues
- remaining uncertainty
- recommended next action
- explicit status: `COMPLETE`, `BLOCKED`, `HOLD`, or `FAILED`

A handoff must describe the state actually observed. It must not claim that a later branch, later PR, or later test result existed at the time of the handoff.

## Conflict handling

When agents disagree or branches diverge:

1. Stop conflicting writes.
2. Preserve the current integration branch.
3. Prefer executable source and observed test behaviour.
4. Check accepted ADRs and canonical principles.
5. Identify which work is still useful.
6. Reapply only that useful work against the current integration branch.
7. Record the reconciliation in the Orchestrator handoff.
8. Escalate unresolved architecture or product decisions to human review.

## Cycle completion

A cycle is complete only when:

- each required stage has a valid handoff
- shared state names one authoritative cycle
- verification status is explicit
- no duplicate or stale coordination state remains
- the current integration branch contains the intended result
- the Orchestrator handoff states the next action
- human merge authority remains explicit

A complete cycle can still require human approval before merge.
