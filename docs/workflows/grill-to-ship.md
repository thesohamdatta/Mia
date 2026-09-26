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

MIA uses the smallest workflow that gives enough evidence. Do not add ceremony just to make a task look disciplined.

## Choose the path

### Small / low-risk

```text
inspect → change → verify
```

### Behaviour change

```text
write the failing test → make the smallest change → run the focused test → refactor only after green
```

### Multi-file / architectural / uncertain

```text
explore → contract → write the failing test → make the smallest change → verify → review
```

### High-risk / privileged

```text
explore → risk assessment → explicit approval → write the failing test → make the smallest change → verify → review
```

## TDD rule

For behaviour changes, the test is the executable contract.

1. Write one focused test for the missing or broken behaviour.
2. Run it and confirm it fails for the expected reason.
3. Make the smallest implementation change that can make it pass.
4. Run the focused test again.
5. Run the wider repository checks required by the change.
6. Refactor only while the tests stay green.

Do not write large test suites before understanding the behaviour. Do not change production code first and add a test afterward just to satisfy coverage.

## Explore

Read the current source, callers, tests, accepted decisions, and relevant documentation until the intended outcome and violated invariant are supported by evidence.

## Contract

Make the expected outcome, scope, non-goals, side effects, and verification explicit. Use an existing skill or workflow rather than inventing a second process.

## Plan

Create a concrete sequence with observable success conditions. A plan is not proof that implementation works.

## Change

Make the smallest coherent change. Preserve unrelated work and local state.

## Verify

Start with the focused test. Then run the wider gate needed for integration.

Do not claim a green repository from an unrun check. Do not claim a behaviour is covered just because a nearby test exists.

## Review

Review correctness, architecture, maintainability, security-sensitive behaviour, tests, scope, and documentation against the actual source.

## Learn

Record reusable learnings and update the canonical documentation when an accepted contract changes.

## Human control

Consequential product, architecture, permission, migration, and release decisions remain explicit. Do not infer approval from silence.
