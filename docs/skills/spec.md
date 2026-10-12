---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: spec
version: 1.0.0
invocation: user
phase: specify
side-effects: local-write
---

# spec

Shape intent into a project specification

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: specify
- Invocation: user
- Side effects: local-write
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Shape the intent with `mia spec`.
2. Record the specification before implementation.

---

*Generated from the executable skill registry.*