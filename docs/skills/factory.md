---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: factory
version: 1.0.0
invocation: user
phase: verify
side-effects: none
---

# factory

Assess agent readiness, factory metrics, and model routing

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: verify
- Invocation: user
- Side effects: none
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Assess readiness with `mia factory readiness` before handing more work to agents.
2. Route each task to the cheapest tier with `mia factory route`.
3. Read outcome metrics with `mia factory metrics`.
4. Inspect phases, loops, and roles with `mia factory map`.

---

*Generated from the executable skill registry.*