# AI Engineer extraction matrix

This is the working knowledge layer between source transcripts and future implementation decisions.

Status: research only. No implementation requirements.

## AE-01 — Coding Agents Don't Scale Themselves. Neither Do Your Teams.

Primary themes:
- repeated agent corrections should improve the generator, not only the generated artifact
- context, harnesses, and workflow can encode recurring corrections
- human intervention is a useful operational signal
- shared agent infrastructure needs ownership and maintained choices
- autonomy should vary with risk
- organizational knowledge should survive model and component changes

Extractable engineering elements:
- feedback-to-harness loop
- reusable correction
- human-touch count
- reach/reuse of a shared fix
- platform ownership
- risk-adjusted autonomy
- knowledge preservation

Mia mapping:
- learnings
- skills
- agent surface
- verification
- maintenance observations
- future factory metrics

Primary checkpoints: 0:31, 2:46, 5:20, 7:04, 9:24, 10:24, 19:55.

---

## AE-02 — Why Software Factories Fail

Primary themes:
- faster implementation moves the bottleneck
- software already contains planning/review/testing/feedback loops
- code understanding and maintainability remain expensive
- passing tests is not a complete quality signal
- architecture should precede task slicing
- review overload becomes rework

Extractable engineering elements:
- bottleneck migration
- understanding/review cost
- training signal quality
- maintainability evaluation
- design-before-slicing
- review capacity
- rework feedback

Mia mapping:
- grill/plan before execution
- review skill
- health verification
- architecture docs
- future outcome evaluation

Primary checkpoints: 0:47, 3:37, 6:01, 7:25, 10:13, 11:21, 13:11, 14:48, 15:59, 17:01, 17:54.

---

## AE-03 — Software Fundamentals Matter More Than Ever

Primary themes:
- shared design understanding precedes a useful plan
- ubiquitous language reduces ambiguity
- frequent feedback beats giant end-stage validation
- TDD constrains agent step size
- interfaces and architecture remain strategic human responsibilities
- deep modules make AI-assisted work easier

Extractable engineering elements:
- shared design concept
- domain vocabulary
- questioning before planning
- feedback cadence
- TDD
- deep-module boundaries
- interface ownership
- selective delegation

Mia mapping:
- CONTEXT.md
- grill
- plan/spec
- tests
- architecture principles
- skill boundaries

Primary checkpoints: 0:19, 4:41, 6:49, 8:57, 13:05.

---

## AE-04 — Why Agentic Systems Need Ontologies

Primary themes:
- probabilistic agents benefit from explicit domain models
- relationships can carry constraints and inference
- domain validation differs from type validation
- validate tool results before accepting side effects
- uncontrolled loops can drift or consume excessive resources

Extractable engineering elements:
- domain entities
- relationships
- invariants
- semantic validation
- pre-side-effect validation
- bounded iteration

Mia mapping:
- Work
- Capability
- Approval
- Evidence
- lifecycle transitions

Do not infer a requirement for a graph database or ontology stack.

Primary checkpoints: 1:30, 3:49, 5:23, 9:18, 13:13, 14:39, 17:43.

---

## AE-05 — Harness Engineering

Primary themes:
- human attention and model context are scarce resources
- quality must be legible and enforceable
- context should arrive just in time
- repository structure affects agent throughput
- repeated human fixes should become durable guardrails
- expansion beyond coding should follow proven confidence

Extractable engineering elements:
- quality contracts
- lint/test/review guardrails
- just-in-time context
- canonical utilities
- package boundaries
- agent throughput
- feedback-to-guardrail conversion

