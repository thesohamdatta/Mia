# Testing Strategy

MIA uses testing as evidence for claims about the repository.

This document describes the verification stack and the test structure that currently exists in the repository.

## Current checks

The main repository checks are:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

GitHub Actions runs the supported repository checks on the `master` integration branch.

## Current test organisation

The repository keeps focused regression and integration coverage under `core/test/`.

Current test files include:

```text
core/test/
├── agent-setup.test.ts
├── agent-surface.test.ts
├── capability-team.test.ts
├── integration.test.ts
├── jsonl-store.test.ts
├── plan-work.integration.test.ts
├── preamble.test.ts
├── root-plan-work.test.ts
├── root-planning.test.ts
├── work-lifecycle.test.ts
└── work-persistence.test.ts
```

The directory also contains small legacy support modules such as `analyzer.ts`, `judge.ts`, `index.ts`, and `types.ts`. They are not themselves the current test suite.

When new behaviour is added, add focused unit or integration coverage where it gives useful evidence.

## What matters most

### JSONL state

Test append, parsing, malformed-line handling, tail queries, filtering, and the storage sanitisation boundary.

### Skill execution

Test the important path:

```text
CLI → skill → UnifiedStore
```

The Work system also has direct coverage for:

```text
RootPlan → Work → persistence → recovery
```

### Configuration

Test default paths and environment-variable behaviour when changing configuration.

The current CLI runtime derives its active configuration from `MIA_DIR`. The broader `core/config/ConfigLoader` remains compatibility/transition code and is not the active `createExecutionContext()` path.

### Git helpers

Test conventional commit validation and safety-sensitive filesystem or git operations before changing them.

### Agent surfaces

Test generated Codex and Claude skill adapters without overwriting unmanaged user-authored skills.

## AI evaluation

MIA has host adapters and skill metadata that can support deeper model evaluation, but the current package scripts do not expose a dedicated `eval:*` command family.

Keep future model evaluation separate from deterministic repository gates so model variability does not obscure ordinary code regressions.

## CI principle

Every CI job should correspond to a command the repository actually supports.

Do not document obsolete scripts, imaginary coverage thresholds, or historical daemon build targets as current guarantees.

## Verification principle

> **NO EVIDENCE = NOT COMPLETE.**

A passing test suite is evidence for tested behaviour, not proof that the entire system is correct. State exactly what was checked and what was not.

---

*Test the behaviour that matters. Keep the evidence close to the claim.*
