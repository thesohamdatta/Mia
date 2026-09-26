# MIA v0.4 — Personal AI Engineering Organization

## Status

Proposed implementation specification. This is the product and engineering contract for v0.4. It does not prescribe model vendors or a distributed architecture.

## 1. Vision

MIA is a personal AI organization and engineering operating system. A human states an objective in natural language. MIA understands the intent, determines the work required, assembles the appropriate capabilities/teams, executes a disciplined engineering lifecycle, verifies outcomes with evidence, ships when authorized, maintains the resulting system, and learns from the work.

The human retains final authority over consequential decisions.

## 2. Design principles

- Simple: the human sees a small interface; complexity stays behind stable boundaries.
- Traditional engineering first: requirements, design, version control, testing, review, release, operations and maintenance remain first-class.
- AI-native acceleration: intent understanding, delegation, parallel work, tool use, evaluation and learning improve execution.
- One source of truth: one runtime skill registry; generated host-facing surfaces are adapters.
- Evidence over confidence: important claims require recorded verification evidence.
- Small/deep modules: narrow interfaces; implementation complexity hidden behind them.
- Reversible change: important automation and self-improvement are observable, versioned and recoverable.
- Progressive autonomy: capability grows only after the workflow is reliable.
- Human authority: MIA may recommend and execute within granted scope, but consequential approvals remain explicit.

## 3. User experience

Primary interaction:

  Human -> MIA -> Root AI -> work -> result

The user should not need to manually instantiate or coordinate specialist agents.

Example:

  "Build a mobile app that does X."

MIA should determine whether research, product, mobile, backend, UI/UX, QA, release, or other capabilities are required, using only the necessary subset.

The public surface should remain intentionally small. Initial agent-facing skills:

- /plan
- /review
- /ship

Additional lifecycle capabilities are internal or progressively exposed.

## 4. Conceptual architecture

  Human
    |
    v
  Root AI
    |
    v
  Work / SDLC
    |
    v
  Capabilities / Teams
    |
    v
  Skills
    |
    v
  Execution capabilities
    |
    v
  Repository / tools / CI / external systems
    |
    v
  Evidence
    |
    v
  State / learning

MIA is a modular monolith for v0.4. No daemon, HTTP control plane, distributed actor system, or custom workflow language is required.

## 5. Core domain

Project: repository or product being worked on.

Work: objective moving through the MIA lifecycle.

Capability: bounded responsibility such as research, software, hardware, mobile, design, QA, or sales.

Team/persona: a temporary or reusable composition of capabilities and skills with responsibilities and context.

Skill: an executable workflow or use case.

Run: one execution with stable identity.

Evidence: recorded result supporting a claim.

Decision: explicit product, engineering, or authority decision.

Learning: reusable information derived from observed outcomes.

## 6. Lifecycle

Intent
-> Discover
-> Specify
-> Design
-> Plan
-> Build
-> Verify
-> Review
-> Ship
-> Operate
-> Maintain
-> Learn
-> Improve
-> next cycle

Minimum Work states:

- draft
- specified
- planned
- in_progress
- verification
- review
- ready_to_ship
- shipped
- maintained
- blocked
- failed
- needs_human

Transitions are owned by workflow logic. Agents do not invent arbitrary lifecycle states.

## 7. Root AI contract

Input:

- human request
- project context
- current work state
- available capabilities
- relevant memory or learnings
- authority and policy constraints

Output:

- interpreted objective
- unresolved ambiguity
- work decomposition
- selected capabilities or teams
- lifecycle stage and next actions
- dependencies
- approval requirements
- expected evidence

Root AI is primarily a governor and orchestrator. It is not the implementation layer.

## 8. Capability and team model

Personas are not hard-coded agent classes. They are capability compositions.

Examples:

Research, Product, Software, AI/ML, Mobile, Web, Backend, Infrastructure, Hardware, Firmware, UI/UX, QA, Security, DevOps, Sales, Marketing, Support, Maintenance.

MIA may instantiate a focused team for a task rather than creating every possible role for every project.

## 9. Skill system

Canonical runtime source:

