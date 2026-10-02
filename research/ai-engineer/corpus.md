# Per-video research records

Each record uses:
EXPLICIT = directly stated or clearly demonstrated.
INFERRED = reasoned interpretation from the source.
REPOSITORY APPLICATION = our interpretation of possible relevance to Mia.

## 1. Coding Agents Don't Scale Themselves. Neither Do Your Teams.
Speaker: Patrick Debois, Tessl
Duration: 22:05
Source: https://ai.engineer/talks/zCJtYuqwm7E-coding-agents-dont-scale-themselves-neither-do
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:01 organizational assumption behind autonomy
- 2:26 technical path for developers
- 5:20 move corrections into the code-producing system
- 7:03 change planning and surrounding workflow
- 9:24 measure intervention and reach
- 10:28 shared infrastructure ownership
- 12:05 sprawl and visible costs
- 15:15 separate AI use, judgment, and collaboration
- 19:53 autonomy by risk and knowledge preservation

EXPLICIT findings:
- Scaling coding agents is partly an organizational and platform-ownership problem, not only a model problem.
- Corrections and feedback should feed back into the system that produces future work.
- Agent infrastructure needs an accountable owner.
- Adoption should be measured in terms of intervention, reach, cost, and the work people still carry.
- Autonomy should be matched to risk.

INFERRED findings:
- A factory improves when repeated human corrections become reusable system assets.
- Agent quality is partly a property of the surrounding engineering system.
- Agent adoption without ownership creates local optimization and tool sprawl.

Potential Mia relevance:
- The existing .agents pipeline, learnings, verification, and skill surface could become a stronger closed loop.
- Metrics around human intervention or repeated rework may be more useful than generic activity counts.

Do not over-apply:
The talk's organizational operating model is much larger than Mia's current local CLI scope.

---

## 2. Why Software Factories Fail
Speaker: Dex Horthy, HumanLayer
Duration: 19:18
Source: https://ai.engineer/talks/Ib5GBkD555M-why-software-factories-fail
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:47 faster coding meets production
- 3:37 the existing software-development loops
- 6:01 automation moves the bottleneck
- 7:25 the cost of returning to unread code
- 10:13 why training in the harness matters
- 11:21 what passing tests teaches
- 13:11 architecture sends its bill later
- 14:48 move review and decisions earlier
- 15:59 design before slicing implementation
- 17:01 review overload and rework
- 17:54 build within constraints

EXPLICIT findings:
- Traditional software development already contains loops for planning, implementation, review, testing, deployment, and production feedback.
- Replacing implementation with agents can move the bottleneck to review, testing, architecture, or understanding.
- Passing tests is not sufficient evidence of long-term maintainability.
- Skipping code understanding can create a later recovery tax.
- Architecture and program design should happen before implementation is sliced into smaller agent tasks.
- Advice is context-dependent. A greenfield toy and an established codebase have different constraints.

INFERRED findings:
- Mia should avoid defining agent success only as "checks pass".
- The engineering process should preserve system understanding before and after code generation.
- Reviewability is a throughput constraint and can become the new bottleneck.

Potential Mia relevance:
- Strengthens the case for explicit planning, evidence, architecture boundaries, and maintainability checks.
- Suggests a future distinction between repository-health verification and outcome/architecture evaluation.

Do not over-apply:
The talk does not prove that autonomous development is universally harmful. It explicitly frames some claims as experience-based and highlights an evaluation gap.

---

## 3. Software Fundamentals Matter More Than Ever
Speaker: Matt Pocock
Duration: 18:26
Source: https://ai.engineer/talks/v4F1gFy-hqg-software-fundamentals-for-ai-coding
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:20 software fundamentals
- 4:35 shared understanding
- 5:57 Grill Me
- 8:58 ubiquitous language
- 9:51 feedback and TDD
- 11:09 TDD in small steps
- 16:16 human-owned interface design
- 17:16 strategic design versus tactical implementation

EXPLICIT findings:
- Shared understanding should exist before detailed implementation.
- Domain vocabulary reduces ambiguity between humans, code, and AI.
- Fast feedback and TDD constrain agents to smaller steps.
- Humans should retain strategic design responsibility while delegating tactical implementation.
- Code generation does not remove the need for software design fundamentals.

INFERRED findings:
- Mia's existing grill → plan → execute loop is strongly aligned with this principle.
- A stable project vocabulary is part of the context contract, not just documentation.
- Small verifiable steps can reduce agent error propagation.

