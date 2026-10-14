---
title: "Agent instruction design and progressive disclosure"
layer: 3
last_updated: "2026-10-15"
owner: documentation
---

# Agent instruction design and progressive disclosure

## Decision

Keep `AGENTS.md` as a small entry router, not a full operating manual. Put detailed instructions at the narrowest useful scope and make the repository's checks catch stale references.

This recommendation is consistent with MIA's existing context-engineering and agent-engineering principles. It does not require a new documentation architecture or a second instruction system.

## Findings from MIA

- Root `AGENTS.md` is already concise and below the existing 100-line test ceiling.
- `CLAUDE.md` and `GEMINI.md` point to `AGENTS.md`, avoiding duplicated project rules.
- Canonical references exist for architecture, context, principles, agent engineering, skills, workflows, testing, review, and evidence.
- `scripts/sync-docs.ts` validates internal Markdown links and discoverability of canonical agent-facing documentation.
- The current protocol says to read `PRINCIPLES.md`, while MIA's canonical principles live at `docs/core/principles.md`. That is a concrete stale instruction to fix.
- `docs/README.md` links to `../PRINCIPLES.md`, another stale pointer to check and repair.
- The package manager is Bun (`package.json` declares `bun@1.4.2`); useful common verification commands are already documented in `docs/reference/testing-strategy.md`.

## External guidance

1. HumanLayer, [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md), published November 25, 2025. Recommends minimal always-loaded context, progressive disclosure, and deterministic linting for deterministic style rules. Its claimed instruction-following limits are an estimate, not a universal measured threshold, so MIA should not hard-code a magic instruction count.
2. GitHub Docs, [Support for different types of custom instructions](https://docs.github.com/en/copilot/reference/custom-instructions-support). Describes the distinct roles of repository-wide instructions, path-specific instructions, agent instruction files, and task-scoped skills. Support varies by product surface, so MIA should not assume every host loads every file the same way.
3. OpenAI Codex repository, [AGENTS.md specification notes](https://github.com/openai/codex/blob/main/docs/agents_md.md). Describes directory-scoped instructions and resolving instructions by repository path. This is implementation documentation for Codex, not a guarantee for every tool.

## Recommendations

### Keep in root AGENTS.md

- One sentence describing MIA and the stable execution path.
- A small map to canonical project context, architecture, workflow, test, review, and evidence documents.
- Universal safety rails: do not duplicate owners/stores, preserve unrelated work, use focused verification, and make evidence-backed claims.
- The package manager and only commands that are genuinely non-obvious or universally needed.

### Keep out of root AGENTS.md

- Long procedures for multi-agent coordination, code review, testing, migrations, or releases.
- Detailed coding conventions that can be enforced by linters or tests.
- Historical findings, stale implementation paths, copied examples, and workflow steps that do not apply to every task.

### Add scope only when proven useful

Use nested `AGENTS.md` files or host-specific path instructions only when a directory repeatedly needs unique rules. Avoid creating them pre-emptively: each additional file creates another rule surface to maintain, and host support differs.

### Protect the system with deterministic checks

- Test that the root router remains small and references canonical documents.
- Validate every internal link and canonical-doc discoverability.
- Add focused tests for stale legacy paths that have already caused drift.
- Make documentation lint and context-sync validation part of CI, as they are now.
- When changing docs, inspect implementation and tests for behavioural claims rather than trusting older prose.

## Proposed implementation

1. Repair the stale principles links in the coordination protocol and docs index.
2. Add a targeted test proving canonical principles are linked and the retired root path is not referenced in these active entry points.
3. Keep `AGENTS.md` short, and update its map only if the current repo lacks a useful route.
4. Run focused tests and repository documentation checks. Do not claim full verification unless those commands actually run on the exact commit.

## Success criteria

- Root `AGENTS.md` remains under the existing 100-line limit.
- Active protocol and documentation index link to `docs/core/principles.md`.
- The targeted test fails if the old path returns.
- Existing documentation validation remains green.
- No new duplicated policy document or unnecessary nesting is introduced.
