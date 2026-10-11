---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: plan
version: 1.0.0
invocation: both
phase: plan
side-effects: local-write
---

# plan

Create an explicit implementation plan

## Invocation

Available to model-triggered workflows when the task matches this skill.

## Contract

- Phase: plan
- Invocation: both
- Side effects: local-write
- Verification: none

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Resolve the grill interview first.
2. Run `mia plan create "<objective>"`.
3. Review the written plan and its success criteria.

---

*Generated from the executable skill registry.*