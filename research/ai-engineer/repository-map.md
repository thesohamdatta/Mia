# Repository model and applicability map

Baseline inspected: master @ f0a24827546fdf1ab25f4219d08902a018754f30

## Current architecture

Mia is a compiled Bun/TypeScript CLI with a direct in-process path:

CLI → ExecutionContext → skill admission → middleware → skill executor → UnifiedStore/local files

Canonical ownership:
- runtime behavior: source code
- project vocabulary: CONTEXT.md
- architecture: docs/core/architecture.md
- principles: docs/core/principles.md
- context engineering: docs/core/context.md
- executable skills: core/skills/index.ts
- evidence semantics: docs/reference/evidence.md
- verification: core/verification/
- durable project events: UnifiedStore

The architecture explicitly avoids a current daemon and HTTP control plane.

## Current state model

Work has an explicit lifecycle:
draft
→ specified
→ planned
→ in_progress
→ verification
→ review
→ ready_to_ship
→ shipped
→ maintained

Failure/control states include blocked, failed, and needs_human.

Work records:
- objective
- success criteria
- capabilities
- dependencies
- approval requirement
- verification references
- maintenance context
- timestamps

This gives Mia an explicit external state machine rather than relying on model context alone.

## Current capability boundary

Capabilities and teams are explicit domain objects.

Skill manifests declare required tools and verification names.
ExecutionContext carries granted tools.
The runtime blocks a skill whose required capabilities are not granted.

Important limitation:
Mia does not own the underlying tool execution runtime. The host harness does.

This is consistent with the 12-Factor Agents and harness-engineering themes.

## Current approval boundary

Approvals have:
- Work id
- run id
- action
- status
- timestamps
- optional note

Work keeps an approval projection while full approval events remain in UnifiedStore.

This is a strong fit for the corpus's repeated emphasis on explicit authorization and human control.

## Current verification boundary

The verification catalog contains:
- typecheck
- lint
- unused-code
- tests
- build

The runtime records EvidenceRecord values and associates them with runs.

This is strong repository-health verification.

It is not yet the same thing as:
- task outcome evaluation
- architecture evaluation
- maintainability evaluation
- model/prompt evaluation
- production quality measurement

That distinction is a research finding, not a confirmed deficiency.

## Current learning boundary

Learnings are project-scoped events with a sourceRunId.

The plan skill reads recent learning events and writes an explicit "Learnings Applied" section into PLAN.md.

The preamble also prints recent learnings.

Strength:
learning is externalized and survives runs.

Open question:
the current retrieval is primarily recency-based. The corpus suggests investigating relevance, freshness, provenance, curation, and invalidation before increasing learning influence.

## Current skill boundary

Skills are direct executable definitions in core/skills/index.ts.

Each SkillDefinition combines:
- manifest
- executor

The agent-facing surface is generated from the executable registry.

This directly matches:
- single source of truth
- composable skills
- progressive disclosure
- inspectable execution

The key research question is how skill changes should be proposed from evidence without bypassing human review.

## Current context engineering

Mia explicitly treats context as constrained.

Loading order:
entry rules
→ vocabulary
→ relevant workflow/reference
→ relevant skill
→ source/tests
→ evidence

Guidance favors:
- progressive disclosure
- narrow task-specific context
- removal of stale assumptions
- handoffs with objective, constraints, changed files, verification, and uncertainty

This is unusually aligned with the selected corpus.

## Current maintenance/feedback loop

The repository has operational observations and maintenance work.

An operational observation can be persisted in the timeline.
Maintenance Work can reference the observation and optionally source Work.

This provides a primitive:
production/operation observation → maintenance work

That aligns with the corpus's emphasis on development loops and learning from operations.

## Open PR state relevant to interpretation

Current open PRs must not be treated as canonical behavior:

PR #102:
Tightens execution boundaries and removes alternate APIs. Base master.

PR #105:
Maintainer cleanup of unused exports and agent-state coordination. Base master.

PR #111:
Reconciles cycle-007 orchestrator handoff/state. Base master.

These PRs indicate active work around runtime boundaries and agent coordination, but they are not part of the master baseline used here.

## Applicability matrix

| Area | Corpus pressure | Current Mia state | Potential research direction | Current action |
| --- | --- | --- | --- | --- |
| Context | Very high | Already explicit and implemented | Measure context quality and selection | Investigate |
| Verification | Very high | Strong repository checks | Add task/outcome evaluation only if justified | Investigate |
| Learning | High | Scoped sourceRunId learning loop | Relevance/freshness/curation | Investigate |
| Skills | High | Explicit registry + generated surface | Evidence-driven skill revision loop | Consider |
| Work lifecycle | High | Explicit state machine | Map agent actions to lifecycle authority | Consider |
| Capabilities | High | Admission contract exists | Test authorization semantics in real host workflows | Investigate |
| Approval | High | Explicit and persisted | Validate actual consequential-action coverage | Investigate |
| Ontology | Medium/contextual | No ontology | Add only for proven domain-semantic failures | Defer |
| Model routing | Medium/contextual | None | Need task-class evals first | Defer |
| Factory metrics | High | Timeline exists | Measure intervention/rework/reliability/cost | Investigate |
| Hosted runtime | Low | Deliberately absent | No reason to add now | Reject for now |
| Tool sprawl | Medium | Small explicit surface | Monitor growth and descriptions | Consider |

## Core conclusion

The videos mostly confirm the architecture Mia is already moving toward:

- explicit contracts
- external durable state
- controlled capabilities
- verification
- progressive context
- small skills
- human approval
- evidence-driven learning
- deliberate simplicity

The strongest opportunity is therefore not architectural expansion.

It is to make the existing loop more measurable and more selective:

context quality
→ execution quality
→ verification quality
→ human intervention/rework
→ learning quality
→ subsequent improvement

Any implementation should come only after that hypothesis is discussed and validated.
