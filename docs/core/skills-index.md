---
title: "Skills and commands"
layer: 3
last_updated: "2026-10-10"
owner: engineering
---

# Skills and commands

MIA exposes a small, explicit set of CLI skills. Each registered skill has a definition that describes its identity, required capabilities, side effects, expected verification, and workflow phase.

The authoritative command map is `core/skills/index.ts`. Use `mia --help` (or `bun run core/cli/index.ts --help` from the repository) to inspect the version you're running.

## Commands

| Command | Purpose |
|---|---|
| `grill` | Clarify the problem, assumptions, risks, scope, and definition of done. |
| `plan` | Create a plan and durable Work record from an objective. |
| `spec` | Shape intent into a project specification. |
| `setup` | Install MIA's agent-facing skills for supported hosts without replacing unmanaged skills. |
| `review` | Run the pre-landing review workflow. |
| `health` | Run the repository's configured verification checks. |
| `ship` | Check repository verification and handoff readiness. |
| `learn` | List or store project learnings. |
| `retro` | Review recent timeline activity and learnings. |
| `memory` | Read or append long-term memory. |
| `checkpoint` | Save, list, or load working state. |
| `vc` | Inspect and deliberately mutate Git state. |

Use the Bun entry point before the compiled executable is available:

```bash
bun run core/cli/index.ts --help
bun run core/cli/index.ts grill start
bun run core/cli/index.ts plan create "Describe the intended outcome"
```

## What a skill definition declares

The runtime models a registered skill as a `SkillDefinition` containing a manifest and an executor. The manifest records:

- **Identity:** name, version, and description.
- **Capabilities:** the tools required by the skill.
- **Side effects:** the declared class of changes a skill may make.
- **Verification:** names resolved against the repository's verification catalog.
- **Phase:** the workflow phase associated with the skill.
- **Invocation:** the declared invocation mode.

The skill executor is run through a shared execution boundary rather than called directly by the CLI. That boundary validates the definition and checks declared tool grants against the current execution context.

## Review, health, and ship

These skills serve different purposes:

- `review` runs the deterministic pre-landing verification subset.
- `health` runs the checks declared for the current repository verification suite.
- `ship` checks verification and reports whether handoff is unblocked.

A successful result must be interpreted in the scope of checks actually run. `ship` does not push code, merge changes, or open a pull request.

## Host integration

`setup` installs supported agent-facing skills. It skips existing unmanaged skills instead of overwriting them. MIA does not own the host's model loop or underlying tool execution runtime.

## Source of truth

Read the executable registry and the skill implementation when you need details. Documentation describes that behaviour; it does not make an unregistered command exist.
