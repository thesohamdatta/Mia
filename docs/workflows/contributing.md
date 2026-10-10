---
title: "Contributing to MIA"
layer: 2
last_updated: "2026-10-10"
owner: engineering
---

# Contributing to MIA

MIA benefits from changes that are focused, verifiable, and easy to review. This guide covers the repository workflow; see [Writing documentation for MIA](../reference/documentation-style.md) when changing docs.

## Set up the repository

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
bun install
```

Use the `master` branch as the integration base and work on a short-lived branch.

## Make a change

1. State the problem and expected outcome.
2. Keep the patch focused; avoid unrelated cleanup.
3. Update tests and documentation when behaviour or user-facing contracts change.
4. Run the narrowest relevant checks while iterating.
5. Run the broader relevant verification suite before opening a pull request.
6. Explain the change and include the verification evidence in the pull request.

## Commit messages

MIA uses Conventional Commits. Common forms include:

```text
feat(cli): add a supported command
fix(state): handle a malformed event
docs: clarify installation
test: cover checkpoint loading
refactor(skills): simplify a workflow
```

Describe the change that actually happened. Do not use an old example that names a removed subsystem as though it still exists.

## Verification

The repository exposes these checks:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Choose checks based on the changed code. For a documentation-only change, at minimum run the Markdown and link checks that are available; for code changes, run the relevant tests, type checks, lint, and build before handoff.

A green check is evidence for the checks it ran, not a guarantee that the whole change is correct.

## Pull requests

Include:

- the problem being solved;
- the important implementation choices;
- test and verification results;
- documentation changes;
- known limitations or follow-up work.

Keep the scope reviewable and make remaining uncertainty explicit.
