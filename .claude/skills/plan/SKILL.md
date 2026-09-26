---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
managed-by: mia
name: plan
description: "Create an explicit implementation plan"
version: 1.0.0
invocation: model
phase: plan
side-effects: local-write
---

<!-- MIA-MANAGED-SKILL -->

# plan

Use MIA's **plan** workflow for the current engineering task.

## Instructions

- Treat the user's current objective as the input.
- Use the existing MIA plan workflow; do not invent a parallel engineering process.
- Invoke the command shown below with the relevant objective or context.
- Preserve upstream decisions and artifacts when continuing an existing workflow.
- Report what was actually verified. Do not claim completion without evidence.

## Command

`mia plan create "<objective>"`

## Runtime authority

The executable definition in `core/skills/index.ts` is authoritative. This file is a generated agent-facing adapter.

## Contract

- Phase: plan
- Side effects: local-write
- Verification: none
