---
title: "Testing and verification"
layer: 3
last_updated: "2026-10-10"
owner: verification
---

# Testing and verification

MIA uses tests and repository checks as evidence for specific claims. The goal is not to maximize the number of checks; it is to test the behaviour that matters and state what the result proves.

## Repository checks

The current package scripts include:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Use the narrowest useful checks while iterating, then run the relevant broader suite before handoff. Check `package.json` and the workflow under `.github/workflows/` if the set of scripts changes.

## What to test

### State persistence

Cover append and query behaviour, malformed-line handling, filtering, and sanitisation where relevant. Confirm that reading state does not accidentally mutate it.

### Skill execution

Test the boundaries that matter: command dispatch, skill validation, capability admission, execution results, and the state changes made by the skill. Use integration tests when a behaviour crosses module or persistence boundaries.

### Work lifecycle

Test creation, persistence, recovery, transitions, approvals, and verification links when the change touches those contracts.

### Agent setup

Test that generated host-facing skill files are correct and that existing unmanaged files are not overwritten.

### Documentation

For documentation changes, check that:

- commands and file paths exist in the checked-out revision;
- internal links resolve;
- diagrams render using GitHub-supported Mermaid syntax;
- claims about configuration and architecture match active code;
- generated skill documentation remains consistent with the executable registry.

## Evidence and limits

A passing test proves the behaviour covered by that test. A successful type check proves the compiler accepted the checked sources under the configured rules. A successful build proves that the build completed for that revision.

Do not call a test suite comprehensive unless its coverage supports that claim. Do not claim a check passed unless it actually ran and its result was observed.

For the repository's definition of evidence, see [Review standards](review-standards.md).
