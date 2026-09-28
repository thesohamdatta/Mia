# MIA Skills & Commands

This page describes the executable skill surface that exists in the current repository.

Skills are registered explicitly in `core/skills/index.ts`. The registry is a direct map of `SkillDefinition` values, not filesystem discovery.

## Core workflow

| Skill | CLI | Current role |
| :--- | :--- | :--- |
| `grill` | `mia grill` | Clarify problem, assumptions, risks, scope, and definition of done |
| `plan` | `mia plan` | Build a plan around explicit success criteria |
| `spec` | `mia spec` | Shape intent into a project specification |
| `review` | `mia review` | Run deterministic pre-landing verification |
| `health` | `mia health` | Run the repository verification suite |
| `setup` | `mia setup` | Install MIA agent skills for supported hosts |
| `ship` | `mia ship` | Gate handoff on repository verification |

## Learning and state

| Skill | CLI | Current role |
| :--- | :--- | :--- |
| `learn` | `mia learn` | List or append project learnings |
| `retro` | `mia retro` | Summarise recent timeline activity and learnings |
| `memory` | `mia memory` | Read or append long-term memory |
| `checkpoint` | `mia checkpoint` | Save, list, or load working state |

## Version control

| Skill | CLI | Current role |
| :--- | :--- | :--- |
| `vc` | `mia vc` | Inspect and deliberately mutate Git state |

## Skill contract

Each registered skill is a `SkillDefinition`:

```ts
interface SkillDefinition {
  manifest: SkillManifest;
  executor: SkillExecutor;
}
```

The manifest records:

- identity and description
- allowed tools
- declared side-effect class
- declared verification names
- workflow phase

Skill documentation is generated from the executable registry. Do not infer command availability, invocation semantics, or permissions from Markdown alone.

The CLI does not execute a raw executor. It resolves a `SkillDefinition` and sends it through the execution boundary, which validates the manifest before middleware and executor code run.

## Verification boundary

Executable verification is implemented in `core/verification/`.

`health` and `ship` run the configured repository checks and persist their `EvidenceRecord` results through `UnifiedStore`. `review` runs the deterministic pre-landing subset.

The manifest's `verification` field is executable contract metadata. `health`, `review`, and `ship` resolve the declared names against the canonical repository verification catalog before running checks. `allowedTools` is enforced at the skill admission boundary against `ExecutionContext.grantedTools`. A missing grant blocks the skill before middleware and executor code run. MIA still does not own the underlying tool execution runtime.

## Source of truth

The authoritative command surface is `core/skills/index.ts`. Documentation describes that executable source and must not be used as evidence that an unregistered command exists.

---

*Keep the command surface small. Put depth behind the interface.*
