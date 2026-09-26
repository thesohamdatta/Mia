# Testing Strategy

MIA uses testing as evidence for claims about the repository.

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

Focused regression and integration coverage lives under `core/test/`.

Keep tests close to the behaviour they prove. Prefer one focused test over a broad fixture that proves several unrelated rules.

The suite currently covers agent surfaces, capability metadata, the CLI → skill → store path, JSONL state, preamble lifecycle, RootPlan/Work planning, Work lifecycle, and Work persistence.

## TDD

For a behaviour change:

```text
failing test → smallest change → focused green → wider verification
```

The failing test should demonstrate the missing behaviour. The implementation should be the smallest change that satisfies that contract. Refactor only after the focused test is green.

For a documentation contract, use a deterministic repository test when the rule is stable and important enough to protect. Avoid turning every prose preference into a test.

## What matters most

### JSONL state

Test append, parsing, malformed-line handling, tail queries, filtering, and the storage sanitisation boundary.

### Skill execution

Test the important path:

```text
CLI → skill → UnifiedStore
```

The Work system has direct coverage for:

```text
RootPlan → Work → persistence → recovery
```

### Configuration

Test default paths and environment-variable behaviour when changing configuration.

### Git helpers

Test conventional commit validation and safety-sensitive filesystem or git operations before changing them.

### Agent surfaces

Test generated Codex and Claude skill adapters without overwriting unmanaged user-authored skills.

## AI evaluation

MIA has host adapters and skill metadata that can support deeper model evaluation, but the current package scripts do not expose a dedicated `eval:*` command family.

Keep future model evaluation separate from deterministic repository gates.

## CI principle

Every CI job should correspond to a command the repository actually supports.

Do not document obsolete scripts, imaginary coverage thresholds, or historical daemon build targets as current guarantees.

## Verification principle

> **NO EVIDENCE = NOT COMPLETE.**

A passing test suite is evidence for tested behaviour, not proof that the entire system is correct. State exactly what was checked and what was not.

---

*Test the behaviour that matters. Keep the evidence close to the claim.*
