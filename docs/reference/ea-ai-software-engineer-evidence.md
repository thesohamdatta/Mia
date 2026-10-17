---
title: "Engineering evidence for QA automation roles"
layer: 3
last_updated: "2026-10-17"
owner: engineering
---

# Engineering evidence for QA automation roles

This note maps verifiable MIA repository work to software-engineering and quality-engineering interview topics. It is a portfolio aid, not a claim that MIA is a game-testing framework or that every check has passed on every revision.

## Evidence available in the repository

| Role requirement | Repository evidence | Defensible description |
|---|---|---|
| Scripting and object-oriented/software design | Bun + TypeScript CLI and modular core | Built and maintained a TypeScript command-line engineering tool |
| Automated tests | `bun test`; focused tests under `core/test/` | Added or maintained automated tests for lifecycle behaviour and architecture boundaries, where supported by actual authored changes |
| Static checks | `bun run typecheck`, `bun run lint:check`, `bun run knip` | Used type checking, linting, and unused-code analysis in the verification workflow |
| Build and release validation | `bun run build`, `bun run verify:binary` | Added/maintained a build and compiled-binary smoke-check workflow, if supported by personal contribution history |
| CI | `.github/workflows/ci.yml` runs lint, typecheck, Knip, documentation validation, tests, build, and binary smoke test | Maintained a GitHub Actions CI pipeline that gates pull requests and pushes |
| Reliability and evidence | Work lifecycle stores verification projections and requires evidence for state transitions in relevant changes | Designed or tested workflow gates that prevent advancing without recorded passing verification evidence, if directly involved in that change |
| AI-assisted engineering | MIA describes an engineering harness for AI-assisted software development | Built tooling to structure AI-assisted work and retain verification evidence; do not call this AI output evaluation unless separate evaluation criteria and tests were implemented |

## Safe resume bullets

Choose bullets only when personal authorship and contribution can be confirmed.

- Built a Bun/TypeScript CLI for AI-assisted software engineering, with explicit work planning, workflow boundaries, and recorded verification evidence.
- Maintained a GitHub Actions CI pipeline combining automated tests, TypeScript type checking, linting, dead-code analysis, documentation validation, build, and binary smoke tests.
- Added regression tests for workflow lifecycle and architectural boundaries to catch invalid state transitions and cross-module coupling.
- Tightened a read-only verification command so it reports check results without auto-fixing files, and incorporated tests into the pre-commit feedback loop.

Do not include all four automatically. Verify the commits/PRs you personally authored and the current state of each change before using any bullet.

## What this evidence does not establish

- Game-specific automation or game-production QA experience.
- Mobile application test automation.
- API test coverage, telemetry analysis, or test reporting tools, unless independently demonstrated.
- Automated evaluation of AI-generated answers for correctness, consistency, or usefulness.
- Quantified reductions in test time, improved coverage, or productivity without measurements.

## Verification commands

Run from a clean checkout after installing the repository's pinned Bun dependencies:

```bash
bun run lint:check
bun run typecheck
bun run knip
bun run validate:frontmatter
bun run lint:md
bun test
bun run build
bun run verify:binary
```

A passing result describes that checkout only. The existing GitHub Actions CI workflow defines corresponding checks. Consult the latest run before reporting a specific pass count or status.

## Interview preparation

Be ready to explain:

1. Why the test checks the contract that matters rather than implementation details.
2. How a failed check is surfaced and how you distinguish a local failure from a CI failure.
3. Why type checking and linting complement tests rather than replace them.
4. What the binary smoke test proves, and what it does not prove.
5. A concrete regression you caught and the exact test that would fail without the guard.

For current test scope, see [Testing and verification](testing-strategy.md). For pull request expectations, see [Contributing to MIA](../workflows/contributing.md) and [Review standards](review-standards.md).
