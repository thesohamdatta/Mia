# Testing Strategy

MIA uses testing as evidence for claims about the repository.

The current codebase is smaller than the historical testing strategy that inspired it, so this document describes the present verification stack without pretending the repository has test infrastructure it does not currently contain.

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

GitHub Actions runs these supported checks from the repository's `master` integration branch. The CI workflow deliberately keeps dependency installation and repository validation in one job so pull requests do not repeat the same setup four times.

## Current test organisation

The repository currently contains integration-oriented coverage under `core/test/`.

Use the repository's actual structure rather than a theoretical test pyramid:

```text
core/test/
├── integration.test.ts
├── analyzer.ts
├── judge.ts
└── types.ts
```

When new behaviour is added, add focused unit or integration coverage where it gives useful evidence.

## What matters most

### JSONL state

Test append, parsing, malformed-line handling, and the storage sanitisation boundary.

### Skill execution

Test the important path:

```text
CLI → skill → UnifiedStore
```

### Configuration

Test default paths, config-file loading, and environment-variable precedence when changing configuration behaviour.

### Git helpers

Test conventional commit validation and any safety-sensitive filesystem or git operations before changing them.

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
