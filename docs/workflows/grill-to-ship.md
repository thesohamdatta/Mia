# Grill-to-Ship

This is the development workflow I want MIA to make repeatable.

## Core loop

```text
intent → grill → plan → spec → execute → review → ship → learn
```

The phases can be shortened for tiny changes, but the reasoning should not disappear just because the diff is small.

## 1. Grill

For non-trivial work, make the problem explicit:

- What are we actually solving?
- What assumptions are we making?
- What could go wrong?
- What does done mean?
- What is out of scope?

The point is not bureaucracy. It is avoiding expensive work on the wrong problem.

## 2. Plan

Turn the clarified intent into a sequence of concrete steps.

Each meaningful step should have a success condition that can be checked.

## 3. Spec

When the change deserves more structure, turn the intent into a PRD-style specification.

Capture the problem, use cases, acceptance criteria, technical approach, risks, and explicit non-goals. Break the work into smaller issues when that makes execution clearer.

## 4. Execute

Implement the smallest coherent change.

MIA's current runtime is direct CLI execution:

```text
CLI → context → middleware → skill executor
```

No daemon, no HTTP control plane, and no second MIA process are required for the normal path.

## 5. Review

Before shipping, inspect:

- correctness
- architecture
- maintainability
- testing
- security-sensitive behaviour
- unintended scope growth

Read the affected code, not just the final diff.

## 6. Ship

The intended path is:

```text
tests → health → review → push → PR
```

The current `mia ship` command exposes this workflow. The executable is a workflow surface, not a promise that every remote step is fully automated.

Use `mia vc` for repository-aware git operations when appropriate.

## 7. Learn

After meaningful work:

- record a reusable learning
- preserve relevant timeline activity
- save a checkpoint when work needs to resume later
- update documentation when implementation changes the contract

That is the compounding loop:

```text
observe → learn → distill → apply → verify → evolve
```

## Human control

MIA is meant to strengthen human judgement, not hide it.

For consequential decisions:
- surface trade-offs
- keep decisions explicit
- document irreversible architecture choices
- do not silently widen scope

## Verification

Use the repository's actual checks:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Choose the narrowest verification set that proves the claim, and run the broader set before a meaningful release.

---

*Think first. Execute cleanly. Verify before claiming done.*