Potential Mia relevance:
- Validate whether CONTEXT.md is the right canonical vocabulary boundary and whether additional domain language belongs elsewhere.
- Evaluate whether current plan artifacts contain enough design information before implementation.

---

## 4. Why Agentic Systems Need Ontologies
Speaker: Frank Coyle, UC Berkeley
Duration: 21:18
Source: https://ai.engineer/talks/Sir59K8ZDPU-ontologies-for-agentic-systems
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 1:30 neural and symbolic traditions
- 3:49 ontology as shared conceptualization
- 5:23 evolving domain model
- 9:18 inference and constraints
- 13:13 agent loops and side effects
- 14:39 validation inside the loop
- 17:43 type safety versus domain correctness

EXPLICIT findings:
- Probabilistic models benefit from external domain models and constraints.
- Domain models describe entities, properties, and relationships.
- Type validation and business/domain validation are different layers.
- Proposed behavior and tool results can be validated before side effects are accepted.
- Agent loops require control because drift, runaway iteration, and cost remain possible.

INFERRED findings:
- Strong schemas are not always enough when the real problem is semantic correctness.
- Critical domain invariants should live outside model prose when the domain justifies them.
- The right abstraction may be a small explicit invariant layer rather than a full ontology system.

Potential Mia relevance:
- Could inform future validation contracts for Work, capabilities, approvals, and evidence relationships.
- Could be useful if Mia develops richer task/agent semantics.

Do not apply blindly:
A graph ontology would be a major complexity increase for the current CLI unless concrete semantic failures justify it.

---

## 5. Harness Engineering: How to Build Software When Humans Steer, Agents Execute
Speaker: Ryan Lopopolo, OpenAI
Duration: 46:21
Source: https://ai.engineer/talks/am_oeAoUhew-harness-engineering
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 1:54 scarce resources
- 6:56 quality made legible and enforceable
- 11:21 right context at the right moment
- 21:26 repository and process design
- 24:04 just-in-time context
- 28:33 PRs as collaboration surface
- 30:28 expand automation after confidence grows
- 43:35 extend beyond code generation

EXPLICIT findings:
- Human time, human attention, and model context are practical constraints.
- Quality standards should become legible and enforceable through documentation, linting, tests, and review mechanisms.
- Context should arrive when it is needed instead of being dumped into an initial prompt.
- Repository structure and canonical utilities affect agent throughput and merge conflict risk.
- Pull requests can act as a collaboration surface between humans and agents.
- Automation should start from a trusted baseline and expand into additional engineering functions.

INFERRED findings:
- Mia's progressive-disclosure docs and canonical ownership map are already examples of harness engineering.
- Repository legibility is an engineering feature.
- Repeated review feedback should be converted into durable checks when the signal is stable.

Potential Mia relevance:
- Validate current context loading order and learnings injection against actual task success.
- Identify recurring review findings that could become deterministic checks.
- Treat repository structure as part of the agent interface.

---

## 6. 12-Factor Agents: Patterns of reliable LLM applications
Speaker: Dex Horthy, HumanLayer
Duration: 17:06
Source: https://ai.engineer/talks/8kMaTybvDUw-12-factor-agents
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections from the AI Engineer speaker catalog:
- 0:45 use model judgment only where it adds value
- 3:44 structured tool outputs and application-controlled execution
- 7:14 external execution state
- 9:14 context engineering
- 11:13 small focused loops inside deterministic workflows
- 14:44 owned and inspectable scaffolding

EXPLICIT findings:
- An agent should be used where model judgment adds value; deterministic sequences should remain deterministic.
- Tool calls can be treated as structured outputs interpreted and executed by application code.
- State should exist outside the model so long-running work can pause and resume.
- Context engineering is selection and representation, not maximum context size.
- Small bounded loops are easier to reason about than free-running autonomy.
- Human clarification and approval remain useful control points.

INFERRED findings:
- Mia's direct execution architecture is consistent with application-controlled execution.
- Work state, Evidence, and Approval living outside model context is a sound boundary.
- Future agent loops should attach to existing Work/lifecycle boundaries rather than become a second runtime.

Potential Mia relevance:
- Strong confirmation for preserving MIA as a contract/state layer around a host agent.
- Supports bounded automation and durable state.

---

## 7. No, That's Not a Software Factory
Speaker: Ryan Cooke, WorkOS
Duration: 18:59
Source: https://ai.engineer/talks/HvboD89DyQ8-no-thats-not-software-factory
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:12 a PR is an output, not the whole product result
- 3:11 surrounding process
- 5:07 webhooks and the next action
- 6:31 reviewed workflow
- 11:03 MCP gateway/context discovery
- 14:06 extending the process
- 15:57 measuring delivery and reliability
- 18:02 authorization remains unresolved

