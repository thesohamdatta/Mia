---
type: reference
scope: project
status: active
owner: verification
canonical: true
audience: agent
load: on-demand
title: "Factory metrics"
last_updated: "2026-10-11"
---

# Factory metrics

Factory metrics measure delivery, maintenance, quality, and spend. They exist to replace two tempting but misleading numbers: tokens generated and lines of code. Both can rise while the underlying result gets worse, which makes them examples of Goodhart's law rather than useful engineering signals.

The `factory` skill reports the current measures:

```bash
mia factory metrics
```

## The measures

| Measure | Definition | Answers |
|---|---|---|
| Signal to production | Median time from a recorded signal to the Work item reaching `shipped`. | How long does a request or defect take to reach users? |
| Time to repair | Median time from a defect or incident signal to `shipped`. | How fast do we fix what breaks? |
| Human interventions | Total human interventions, and the rate per shipped Work item. | How much human attention does each shipped change need? |
| Code shelf life | Share of observed shipped Work items still present. | How much shipped code survives? |
| Cost per pull request | Median and total model cost per pull request. | What does one change cost to produce? |

These measures connect agent activity to outcomes. A factory that generates more pull requests without improving delivery, defects, or recovery has not improved.

## How MIA computes them

MIA computes the measures from explicit inputs, not from hidden state:

- **Signals** are `{ id, workId, kind, observedAt }` records, where `kind` is one of `bug`, `incident`, `feedback`, `request`, or `other`.
- **Works** are MIA Work items with a `state` and timestamps.
- **Costs** are `{ workId, modelCostUsd, humanInterventions }` records, one per pull request.
- **Shelf life** observations are `{ workId, present }` records.

A signal contributes to signal-to-production only when its Work item is `shipped`. Time-to-repair counts only `bug` and `incident` signals. Cost-per-pull-request summaries use the cost records directly, and the per-Work intervention rate uses the shipped set. The function is deterministic: the same inputs produce the same metrics.

## The empty state is honest

MIA does not yet record signals automatically. There is no signal store, and the current `factory metrics` command reports empty summaries because no signals or shipped Work exist in local state for a project. This is deliberate: the command reports what it can observe rather than inventing a number.

To make the measures meaningful, a team records signals and costs at the boundaries it already controls — the issue tracker for signals, the pull request for cost and interventions — and feeds them to the metrics function. Until then, the measures stay empty.

## Related

- [The MIA software factory](../core/software-factory.md)
- [Agent readiness](agent-readiness.md)
- [Evidence and verification](evidence.md)
