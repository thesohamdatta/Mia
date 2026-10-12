# ADR-0002: Adopt a software factory model, implemented as read-only instruments

## Status

Accepted

## Context

MIA already provides the workflow and state boundary for AI-assisted engineering: a skill registry, a Work lifecycle, capability admission, verification contracts, and recorded evidence. What it did not have was an explicit model of the system that turns a signal — a bug report, a review comment, a failing check, a user request — into verified, shipped software.

Three questions had to be answered before adding anything:

1. Does MIA become an agent harness or a control plane?
2. How much of the factory should MIA own versus the host?
3. How should progress be measured?

The prevailing industry pattern is to build a hosted factory with a control plane, cloud sandboxes, a data plane, and autonomous loops. That pattern carries real cost and real risk: a large autonomous loop can damage a codebase, hide failures, and consume budget, and most teams do not have the deterministic checks to make it safe.

MIA's principles push the other way. It prefers the smallest mechanism that solves the problem, one owner per responsibility, explicit contracts, verification over confidence, and human control. The current runtime is a single local process with no daemon and no HTTP control plane, by an earlier accepted decision ([ADR-0001](ADR-0001-eliminate-daemon.md)).

## Decision

Adopt the software factory as MIA's explanatory model, and implement it as **read-only instruments** rather than an execution engine.

Specifically:

- Add a `factory` skill that assesses agent readiness, reports factory metrics, routes a task profile to a model tier, and prints the factory map. It is `sideEffects: none` and declares no tool capabilities.
- Put the deterministic logic in `core/factory/` (`readiness`, `metrics`, `routing`, `roles`) behind one barrel, so the skill is a thin presenter and the logic is unit-testable.
- Document the model: a concept page, a readiness reference, a metrics reference, and a runbook.
- Keep the host boundary unchanged. MIA does not start agents, open pull requests, or deploy software. The host owns the model loop, tool routing, and sandbox lifecycle; MIA owns the contracts and evidence.

The four instruments:

| Command | Answers |
|---|---|
| `mia factory readiness` | How ready is this codebase for agents? |
| `mia factory metrics` | What outcomes is the factory producing? |
| `mia factory route` | Which model tier should this task use? |
| `mia factory map` | What are the phases, loops, and roles? |

## Consequences

### Positive

- The factory model becomes inspectable and testable instead of aspirational.
- Readiness, metrics, and routing are deterministic functions with focused tests.
- The skill is read-only, so it cannot damage a codebase or leak state.
- The host boundary from ADR-0001 is preserved; no second runtime is introduced.
- Outcome measurement is defined before any automation is built.

### Negative

- MIA does not yet record signals automatically, so `mia factory metrics` reports an empty state until a team records signals and costs.
- Routing is a rule set, not a learned or evaluated router. It is a starting point, not a final answer.
- The readiness assessment measures presence and structure, not coverage or correctness.

### Risks

- A team may treat a high readiness score as a guarantee. The documentation states the limit explicitly: readiness measures whether checks exist, not whether they are good.
- Model tier names could drift from real providers. The tiers are abstract on purpose; a host maps them to concrete models.

## Alternatives considered

1. **Build a hosted control plane and sandbox service.** Rejected: it reintroduces the daemon-era complexity removed in ADR-0001 and duplicates what the host already provides.
2. **Automate a loop end to end immediately.** Rejected: without deterministic checks, a large loop can damage the codebase and hide failures. Readiness must come first.
3. **Add a signal store and autonomous triage now.** Deferred: useful, but it crosses into host automation and needs its own decision once readiness and metrics are in use.
4. **Do nothing.** Rejected: the factory model is already implicit in MIA's workflow, and making it explicit is cheap and clarifying.

## Success criteria

- The `factory` skill is registered, read-only, and covered by focused tests.
- The four commands run deterministically against the repository.
- The factory document set is discoverable from `AGENTS.md`.
- The full repository verification gate passes.

## Rollback plan

The change is additive and reversible. Remove the `factory` skill registration, the `core/factory/` modules, the tests, and the factory documents. No persisted state or migration is involved.

## References

- [The MIA software factory](../core/software-factory.md)
- [Agent readiness](../reference/agent-readiness.md)
- [Factory metrics](../reference/factory-metrics.md)
- [Running the factory](../workflows/software-factory.md)
- [ADR-0001: Eliminate Daemon](ADR-0001-eliminate-daemon.md)

## Review date

2027-01-11
