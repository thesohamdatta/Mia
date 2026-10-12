---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: grill
version: 1.0.0
invocation: user
phase: clarify
side-effects: local-write
---

# grill

Clarify intent before non-trivial work

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: clarify
- Invocation: user
- Side effects: local-write
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Start the interview with `mia grill start`.
2. Answer each design branch with `mia grill answer <decision>`.
3. Resolve every question before planning.

---

*Generated from the executable skill registry.*