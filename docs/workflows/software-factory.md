---
type: workflow
scope: repository
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
title: "Running the factory"
last_updated: "2026-10-11"
---

# Running the factory

This runbook turns the factory model into steps a team can follow on MIA. It starts with a narrow, verifiable task and expands authority only after the narrow task is trusted. The commands are read-only; the work happens in the host's coding agent.

## Step 0: assess readiness

Before handing more work to agents, measure how ready the codebase is.

```bash
mia factory readiness
```

Fix the `missing` areas first and revisit the `partial` ones. Read [Agent readiness](../reference/agent-readiness.md) for what each area means. Do not expand agent authority while a core area such as validation or feedback loops is missing.

## Step 1: pick a narrow starting task

Start with one bounded, verifiable task rather than full automation. Good first tasks have a clear pass or fail:

- triage a new issue and propose a diagnosis for a human to check;
- reproduce a reported bug and record the steps;
- fix a failing check and record the evidence.

Avoid starting with a task whose completion is hard to verify. If you cannot state the checks that prove completion, the task is not ready for an agent.

## Step 2: make the work explicit

Record the work so it has an owner, a scope, and a definition of done.

```bash
mia plan create "Fix the flaky checkout test"
```

Resolve the grill interview first when the task is ambiguous. The plan writes a Work item with success criteria; keep it current as the work moves.

## Step 3: route the task

Route the task to the cheapest tier that clears the quality bar.

```bash
mia factory route --complexity low
mia factory route --complexity high --reasoning
```

Use the fast tier for low-risk, low-complexity work and escalate on failure. Reserve the frontier tier for high-risk or reasoning-heavy work. The decision prints its rationale so a reviewer can see why a tier was chosen.

## Step 4: run the inner loop

While the agent works, run the cheap checks repeatedly. The inner loop exists to correct the agent without a human.

```bash
bun test <focused test>
mia factory route --complexity low
```

The inner loop is deliberately cheap. It should catch obvious problems fast, not prove the change correct.

## Step 5: run the outer loop

When the change is ready, run the expensive checks once.

```bash
mia review <workId>
mia health
```

`mia review` runs the pre-landing verification subset and records evidence. `mia health` runs the full repository suite. Both write Evidence records to the local store. A passing check proves only what that check covers.

## Step 6: ship through the gate

```bash
mia ship <workId>
```

`mia ship` refuses to ship when verification failed or a required human approval is missing. It does not push, merge, or open a pull request. Merge authority stays with a human.

## Step 7: run the meta loop

Outside development, review what happened and feed the lessons back.

```bash
mia retro
mia learn add <type> <key> <insight>
```

Turn a repeated failure into a test, a check, focused documentation, or an accepted decision. Do not preserve raw incident history as permanent policy. The meta loop is where the factory improves itself.

## Measure outcomes, not output

Use the factory metrics rather than token or line counts:

```bash
mia factory metrics
```

Watch signal-to-production time, time to repair, human interventions, code shelf life, and cost per pull request. Drive down manual takeovers and human review comments. Aim for quality to hold constant while autonomy and automation rise, then improve quality after the system matures.

## Human checkpoints

Keep a human at the decisions automation cannot make:

- reviewing a specification before implementation;
- reviewing a high-risk change before merge;
- setting architecture, priority, and risk limits;
- approving anything irreversible.

These are deliberate gates, not steps the system treats as fully automatic.

## Related

- [The MIA software factory](../core/software-factory.md)
- [Agent readiness](../reference/agent-readiness.md)
- [Factory metrics](../reference/factory-metrics.md)
- [Engineering workflow](grill-to-ship.md)
