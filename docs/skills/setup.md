---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: setup
version: 1.0.0
invocation: user
phase: execute
side-effects: local-write
---

# setup

Install the MIA agent skill surface for supported coding-agent hosts.

## Invocation

Explicitly invoked by the user through the MIA CLI.

## Contract

- Phase: execute
- Invocation: user
- Side effects: local-write
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Generate the public MIA skill surface.
2. Preserve unmanaged host skills.
3. Report generated and skipped skills.

---

*Generated from the executable skill registry.*