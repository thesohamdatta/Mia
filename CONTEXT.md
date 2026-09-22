---
type: knowledge
scope: project
status: active
owner: architecture
canonical: true
audience: agent
load: high
---

# MIA Project Context

MIA means **Machine Intelligence Architecture**. It is a local-first AI engineering OS for structured, evidence-driven software work.

## Core vocabulary

| Term | Meaning in MIA |
| :--- | :--- |
| **Run** | One invocation with one stable execution identity (`run.id`). |
| **ExecutionContext** | Per-run context carrying cwd, project slug, configuration, run identity, and the shared `UnifiedStore`. |
| **Skill** | A registered executable use case exposed through the CLI. |
| **SkillDefinition** | The runtime contract pairing a skill manifest with its executor. |
| **SkillManifest** | Executable metadata describing identity, phase, declared side effects, tools, and verification names. |
| **Middleware** | Cross-cutting execution behaviour wrapped around skills without creating a service layer. |
| **UnifiedStore** | The current owner of project event persistence for learnings, timeline activity, checkpoints, and verification evidence. |
| **Evidence** | A recorded result that supports a specific claim about repository or runtime behaviour. |
| **Verification** | An executable check performed to establish evidence. |
| **Capability** | An operation a skill may legitimately use. MIA currently models declared tools/side effects in skill metadata but does not yet expose a generic capability engine. |
| **Workflow** | A repeatable engineering procedure describing how work moves from intent to verified outcome. |
| **Checkpoint** | Persisted working state associated with an execution identity so work can resume with explicit context. |
| **Recovery** | Re-establishing a coherent run or repository state after interruption or failure. |

## Runtime shape

```text
CLI
 ↓
ExecutionContext
 ↓
Middleware
 ↓
Skill Executor
 ↓
UnifiedStore / local files
```

The normal execution path is in-process. There is no daemon or HTTP control plane in the current architecture.

## Truth boundaries

Runtime code is authoritative for executable behaviour. Documentation explains and routes to that behaviour. Research and archived material are not runtime truth.

## Context rule

Use the smallest set of context that reduces uncertainty. Project terminology belongs here. How context is engineered belongs in [docs/core/context.md](docs/core/context.md).
