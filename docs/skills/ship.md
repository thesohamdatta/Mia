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
invocation: user
phase: handoff
side-effects: none
---

# ship

Run repository verification before handoff

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: handoff
- Invocation: user
- Side effects: none
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