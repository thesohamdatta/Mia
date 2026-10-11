---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: review
version: 1.0.0
invocation: both
phase: review
side-effects: local-write
---

# review

Advance a Work item through verification and review

## Invocation

Available to model-triggered workflows when the task matches this skill.

## Contract

- Phase: review
- Invocation: both
- Side effects: local-write
- Verification: typecheck
lint
unused-code
tests

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This page is generated documentation.

## Workflow

1. Run `mia review <workId>`.
2. Inspect the recorded evidence before landing.

---

*Generated from the executable skill registry.*