- core/skills/index.ts
- core/skills/*

Generated agent-facing surfaces:

- host-native SKILL.md adapters

Requirements:

- no duplicate registries
- generated files are clearly marked as adapters
- foreign or unmanaged skill files are never overwritten
- host integration is additive and safe
- skills remain usable across supported agent hosts without coupling runtime logic to one model
- downstream skills consume upstream artifacts rather than recreating them

Primary gstack-derived principles:

- skills map to real engineering responsibilities
- workflows connect into a lifecycle
- deep context is progressively disclosed
- real-project invocation tests complement static checks

## 10. Evidence and verification

Every consequential stage produces evidence.

Examples:

- requirement decision -> recorded decision
- test claim -> test output or CI run
- review claim -> review record
- release claim -> release, commit, and CI evidence
- incident resolution -> reproduction plus verification

No completion claim without scoped evidence.

## 11. Human authority

MIA may operate autonomously within explicitly granted scope.

Human approval is required for consequential actions such as:

- destructive repository actions
- production-impacting releases when not pre-authorized
- changes to authority or policy
- meaningful self-modification
- irreversible external actions

Approval state must be recorded.

## 12. State and memory

Use the existing UnifiedStore as the starting persistence boundary.

Persist only information that supports future work:

- project timeline
- checkpoints
- learnings
- verification evidence
- decisions

Avoid creating separate storage systems unless a measured need appears.

## 13. Learning

v0.4 uses an evidence-driven learning loop:

  observe -> record -> evaluate -> distill -> apply -> verify

Learning targets:

- user preferences and work style
- project-specific knowledge
- workflow performance
- agent or capability performance
- recurring failures

Do not introduce RL training infrastructure in v0.4.

## 14. Self-improvement

Future self-improvement follows:

  observe weakness
  -> propose change
  -> experiment
  -> test
  -> evaluate
  -> version
  -> approve or accept under policy
  -> deploy or revert

No uncontrolled self-editing loop.

## 15. gstack alignment

MIA uses gstack as the primary reference for agent-facing engineering workflows and host discovery.

Adapt:

- Markdown-defined skills
- role and workflow specialization
- progressive disclosure
- connected lifecycle
- setup and discovery adapters
- real invocation testing
- learning and retrospective loops

Do not copy:

- unnecessary host-specific complexity
- large installer or runtime surfaces
- provider-specific architecture that MIA does not need

## 16. v0.4 scope

In scope:

1. This specification and acceptance criteria.
2. Explicit Work lifecycle and state machine.
3. Minimal Root AI contract.
4. Capability and team contract.
5. gstack-style generated agent skill surface.
6. Safe host setup and discovery for initial supported hosts.
7. Evidence contract integrated with existing state.
8. Deterministic and agent-oriented end-to-end acceptance tests.
9. CLI compatibility with the current direct execution model.

Out of scope:

- RL training
- production-grade autonomous self-modification
- distributed multi-process orchestration
- permanent agent swarms
- daemon or HTTP control plane
- custom workflow DSL
- broad external marketplace
- automatic production deployment without explicit policy

## 17. Acceptance criteria

### A. Intent

Given a natural-language objective, MIA produces an explicit objective and identifies unresolved ambiguity.

### B. Planning

MIA can create a Work item with lifecycle state, required capabilities, dependencies, and success criteria.

### C. Delegation

Root AI can assign work to one or more capabilities using the common Work and Skill contract.

### D. Execution

A selected skill can execute through existing MIA runtime boundaries.

### E. Verification

A consequential claim has attached evidence.

### F. Continuation

A later run can recover the work from persisted project state.

### G. Agent discovery

At least one supported coding agent can discover MIA's generated skill surface and invoke a core workflow.

### H. Safety

Unmanaged existing skill files are not overwritten by setup.

### I. Shipping

A Work item cannot be marked shipped unless required verification gates are satisfied and any required human approval is recorded.

### J. Learning

A completed run can record a learning and make it available to a later run.

### K. Regression

Existing MIA commands and the current direct execution architecture remain functional unless explicitly superseded by an accepted ADR.

## 18. Delivery sequence

PR1 - Product spec and architecture decision records

PR2 - Work domain contracts and lifecycle state machine, tests first

PR3 - Root AI planning contract

PR4 - Capability and team contract

PR5 - gstack-style skill discovery and generation

PR6 - Host setup for initial agents

PR7 - Evidence and approval integration

PR8 - End-to-end intent -> plan -> execute -> verify workflow

PR9 - Operate and maintain loop

PR10 - Evaluation and learning loop

Only after these are stable: investigate deeper autonomy, RL, and self-improvement.

## 19. Verification gate

For every implementation PR:

  lint -> typecheck -> tests -> build -> targeted behavior

For agent-facing changes additionally run:

- skill generation tests
- host discovery or setup tests
- real invocation E2E tests
- regression coverage for unmanaged files
- failure recovery tests

## 20. Definition of v0.4 done

MIA v0.4 is complete when a human can state a meaningful software or product objective in natural language and MIA can:

1. understand it
2. create explicit Work
3. select appropriate capabilities
4. move the Work through the defined lifecycle
5. execute using existing MIA and tool boundaries
6. produce verification evidence
7. stop for human decisions when required
8. persist enough state to resume
9. expose the workflow to a supported coding agent through a simple skill interface

The system must remain small enough that its architecture can be understood from a handful of core modules.
