---
type: workflow
scope: repository
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
---

# Engineering Workflow

MIA uses an adaptive workflow. The full loop is available when the task needs it, but small changes do not require ceremonial phases.

## Choose the path

### Small / low-risk

```text
inspect → change → verify
```

### Multi-file / architectural / uncertain

```text
explore → contract → plan → change → verify → review
```

### High-risk / privileged

```text
explore → risk assessment → explicit approval → change → verify → review
```

## Explore

Read the current source, callers, tests, accepted decisions, and relevant documentation until the intended outcome and violated invariant are supported by evidence.

## Contract

Make the expected outcome, scope, non-goals, side effects, and verification explicit. Use an existing skill or workflow rather than inventing a second process.

## Plan

Create a concrete sequence with observable success conditions. A plan is not proof that implementation works.

## Change

Make the smallest coherent change. Preserve unrelated work and local state.

## Verify

Run the narrowest checks that prove the changed behaviour, then the wider repository gate required for integration.

## Review

Review correctness, architecture, maintainability, security-sensitive behaviour, tests, scope, and documentation against the actual source.

## Learn

Record reusable learnings and update the canonical documentation when an accepted contract changes.

## Human control

Consequential product, architecture, permission, migration, and release decisions remain explicit. Do not infer approval from silence.
