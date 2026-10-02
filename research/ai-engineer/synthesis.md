# Cross-video synthesis

## 1. Strong recurring themes

### A. The harness is part of the product

Across the corpus, reliable agent systems are described as more than models. The surrounding system carries context, state, tools, constraints, verification, memory, and workflow control.

Mia already reflects this with:
CLI → ExecutionContext → middleware → skill executor → UnifiedStore/local files

This is a reinforcement of the current architectural direction, not a reason to create a second agent runtime.

### B. Context is a constrained resource

Repeated ideas:
- more context is not automatically better
- correctness and relevance matter
- stale or noisy information can be harmful
- progressive disclosure is preferable to prompt dumping
- compact reusable context can reduce repeated research
- context should be refreshed around the current step

Mia already documents progressive context loading and a small entry surface. The open question is whether current learning/context selection is sufficiently task-aware.

### C. Human judgment moves earlier instead of disappearing

The corpus repeatedly distinguishes:
- intent and design
- architecture and domain decisions
- implementation
- verification
- review
- deployment/operations

Several speakers describe failure when human review is removed but architecture and maintainability are not replaced by an equally strong signal.

Mia's grill → plan → execute → review shape directly fits this pattern.

### D. Verification must be broader than green tests

The videos distinguish passing tests from:
- correct outcomes
- domain correctness
- architectural maintainability
- human acceptance
- production behavior
- task-specific quality
- long-term recovery cost

Mia's deterministic repository checks are strong evidence for repository health. They do not establish that an agent solved the right problem or preserved architectural quality.

This is the clearest research gap to investigate further.

### E. Skills are procedural memory

Multiple speakers treat skills as reusable procedures rather than magical personas.

Mia already has:
- explicit SkillDefinition
- executable registry
- generated agent-facing skill surface
- progressive disclosure
- one owner per responsibility

The opportunity is not another skill framework. It is understanding how repeated execution evidence should influence future skill revisions.

### F. Memory must be curated and traceable

The corpus repeatedly distinguishes useful retained knowledge from raw history.

Strong pattern:
experience → extraction → provenance → selective reuse → correction/deletion

Mia has scoped project learnings and sourceRunId. That is a good base. The unresolved question is whether retrieval, freshness, confidence, relevance, and invalidation are strong enough for long-lived use.

### G. Determinism around nondeterminism

Reliable patterns place deterministic code around model decisions:
- explicit schemas
- capability admission
- controlled side effects
- verification catalogs
- lifecycle state machines
- approval boundaries
- bounded loops

This is strongly aligned with Mia's existing architecture.

### H. Improvement should be evidence-driven

The self-improving-factory material is strongest when there is a separate improvement loop and a review boundary.

Useful pattern:

run → observe → extract evidence → propose change → review → adopt → evaluate again

Not:

run → model rewrites itself → trust the result

### I. Repository legibility matters

The corpus repeatedly suggests that code organization, naming, canonical documents, utilities, tests, and review surfaces affect agent reliability.

Mia already treats AGENTS.md, CONTEXT.md, architecture, principles, skill registry, evidence semantics, and verification as part of the agent interface.

### J. Minimize bespoke orchestration

Several talks encourage deleting custom loops, wrappers, and duplicated machinery when a stronger substrate already provides them.

The transferable principle is:

Before adding infrastructure, prove the current boundary cannot express the requirement.

It does not imply that Mia should adopt hosted agent infrastructure.

## 2. Recurring principle map

| Principle | Supporting videos | Current Mia relation | Research status |
| --- | --- | --- | --- |
| Harness quality matters | 1,2,5,6,7,9,10 | Directly aligned | Strong |
| Context must be selective | 2,3,5,6,9,10 | Already documented/partly implemented | Strong |
| Human design ownership | 2,3,5,6 | Grill, plan, approval, review | Strong |
| Verification > confidence | 1,2,5,6,7 | Core repository principle | Strong |
| Task-specific evaluation | 1,2,7,8 | Not equivalent to current repo health checks | Needs research |
| Skills as procedural memory | 1,7,8,9,10 | Existing skill surface | Strong |
| Curated memory | 1,7,8,9 | Learnings + sourceRunId | Needs research |
| Externalize execution state | 2,6,9 | Work + UnifiedStore | Strong |
| Bounded autonomy | 1,2,4,6,9 | Capabilities + approval + lifecycle | Strong |
| Domain constraints outside model prose | 4 | Work/capability contracts may be a precursor | Context-dependent |
| Improve the improvement loop | 1,7,8,9 | Existing learn/retro/maintenance seams | Experimental |
| Delete unnecessary orchestration | 5,6,10 | Strong fit with simplicity principle | Strong |
| Measure human intervention/rework | 1,2,7 | Not clearly first-class today | Needs research |
| Tool selection/progressive exposure | 5,6,9,10 | Skill/tool surface is intentionally small | Context-dependent |
| Production feedback → work | 2,7,8,9 | Maintenance observation seam exists | Promising |

## 3. Tensions that need judgment

### Tension 1: general tools versus strict capability boundaries

Some talks favor broad general-purpose tools and model exploration. Mia favors explicit capability admission and clear side effects.

Resolution is not yet a code decision.

A plausible principle is:
general tools inside a controlled capability boundary, with explicit verification and authorization for consequential actions.

This needs validation against actual use cases.

### Tension 2: hosted orchestration versus local-first architecture

Hosted agent platforms can remove application-level loops, state, and compaction.

Mia intentionally avoids a daemon, HTTP control plane, and provider-specific runtime.

The transferable lesson is to delete unnecessary custom infrastructure when the substrate already provides it. The non-transferable part is adopting a cloud architecture without a concrete requirement.

### Tension 3: ontology versus simplicity

Formal domain models can provide stronger semantic constraints than types alone.

Mia's current scope is relatively small and local.

An ontology should not be introduced unless recurring domain-correctness failures demonstrate that simpler contracts cannot express the needed invariants.

### Tension 4: self-improvement versus human control

A factory can learn from its runs.

Mia's principles require explicit human control for consequential decisions.

The safest pattern from the corpus is:
evidence → proposed change → PR/review → adoption

not silent runtime self-modification.

### Tension 5: model routing versus complexity

Model routing can reduce cost for recurring task classes.

Without task-specific evaluations and enough repeated workload, routing becomes configuration plus guesswork.

This is a future optimization, not a current architectural requirement.

## 4. High-value research hypotheses

These are hypotheses to test later, not implementation requirements.

1. MIA would gain more from task-specific agent outcome evaluation than from adding another orchestration layer.
2. MIA's learning loop may need better relevance/freshness/curation before durable memory should influence planning more broadly.
3. Repeated review findings could become deterministic checks or documentation rules when the signal is stable.
4. Work, Evidence, Approval, and Capability contracts may already be the correct semantic boundary for future agent autonomy.
5. The existing direct local-first architecture may be sufficient for the core loop even as the model/harness around it becomes more capable.
6. Factory-level metrics should focus on outcome quality, intervention, rework, reliability, and cost rather than activity volume alone.

## 5. Things not justified by this corpus

Do not currently justify:
- a second agent runtime
- a daemon or HTTP control plane
- a large multi-agent framework
- a graph database
- an ontology stack
- automatic self-modifying production skills
- model routing without task-specific evaluations
- larger prompt files as a substitute for context engineering
- a generic memory database without proven retrieval/curation needs
