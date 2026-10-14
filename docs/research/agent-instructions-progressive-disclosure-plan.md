---
title: "Agent instruction improvements implementation plan"
layer: 3
last_updated: "2026-10-15"
owner: documentation
---

# Agent instruction improvements implementation plan

## Goal

Reduce stale guidance and preserve a lean, discoverable agent context without rebuilding MIA's existing documentation architecture.

## Scope

### In scope

- Fix references to the retired `PRINCIPLES.md` path in active agent guidance and the documentation index.
- Add regression coverage for those references.
- Keep agent entry files as aliases to the canonical `AGENTS.md`.
- Validate internal links, Markdown, frontmatter, and relevant tests.

### Out of scope

- Rewriting the runtime architecture.
- Creating a second project-instructions source.
- Moving the current `AGENTS.md` into a new hierarchy.
- Adding speculative nested instruction files.
- Changing host-specific loading semantics without a product requirement.

## Implementation sequence

1. Update `.agents/PROTOCOL.md` so agents read `docs/core/principles.md` instead of the retired `PRINCIPLES.md`.
2. Update `docs/README.md` so the Principles link points to `core/principles.md`.
3. Extend `core/test/docs-engineering.test.ts` with a regression test for both canonical links and absence of the stale path in those active files.
4. Run the focused test file.
5. Run `bun run lint:md` and `bun run validate:frontmatter`.
6. Run `bun run typecheck` and `bun test` when the environment supports the repository dependencies.
7. Review the diff for scope and contradictory instructions.

## Acceptance criteria

- The protocol references the canonical principles document.
- The docs index uses a valid relative path to the same document.
- A test detects regression to the retired root-level path.
- Root `AGENTS.md` remains small and no duplicate rulebook is introduced.
- Verification results are reported with exact scope; unavailable checks are marked unverified.
