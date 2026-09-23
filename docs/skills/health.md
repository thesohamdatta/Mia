---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: health
version: 1.0.0
invocation: user
phase: verify
side-effects: none
---

# health

Run the repository verification suite

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: verify
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

Phase: verify

---

*Generated from the executable skill registry.*