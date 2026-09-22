---
type: reference
scope: project
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
---

# Agent Engineering

MIA engineers the environment around AI agents instead of relying on model cleverness.

## Principles

- **Explicit contracts:** make inputs, outputs, side effects, and verification visible.
- **Progressive disclosure:** use a small entry point and load depth only when needed.
- **Composable skills:** one skill should own one coherent procedure and be usable without importing unrelated workflow text.
- **Clear activation:** distinguish user-controlled orchestration from reusable discipline.
- **Evidence-bound completion:** every completion claim names the checks or observations that support it.
- **Scoped instructions:** local constraints belong at the narrowest directory or workflow that owns them.
- **Single source of truth:** runtime owns executable behaviour; Markdown should not invent commands or metadata.
- **Learn from failure:** repeated failures should become tests, checks, tooling, or durable guidance.

## Skill shape

A skill should have a concise entry document describing purpose, when to use it, inputs, preconditions, procedure, stop conditions, side effects, verification, output, and references. Deep material belongs in focused references or scripts.

## Invocation

MIA may eventually distinguish `user`, `model`, and `both` invocation modes. Until the runtime enforces those states, documentation must not imply that model-triggering or permission semantics are executable guarantees.

## External influences

MIA incorporates transferable ideas from modern agent engineering systems, including composable skills, domain context, scoped instructions, persistent learning, workflow generation, verification gates, and evidence binding. These are design influences, not compatibility claims.
