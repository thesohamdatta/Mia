# MIA Agent Coordination Protocol

> One engineering system. Explicit stages. Evidence before progression.

## Purpose

This protocol coordinates autonomous Jules agents working on MIA. It does not replace MIA's runtime state in `~/.mia/`; it provides repository-visible coordination for scheduled agents running in separate environments.

## Pipeline

```text
SENTRY → PULSE → MAINTAINER → ORCHESTRATOR
```

A stage is unlocked only when the previous stage has produced a valid handoff and the shared state permits progression.

## Non-negotiable rules

1. Read `AGENTS.md`, `PRINCIPLES.md`, this protocol, and current shared state before acting.
2. Inspect the current branch, open pull requests, and recent relevant changes.
3. Never assume schedule timing is a dependency lock.
4. Missing, stale, malformed, or conflicting handoff means `HOLD`.
5. One repository-changing writer at a time.
6. Sentry is review authority, Pulse is verification authority, Maintainer is repository-health authority, and Orchestrator is coordination/execution authority.
7. No agent may approve, merge, or release its own work.
8. Preserve unrelated changes and never rewrite shared history or force-push.
9. Evidence outranks agent confidence, summaries, and PR claims.
10. Do not silently widen scope or override another agent's authority.
11. Record facts, inferences, and uncertainty separately.
12. Convert repeated failures into tests, checks, rules, tooling, or focused documentation.

## Priority levels

- `P0`: integrity or destructive-risk emergency. Halt normal work.
- `P1`: broken main branch, CI, build, tests, or verification path. Block normal feature work.
- `P2`: confirmed security issue, regression, or architectural invariant violation. Resolve before normal feature work.
- `P3`: important maintenance, dependency, documentation, or configuration drift.
- `P4`: planned feature, refactor, optimization, or enhancement.
- `P5`: opportunistic cosmetic cleanup.

Higher-priority work may preempt the normal sequence, but the preemption must be recorded in `state.json` and the relevant handoff.

## Stage contracts

### Sentry

- Default mode: read-only.
- Review correctness, architecture, security, scope, maintainability, and risk.
- Produce findings with evidence and severity.
- Do not implement or approve its own findings.

### Pulse

- Default mode: read-only.
- Validate Sentry findings and repository claims through reproducible checks.
- Classify failures and distinguish code failures from CI, dependency, environment, and infrastructure failures.
- May repair verification infrastructure only when the root cause is understood and the repair is proportionate.

### Maintainer

- Own repository health and sustainable evolution.
- Address verified drift, stale documentation, maintenance tooling, dependency configuration, dead code, and narrowly scoped health improvements.
- Do not implement unrelated product features.

### Orchestrator

- Read all available handoffs and shared state.
- Select the next bounded objective based on priority, evidence, and dependencies.
- Execute only when the preceding stage is complete and no blocking priority exists.
- Do not bypass review, verification, human approval, or repository protections.

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

If the agent cannot establish a safe, non-conflicting scope, it must stop and report `HOLD`.

## Handoff requirements

Every handoff must include:

- cycle identifier
- repository HEAD or relevant commit
- objective and scope
- findings or changes
- checks executed and results
- blocking issues
- remaining uncertainty
- recommended next action
- explicit status: `COMPLETE`, `BLOCKED`, `HOLD`, or `FAILED`

## Learning loop

```text
observation → evidence → root cause → lesson → rule → enforcement → measurement
```

Do not record vague claims such as “the agent learned.” Record reusable knowledge and, when practical, encode it in tests, CI, linting, tooling, or canonical documentation.

## Conflict resolution

When agents disagree:

1. Preserve the repository and stop conflicting writes.
2. Prefer current executable source and observed test behaviour.
3. Check accepted ADRs and canonical principles.
4. Record the disagreement and evidence.
5. Escalate unresolved architectural or product decisions to human review.

## Completion rule

A cycle is complete only when the active stage has a valid handoff, shared state is updated, verification status is explicit, and the next stage is either unlocked or deliberately blocked.
