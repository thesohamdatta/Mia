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

The CLI does not execute a raw executor. It resolves a `SkillDefinition` and sends it through the execution boundary, which validates the manifest before middleware and executor code run.

## Verification boundary

Executable verification is implemented in `core/verification/`.

`health` and `ship` run the configured repository checks and persist their `EvidenceRecord` results through `UnifiedStore`. `review` runs the deterministic pre-landing subset.

The manifest's `verification` field is currently declarative metadata. The runtime does not yet expose a generic tool/permission engine or a generic verification resolver. Keeping that machinery out of the core is intentional until a second concrete implementation requires it.

## Source of truth

The authoritative command surface is `core/skills/index.ts`. Documentation describes that executable source and must not be used as evidence that an unregistered command exists.

---

*Keep the command surface small. Put depth behind the interface.*