Mia mapping:
- AGENTS.md
- CONTEXT.md
- docs/core/*
- skills
- verification
- generated agent surface

Primary checkpoints: 1:54, 6:56, 11:21, 21:26, 24:04, 28:33, 30:28, 43:35.

---

## AE-06 — 12-Factor Agents

Primary themes:
- use model judgment only where it adds value
- tool output can be a structured model decision followed by deterministic code
- application-owned state supports pause/resume
- context construction is a major reliability lever
- small focused loops beat one unrestricted loop
- people remain useful control points
- inspectable scaffolding is preferable to hidden control flow

Extractable engineering elements:
- deterministic shell around model decisions
- explicit dispatcher/control flow
- external execution state
- context construction
- bounded micro-loops
- human contact
- stateless model / stateful application

Mia mapping:
- ExecutionContext
- Work persistence
- capability admission
- approval
- verification
- UnifiedStore

Primary checkpoints: 0:15, 4:09, 6:52, 10:12, 11:19, 14:38.

---

## AE-07 — No, That's Not a Software Factory

Primary themes:
- a PR is an output, not proof of useful delivery
- coordination and context discovery matter
- events can drive the next workflow stage
- delivery and reliability need outcome-oriented measurement
- authorization is a distinct unresolved problem

Extractable engineering elements:
- outcome over activity
- event-triggered workflow continuation
- dependency awareness
- context gateway/discovery
- delivery metrics
- defect/recovery metrics
- authorization boundary

Mia mapping:
- Work lifecycle
- handoffs
- UnifiedStore timeline
- capability/approval boundary
- future delivery metrics

Primary checkpoints: 0:12, 3:11, 5:07, 6:31, 11:03, 14:06, 15:57, 18:02.

---

## AE-08 — How Software Factories Improve Themselves

Primary themes:
- separate recurring work from improvement of the procedure
- send proposed skill changes through reviewable PRs
- retain investigation facts for later runs
- keep memory editable and traceable
- evaluate recurring task classes before routing models

Extractable engineering elements:
- outer improvement loop
- skill promotion
- reviewed procedural change
- source-linked memory
- task-class evaluation
- model routing evaluation

Mia mapping:
- learnings
- skills
- maintenance
- PR workflow
- verification/evidence

Primary checkpoints: 0:12, 2:04, 5:32, 8:46, 11:19.

---

## AE-09 — Total Recall

Primary themes:
- the harness can improve without changing model weights
- memory placement affects collaboration
- retrieval adds selection/representation complexity
- memory should be selective
- context should be refreshed per iteration
- successful sessions can become reusable skills
- recovery needs patience limits
- large toolboxes need distinguishable descriptions

Extractable engineering elements:
- harness adaptation
- memory tiers
- retrieval selection
- context cards/lenses
- skill promotion
- recovery budget
- tool discoverability

Mia mapping:
- learning retrieval
- context engineering
- skill surface
- checkpoint/recovery
- capability descriptions

Primary checkpoints: 0:12, 13:48, 21:34, 25:53, 34:04, 38:51, 42:06, 51:43, 55:08.

---

## AE-10 — Agents Without Code

Primary themes:
- custom agent loops can sometimes move into frameworks or managed execution
- general tools and files can express capabilities without a bespoke wrapper
- server-side execution can remove application orchestration
- developers still own domain behavior, evaluations, and outcome verification
- better models can make prior orchestration removable
- files can carry preferences and handoffs

Extractable engineering elements:
- orchestration deletion
- capability discovery
- execution boundary
- developer-owned domain logic
- outcome evaluation
- filesystem handoffs
- continuous complexity review

Mia mapping:
- skill files
- generated agent surface
- local files
- explicit runtime ownership
- simplicity/evolvability principles

Do not infer a requirement to adopt hosted execution.

Primary checkpoints: 0:12, 2:29, 5:06, 7:38, 10:01, 12:28, 14:37, 16:30.

---

# Cross-corpus extractable principles

1. Improve the system that produces repeated work, not only the artifact.
2. Preserve human strategic judgment while delegating bounded tactical work.
3. Keep deterministic control around probabilistic model decisions.
4. Treat context selection as an engineering problem.
5. Externalize durable state from the model.
6. Make quality standards executable where the signal is stable.
7. Use narrow feedback loops instead of giant end-stage validation.
8. Treat review and maintainability as throughput constraints.
9. Preserve provenance when knowledge crosses runs.
10. Curate memory instead of accumulating raw history.
11. Treat skills as reusable procedures that can evolve under review.
12. Use task-specific evaluation before optimizing routing.
13. Measure outcomes, intervention, rework, recovery, and cost instead of activity alone.
14. Keep authorization separate from capability discovery.
15. Bound autonomy by risk.
16. Reassess custom orchestration as the underlying model/platform improves.
17. Keep one canonical owner for each responsibility.
18. Prefer simple contracts over large framework-shaped abstractions.
19. Make repository structure legible to both humans and agents.
20. Convert recurring failures into tests, rules, tooling, context, or reviewed skill changes.

# Principle-to-Mia mapping

| Principle | Existing Mia support | Evidence needed before changing code |
|---|---|---|
| Improve repeated work at the generator/harness level | learn, skills, maintenance | recurring failure data |
| Context selection | docs/core/context.md, recent learnings | context quality/outcome measurements |
| External state | Work + UnifiedStore | long-running workflow evidence |
| Deterministic control | skill admission + lifecycle | real agent-host integration evidence |
| Human control | Approval + capability admission | authorization coverage |
| Outcome evaluation | partial, repository checks | task-level evaluation design |
| Curated memory | sourceRunId + project learning | retrieval/contradiction/freshness failures |
| Skill evolution | executable registry + PR process | repeated skill failure patterns |
| Factory metrics | timeline/evidence events | useful metric definitions |
| Orchestration deletion | simplicity principle | concrete duplicated machinery |
| Domain validation | Work/Capability/Approval contracts | observed semantic invariant failures |

# Research gate

Nothing in this matrix is an implementation instruction.

Before implementation, confirm:

1. the problem exists in Mia
2. the proposed change addresses the problem
3. the source evidence supports the mechanism
4. the change is simpler than available alternatives
5. the benefit can be observed or tested
6. the new boundary has a clear owner
7. the change preserves the local-first/human-control architecture unless an explicit decision says otherwise
