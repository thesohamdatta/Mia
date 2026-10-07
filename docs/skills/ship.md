---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: ship
version: 1.0.0
invocation: both
phase: handoff
side-effects: local-write
---

# ship

Run repository verification before handoff

## Invocation

Available to model-triggered workflows when the task matches this skill.

## Contract

- Phase: handoff
- Invocation: both
- Side effects: local-write
- Verification: typecheck
lint
unused-code
tests
build

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

Phase: handoff

---

*Generated from the executable skill registry.*