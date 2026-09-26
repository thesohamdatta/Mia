---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
managed-by: mia
name: review
description: Prepare a review surface for the current change
version: 1.0.0
invocation: model
phase: review
side-effects: none
---

# review

Use MIA's **review** workflow for the current engineering task.

## Instructions

- Treat the user's current objective as the input.
- Use the existing MIA review workflow; do not invent a parallel engineering process.
- Invoke `mia review` with the relevant objective or context.
- Preserve upstream decisions and artifacts when continuing an existing workflow.
- Report what was actually verified. Do not claim completion without evidence.

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This file is a generated agent-facing adapter.

## Contract

- Phase: review
- Side effects: none
- Verification: none