EXPLICIT findings:
- Producing pull requests does not by itself constitute a software factory.
- The surrounding planning, review, project coordination, context gathering, and follow-up process matters.
- Events can trigger the next workflow stage.
- Context discovery is a practical part of agent infrastructure.
- Delivery and reliability should be measured.
- Authorization boundaries remain a separate problem.

INFERRED findings:
- Mia's Work lifecycle should be judged as an end-to-end engineering process, not merely as a collection of commands.
- Event-driven continuation can be useful, but only when ownership and authorization are explicit.

---

## 8. How Software Factories Improve Themselves
Speaker: Suraj Gupta, Warp
Duration: 12:52
Source: https://ai.engineer/talks/TN3mj92oZ8I-software-factories-improve-themselves
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:12 factory improvement loop
- 2:04 reviewed skill changes
- 5:32 reusable investigation memory
- 8:46 model routing
- 11:19 evaluation sidecar

EXPLICIT findings:
- Recurring agent procedures can improve through a separate outer loop.
- The outer loop can observe runs and feedback and propose a skill change.
- A pull request and human review separate proposed improvement from adopted behavior.
- Persistent memories can carry reusable investigation facts forward.
- Memories should be editable, versioned, and linked to their source runs.
- Model routing should be based on task classes and evidence from task-specific evaluations.

INFERRED findings:
- MIA's learning loop is a foundation for procedural improvement, but the current implementation is simpler than a full outer-loop optimizer.
- Skill improvement should be treated as versioned engineering work, not automatic self-modification.
- Evaluation evidence should precede routing changes.

Potential Mia relevance:
- Future research opportunity: learning → candidate skill improvement → reviewed PR.
- Future research opportunity: task-class evaluation before model routing.

---

## 9. Total Recall: Agent Memory and Harness Engineering
Speaker: Ignacio Martinez, Oracle
Duration: 1:00:47
Source: https://ai.engineer/talks/xs-ob87TTzg-total-recall-agent-memory-harness-engineering
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:12 frozen reasoning, mutable harness
- 13:48 memory and collaboration
- 21:34 storage and retrieval
- 25:53 selective memory
- 34:04 context refresh per iteration
- 38:51 skill promotion
- 42:06 context selection/recovery
- 51:43 large toolboxes
- 55:08 patience limits and model choice

EXPLICIT findings:
- Agent behavior can improve by changing memory, tools, context, and orchestration without changing model weights.
- Files and databases serve different memory roles; a hybrid can be useful.
- Memory requires selection and refinement.
- Context should be assembled around current intent rather than dumping all history.
- Skills can capture reusable successful procedures.
- Recovery should have limits, and model choice can depend on task difficulty.
- Large toolboxes require distinguishable descriptions and selective exposure.

INFERRED findings:
- Mia's recent-learnings loader is a primitive selection mechanism, but selection quality should be validated before it is expanded.
- Provenance and editability are important if learnings become durable procedural knowledge.
- A context card or equivalent compact representation could become useful if tasks span more files and longer histories.

---

## 10. Agents Without Code: Skills, YAML, and Filesystems Replaced Python
Speaker: Philipp Schmid, Google DeepMind
Duration: 18:27
Source: https://ai.engineer/talks/fjF8EKnxKCU-agents-without-code-skills-yaml-filesystems
Transcript status: VERIFIED, official AI Engineer timestamped transcript page.

Key source sections:
- 0:12 agent loop
- 2:29 handwritten loop
- 5:06 framework orchestration
- 7:38 hosted sandbox
- 10:01 instructions, CLI, filesystem
- 12:28 execution versus developer ownership
- 14:37 extend capability without enlarging harness
- 16:30 files for memory/handoffs and verification

EXPLICIT findings:
- Execution machinery can move into frameworks or hosted environments without disappearing conceptually.
- General tools plus filesystem access can replace bespoke tool wrappers in some tasks.
- Managed execution can own routing, session state, and context compaction while developers still own instructions, capabilities, evaluations, and outcome verification.
- Files can carry preferences and handoffs.
- Better models can make previously necessary orchestration removable.

INFERRED findings:
- Mia should continually ask whether each layer of custom machinery still earns its complexity.
- The principle is deletion and simplification, not "files instead of architecture" as a universal rule.
- Capability expansion should be evaluated against security, observability, and verification boundaries.

Do not apply blindly:
Hosted execution or a larger service architecture would conflict with Mia's current local-first design unless an explicit need emerges.
