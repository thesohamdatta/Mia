# AI Engineering Research → Repository Knowledge Base

**Status:** Research & Shared-Understanding Phase  
**Repository Baseline:** `master @ f0a24827546fdf1ab25f4219d08902a018754f30`  
**Research Branch:** `research/ai-engineer-video-corpus-20261002` (PR #112)  
**Execution Standard:** Source → Evidence → Principle → Repository observation → Potential implication → Validation  
**Production Code Changed:** None  

---

## 1. Corpus Status

| ID | Title | Speaker | Organization | Duration | Source / Transcript Status |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **AE-01** | *Coding Agents Don't Scale Themselves. Neither Do Your Teams.* | Patrick Debois | Tessl | 22:05 | **VERIFIED** — Official AI Engineer talk page & timestamped transcript |
| **AE-02** | *Why Software Factories Fail* | Dex Horthy | HumanLayer | 19:18 | **VERIFIED** — Official AI Engineer talk page & timestamped transcript |
| **AE-03** | *Software Fundamentals Matter More Than Ever* | Matt Pocock | AI Hero | 18:26 | **VERIFIED** — Official AI Engineer talk page & timestamped transcript |
| **AE-04** | *Why Agentic Systems Need Ontologies* | Frank Coyle | UC Berkeley | 21:18 | **VERIFIED** — Official AI Engineer talk page & transcript analysis |
| **AE-05** | *Harness Engineering: How to Build Software When Humans Steer, Agents Execute* | Ryan Lopopolo | OpenAI | 46:21 | **VERIFIED** — Official AI Engineer talk page & OpenAI technical foundation |
| **AE-06** | *12-Factor Agents: Patterns of reliable LLM applications* | Dex Horthy | HumanLayer | 17:06 | **VERIFIED** — Official AI Engineer talk page & canonical 12-Factor specification |
| **AE-07** | *No, That's Not a Software Factory* | Ryan Cooke | WorkOS | 18:59 | **VERIFIED** — Official AI Engineer talk page & chapter evidence |
| **AE-08** | *How Software Factories Improve Themselves* | Suraj Gupta | Warp | 12:52 | **VERIFIED** — Official AI Engineer talk page & chapter evidence |
| **AE-09** | *Total Recall: Agent Memory and Harness Engineering* | Ignacio Martinez | Oracle | 1:00:47 | **VERIFIED** — Official AI Engineer talk page & chapter evidence |
| **AE-10** | *Agents Without Code: Skills, YAML, and Filesystems Replaced Python* | Philipp Schmid | Google DeepMind | 18:27 | **VERIFIED** — Official AI Engineer talk page & chapter evidence |

---

## 2. Research Coverage & Evidence Discipline

### Methodology
Every finding adheres to strict epistemic classification:
- **EXPLICIT:** Directly articulated or demonstrated by the speaker.
- **INFERRED:** Logical deduction rooted directly in the speaker's arguments.
- **REPOSITORY APPLICATION:** Engineering interpretation of applicability to Mia's specific architecture.
- **CAVEATS / HEDGES:** Explicit limitations, boundaries, or uncertainties stated by the speaker.

### Unknowns & Research Limits
- Several talks evaluate massive organizational scale (e.g., hundreds of developers, thousands of PRs), whereas Mia is an in-process, single-developer/single-run local-first CLI.
- No public benchmark currently exists to score long-term software maintainability or architectural degradation caused by LLM agents (acknowledged explicitly by Dex Horthy in AE-02).
- The transition from recency-based retrieval to semantic/context-aware retrieval lacks empirical error traces within Mia’s own real-world runs.

---

## 3. Repository Architecture Model (Observed Truth)

```text
Host Environment (Claude Code, Terminal, Codex)
      ↓
mia <skill> [args...] (core/cli/index.ts)
      ↓
createExecutionContext() (core/context.ts)
      ↓
Skill Capability Admission Check (SkillDefinition.manifest vs ExecutionContext.grantedTools)
      ↓
executeWithMiddlewares() (core/skills/preamble.ts)
  ├── requireProject (warn if non-git)
  ├── loadRecentLearnings (tail 5 from UnifiedStore)
  └── logTimelineStart ('started' event)
      ↓
Skill Executor (core/skills/*/execute.ts)
      ↓
UnifiedStore / JSONL Persistence (~/.mia/projects/<slug>/events.jsonl)
  └── EventType: 'learning' | 'timeline' | 'checkpoint' | 'evidence' | 'approval'
```

### Invariants Confirmed via Code:
1. **Local-first, In-process:** Zero HTTP hops, zero daemons, zero background control servers.
2. **Explicit External State Machine:** `Work` lifecycle transitions strictly validated via `TRANSITIONS` matrix (`draft` → `specified` → `planned` → `in_progress` → `verification` → `review` → `ready_to_ship` → `shipped` → `maintained`).
3. **Deterministic Shell:** Model judgment is isolated from execution; execution is governed strictly by TypeScript runtime contracts.
4. **Verification Boundary:** The catalog (`typecheck`, `lint`, `unused-code`, `tests`, `build`) verifies repository compilation/regression health, not task-semantic fulfillment.

---

## 4. Per-Video Deep Knowledge Extraction

### AE-01: Coding Agents Don't Scale Themselves. Neither Do Your Teams.
- **Speaker:** Patrick Debois (Tessl)
- **Primary Concepts:** Dim factory, human-touch metrics, platform ownership, repair the generator.
- **EXPLICIT Claims:**
  - *[05:20]* "Stop fixing the code that the agent produced, but improve the system." An engineer fixing code manually resolves an artifact; encoding the fix in context, harnesses, or loops resolves all future artifacts.
  - *[09:24]* Key operational metrics: **Human touches** (number of human interventions required to achieve correctness; must trend downward) and **Multiplication reach** (number of engineers benefiting from a shared harness fix).
  - *[19:55]* "Dim Factory": Autonomy must be risk-adjusted. Not all features should be autonomous. High autonomy demands auditing, verification of utility, and situational awareness.
- **CAVEATS / HEDGES:**
  - Debois explicitly notes that human touches and reach are directional metrics, not formal mathematical productivity proofs.
  - Commoditization of agent loops by frontier labs is an assumption/forecast, not an established fact.
- **NOT Recommended:** Do not let a thousand uncoordinated harnesses/skills bloom without an accountable platform owner.

### AE-02: Why Software Factories Fail
- **Speaker:** Dex Horthy (HumanLayer)
- **Primary Concepts:** Maintainability debt, shotgun surgery, passing tests ≠ quality, front-loaded design.
- **EXPLICIT Claims:**
  - *[06:01]* Automation shifts the bottleneck: agent coding takes minutes; human code review and comprehension still take hours or days.
  - *[07:25]* "Cost of unread code": Autonomous development without comprehension creates a catastrophic recovery tax 3–6 months later during production incidents.
  - *[11:21]* Current RL reward functions in coding models (SWE-bench style) award binary points for making tests green. They provide zero penalty for expedient type casts, bloated exceptions, or shotgun surgery.
  - *[15:59]* Program design (call graphs, types, interfaces) must precede task slicing. 30 minutes of front-loaded alignment saves hours of review rework.
- **CAVEATS / HEDGES:**
  - Horthy explicitly admits: "I cannot prove this because there are no good benchmarks for a model's ability to maintain codebase quality over time." It is an experience-based finding.
- **NOT Recommended:** Do not run "lights-off" factories where code review is eliminated.

### AE-03: Software Fundamentals Matter More Than Ever
- **Speaker:** Matt Pocock (AI Hero)
- **Primary Concepts:** Shared design concept, ubiquitous language, deep modules, Grill Me.
- **EXPLICIT Claims:**
  - *[02:31]* Fast code generation accelerates software entropy. Without human design stewardship, repeated generation creates brittle systems.
  - *[04:41]* Unexpected agent implementations are requirements-gathering failures, not model intelligence failures. Collaborators must establish a shared "design concept" (Brooks) through exhaustive questioning before writing plans.
  - *[07:55]* Ubiquitous language: The developer, prompt, codebase, and tests must share an identical, documented vocabulary.
  - *[12:09]* Deep modules (Ousterhout): Maximize internal functionality behind small, simple interfaces. Shallow modules leak complexity into agent context.
- **CAVEATS / HEDGES:**
  - TDD and deep-module design do not eliminate bugs; they constrain agent step sizes to reduce cascading error propagation.
- **NOT Recommended:** Do not accept horizontal plans or jump into implementation without an interactive grill session.

### AE-04: Why Agentic Systems Need Ontologies
- **Speaker:** Frank Coyle (UC Berkeley)
- **Primary Concepts:** Neurosymbolic AI, formal logical guardrails, semantic validation.
- **EXPLICIT Claims:**
  - *[01:30]* Pure probabilistic reasoning lacks deterministic grounding. Unbounded agent loops drift, repeat actions, or execute illegal side effects.
  - *[14:39]* Validator Pattern: Input schema validation (e.g., Pydantic) + Output domain invariant validation (e.g., RDFS/OWL logic such as `FunctionalProperty` or disjointness).
- **CAVEATS / HEDGES:**
  - Full ontology engines (OWL reasoners, graph databases) are heavy and often overkill for straightforward software systems.
- **NOT Recommended:** Do not build heavy semantic web stacks unless domain ambiguity routinely breaks simpler typed state machines.

### AE-05: Harness Engineering: How to Build Software When Humans Steer, Agents Execute
- **Speaker:** Ryan Lopopolo (OpenAI)
- **Primary Concepts:** Code abundance, human attention scarcity, repository legibility, just-in-time context.
- **EXPLICIT Claims:**
  - Implementation code is abundant; human attention and model context are the scarce resources.
  - Repository legibility: The directory layout, canonical utilities, and clear boundaries act as persistent system prompts.
  - Context must arrive just-in-time rather than being dumped into monolithic initial prompts.
  - Verification guardrails must be deterministic, legible, and machine-enforceable.
- **CAVEATS / HEDGES:**
  - Harness engineering requires significant upfront investment in tooling and testing infrastructure.
- **NOT Recommended:** Do not rely on large prompt files as a replacement for clean code organization.

### AE-06: 12-Factor Agents: Patterns of Reliable LLM Applications
- **Speaker:** Dex Horthy (HumanLayer)
- **Primary Concepts:** Stateless reducer, external state, tools as structured outputs, human-in-the-loop tool calls.
- **EXPLICIT Claims:**
  - Factor 12: Make the agent a **stateless reducer**. The model takes external state + intent and emits structured actions; state mutation lives strictly in application code.
  - Factor 7: Contact humans via tool calls (`request_human_approval`). Pausing, resuming, and approval are first-class state events, not chat hacks.
  - Factor 3: Own your context window. Context is an engineered runtime variable.
- **CAVEATS / HEDGES:**
  - Highly bounded micro-loops require detailed state machines and schema maintenance.
- **NOT Recommended:** Do not build conversational multi-agent chat networks with hidden execution state.

### AE-07: No, That's Not a Software Factory
- **Speaker:** Ryan Cooke (WorkOS)
- **Primary Concepts:** End-to-end outcome delivery, event-driven progression, authorization boundaries.
- **EXPLICIT Claims:**
  - Generating PRs is an intermediate artifact, not software factory delivery. Delivery includes planning, review, deployment, and incident recovery.
  - Workflow progression should be driven by lifecycle events.
- **CAVEATS / HEDGES:**
  - Event-driven automation without clear authorization creates uncontrollable side effects.
- **NOT Recommended:** Do not treat PR volume as a productivity signal.

### AE-08: How Software Factories Improve Themselves
- **Speaker:** Suraj Gupta (Warp)
- **Primary Concepts:** Outer improvement loop, reviewed procedural changes, editable traceable memory.
- **EXPLICIT Claims:**
  - Outer loop: Run → Observe failures → Extract evidence → Propose skill/harness PR → Human review → Adopt.
  - Persistent memory must be editable, versioned, and tied to source run provenance (`sourceRunId`).
  - Model routing must be supported by task-class evaluation datasets, not intuition.
- **CAVEATS / HEDGES:**
  - Outer-loop optimization requires sufficient run volume to distinguish genuine patterns from noise.
- **NOT Recommended:** Never allow autonomous agents to self-modify production prompt/skill code without human PR review.

### AE-09: Total Recall: Agent Memory and Harness Engineering
- **Speaker:** Ignacio Martinez (Oracle)
- **Primary Concepts:** Mutable harness around frozen weights, selective memory tiers, context refreshment.
- **EXPLICIT Claims:**
  - System performance improves faster by engineering memory, context lenses, and tools than by waiting for model weight updates.
  - Raw history dumps poison model attention ("lost in the middle"). Memory must be curated, scoped, and refreshed per iteration.
- **CAVEATS / HEDGES:**
  - Vector retrieval introduces ranking, relevance, and chunking complexities that often perform worse than deterministic scoping for small repositories.
- **NOT Recommended:** Do not accumulate append-only conversation history indefinitely.

### AE-10: Agents Without Code: Skills, YAML, and Filesystems Replaced Python
- **Speaker:** Philipp Schmid (Google DeepMind)
- **Primary Concepts:** Deleting bespoke orchestration, filesystem handoffs, developer-owned domain logic.
- **EXPLICIT Claims:**
  - Custom agent loops and wrappers should be deleted when standard tools (bash, filesystem, CLI) and stronger models suffice.
  - Filesystem files serve as clean, inspectable handoff and state boundaries.
- **CAVEATS / HEDGES:**
  - Hosted managed runtimes can obscure local control; simplicity must be weighed against provider lock-in.
- **NOT Recommended:** Do not write complex multi-layer Python/TypeScript orchestration frameworks when simple CLI commands and files achieve the goal.

---

## 5. Cross-Video Synthesis & Principle Map

```text
       ┌─────────────────────────────────────────────────────────┐
       │                 HUMAN STRATEGIC STEERING                │
       │   Grill Me (AE-03) · Architecture · Scope Boundaries    │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              DETERMINISTIC APPLICATION HARNESS          │
       │   Stateless Reducer (AE-06) · Deep Modules (AE-03)      │
       │   Context Curation (AE-05,09) · Explicit Lifecycle (06)│
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               OBJECTIVE & SYSTEM VERIFICATION           │
       │   Passing Tests ≠ Maintainability (AE-02)               │
       │   Deterministic Health Checks · Objective Alignment     │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               OUTER SELF-IMPROVEMENT LOOP               │
       │   Repair Generator, Not Artifact (AE-01)                │
       │   Reviewed Skill PRs (AE-08) · Measure Human Touches    │
       └─────────────────────────────────────────────────────────┘
```

---

## 6. Repository Applicability Matrix

| Principle & Source | Classification | Current Mia Baseline | Concrete Gap | Potential Implication | Complexity & Risk | Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Objective Alignment Verification** (AE-02, AE-07) | REPOSITORY APPLICATION | Verification suite executes 5 checks (`typecheck`, `lint`, `knip`, `tests`, `build`). Green tests permit `ready_to_ship`. | No check verifies that changes match the `Work.objective` or `successCriteria`. | `mia review` & `mia ship` require structured objective evidence before advancing state. | Low complexity (~30 lines). Zero risk to existing checks. | **Investigate (Spec-A)** |
| **Phase-Scoped Learning Retrieval** (AE-05, AE-09) | REPOSITORY APPLICATION | Preamble middleware loads 5 most recent learnings across all types/phases unconditionally. | A `ship` learning is loaded during `plan`; older critical domain learnings are drowned out. | Add optional `phase` or `skill` tag to `LearningRecord`. Filter preamble to active phase first. | Low complexity (~25 lines in `preamble.ts` and `learn/execute.ts`). | **Investigate (Spec-B)** |
| **Factory-Level Metrics Reporting** (AE-01, AE-07) | REPOSITORY APPLICATION | UnifiedStore appends `started`, `completed`, `failed` timeline events. `mia retro` outputs raw text list. | No aggregation of failure rates, human interventions, or retry frequency. | Add structured metrics table to `mia retro` summarizing skill pass/fail ratios and turn counts. | Low complexity (~35 lines in `retro/execute.ts`). | **Investigate (Spec-C)** |
| **Neurosymbolic Graph Ontology** (AE-04) | REPOSITORY APPLICATION | Work, Capability, and Approval are typed TypeScript interfaces with runtime transition checks. | No OWL/RDFS formal logic layer. | None. Mia's explicit contracts already prevent invalid transitions deterministically. | High complexity. High maintenance cost. No observed failure. | **REJECT** |
| **Autonomous Self-Modifying Skills** (AE-08, AE-10) | REPOSITORY APPLICATION | Skills are compiled in `core/skills/index.ts`. Docs are generated. | None. Production skills are intentionally immutable at runtime. | None. Violates human control invariant. | Critical risk. Violates core principles. | **REJECT** |
| **Vector DB / Semantic Memory** (AE-09) | REPOSITORY APPLICATION | JSONL tail reading with predicate filters via `readJsonlTail`. | None. Project event logs are small (<1000 lines). | None. Embedding pipelines add dependencies, latency, and indeterminism. | High complexity. Unnecessary dependency. | **REJECT** |

---

## 7. Conflicts, Trade-Offs, and Engineering Judgment

1. **Abundant Generation vs. Review Bottleneck (AE-02 vs. Industry Hype):**  
   *Trade-off:* Generating code rapidly without human comprehension creates massive long-term recovery taxes.  
   *Mia Resolution:* Mia mandates `grill` before non-trivial work, externalizes `Work` items, and enforces human approval gates for consequential actions (`requiresHumanApproval`).
2. **Deterministic Contracts vs. Probabilistic Autonomy (AE-06 vs. Open-Ended Agents):**  
   *Trade-off:* Open-ended autonomous loops drift and hallucinate; strict state machines require explicit typing and transitions.  
   *Mia Resolution:* Mia treats LLMs as stateless reducers. Side effects, capability admission, and state transitions are owned strictly by TypeScript application code.
3. **Outer Improvement Loop vs. Stability (AE-01, AE-08):**  
   *Trade-off:* Systems that never learn repeat the same errors; systems that self-modify break determinism.  
   *Mia Resolution:* Learnings are recorded with `sourceRunId`. Procedural changes to skills MUST be authored as Git commits and reviewed via PRs.

---

## 8. Shared-Understanding Gate & Blocking Questions

Before writing specifications or tickets, the following architectural decisions must be confirmed by the human architect:

1. **PR Sequencing:** Will you review and merge open PRs #102 (boundary tightening) and #105 (maintainer health cleanup) on GitHub before we branch for implementation?
2. **Primary Optimization Target:** Among the valid candidate areas, what is the primary optimization goal for Mia today:
   - **Goal 1:** Strengthen task-outcome and objective alignment verification in `review`/`ship`?
   - **Goal 2:** Improve context discipline and learning retrieval in `preamble`?
   - **Goal 3:** Expose factory-level operational metrics in `retro`?
3. **Retrieval Evidence:** Have you observed real-world failure cases where recent learnings pushed out critical older learnings, justifying phase-tagging now, or should learnings remain strictly recency-based until data volume grows?

---

*End of Knowledge Extraction. Standing by for shared-understanding alignment.*
