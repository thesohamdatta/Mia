# MIA Skills & Commands

This page describes the executable skill surface that exists in the current repository.

Skills are wired explicitly in `core/skills/index.ts`. This is intentionally simpler than the earlier filesystem-scanning design.

## Core workflow

| Skill | CLI | Current role |
| :--- | :--- | :--- |
| `grill` | `mia grill` | Clarify problem, assumptions, risks, scope, and definition of done |
| `plan` | `mia plan` | Build a plan around explicit success criteria |
| `spec` | `mia spec` | Shape intent into a PRD-style specification and issues |
| `review` | `mia review` | Pre-landing review workflow |
| `health` | `mia health` | Code-quality and verification surface |
| `ship` | `mia ship` | Shipping workflow |

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
| `vc` | `mia vc` | Git status, diffs, commits, branches, tags, releases, ignores, and hooks |

## Skill contract

A current executable skill implements:

```ts
interface SkillExecutor {
  execute(args: string[], context: ExecutionContext): Promise<SkillResult>;
}
```

The CLI resolves the skill from the direct `skillMap` and runs it inside the shared middleware chain.

## Skill documentation

Skill-facing documentation lives under `docs/skills/`.

The repository also contains `core/generator/gen-skill-docs.ts`, which is intended to generate those pages from skill metadata.

Because the executable source is the authoritative runtime surface, a Markdown page must not be treated as evidence that a command exists unless `core/skills/index.ts` maps it.

## Current boundary

MIA's current executable skills are not the same thing as every workflow described in historical or design documents.

Some documents in the repository describe future ideas, external agent ecosystems, or earlier iterations. The source of truth for commands available through the current CLI is `core/skills/index.ts`.

---

*Keep the command surface small. Put depth behind the interface.*