---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: approve
version: 1.0.0
invocation: user
phase: handoff
side-effects: local-write
---

# approve

Record the human approval a ship gate requires

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: handoff
- Invocation: user
- Side effects: local-write
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Review the ready_to_ship work with `mia approve --status <workId>`.
2. Record the decision with `mia approve <workId> [note]`, or reject with `mia approve --reject <workId> <reason>`.

---

*Generated from the executable skill registry.*