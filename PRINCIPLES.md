# Timeless Engineering Principles

Layer 1 — Changes over decades. Derived from: The Pragmatic Programmer, Clean Architecture, Code Complete, Release It!, AI Engineering, A Philosophy of Software Design, Designing Data-Intensive Applications, Domain-Driven Design, Refactoring, Google SRE, Amazon Builders Library, **Clean Code, AI-Assisted Programming**.

---

## 1. Complexity Management

### Essential vs. Accidental Complexity
- **Essential complexity**: Inherent to the problem domain — cannot be eliminated, only managed.
- **Accidental complexity**: Arises from implementation choices — should be minimized.
- **Principle**: Every architectural decision should reduce accidental complexity without increasing essential complexity.

### Causes of Complexity (Ousterhout)
| Cause | Description | Mitigation |
|-------|-------------|------------|
| **Dependencies** | Code cannot be understood/modified in isolation | Information hiding, deep modules, minimize interface surface |
| **Obscurity** | Important information is not obvious | Clear naming, documentation, consistent patterns, explicit contracts |

### Strategic vs. Tactical Programming
- **Tactical**: Get something working fast. Accumulates complexity debt.
- **Strategic**: Invest in good design. Pays compound interest over time.
- **Rule**: Default to strategic. Tactical only for genuine throwaway prototypes (timeboxed).

---

## 2. Abstraction & Modularity

### Modules Should Be Deep
- **Deep module**: Simple interface, rich functionality (high value/complexity ratio).
- **Shallow module**: Complex interface, little functionality (low value/complexity ratio).
- **Rule**: Design modules to be deep. Best modules provide powerful functionality through simple interfaces.

### Information Hiding
- Hide design decisions that are likely to change.
- Module interface should reveal *what* it does, not *how*.
- **Bounded Contexts**: Explicit boundaries where a domain model applies. Anti-corruption layers protect from external pollution.

### Single Responsibility Principle
- A module/class/function should have one reason to change.
- **Cohesion**: Related things together. **Coupling**: Unrelated things apart.
- **Rule**: If you can't describe a module's responsibility in one sentence without "and", it's doing too much.

### Clean Code Principles (Martin)
- **Meaningful Names**: Use intention-revealing names. Avoid disinformation. Make meaningful distinctions.
- **Functions Should Do One Thing**: Functions should do one thing. Do it well. Do it only.
- **One Level of Abstraction per Function**: Statements within a function should all be at the same level of abstraction.
- **Comments**: Don't comment bad code — rewrite it. Good code explains itself. Comments should compensate for inadequacies in expressing intent in code.
- **Formatting**: Use consistent formatting. Vertical openness between concepts. Vertical density for related concepts.
- **Error Handling**: Use exceptions rather than return codes. Write try-catch-finally statements first. Provide context with exceptions.
- **Boundaries**: Use learning tests to learn third-party boundaries. Keep boundary code separate and clean.

### Refactoring Techniques (Fowler)
- **Extract Method**: Turn a code fragment into a method whose name explains its purpose.
- **Inline Method**: Replace a method call with the method's body, then remove the method.
- **Move Method**: Move a method from one class to another when it uses/is used by more features of another class.
- **Move Field**: Move a field from one class to another when it is used more by another class.
- **Extract Class**: When a class does work that should be done by two classes, split it.
- **Inline Class**: When a class isn't doing enough work, move its features to another class and remove it.
- **Hide Delegate**: Clients calling a delegate's methods on an object get coupling to the delegate. Hide the delegate behind methods on the forwarding object.
- **Remove Middle Man**: A class doing too much delegation should have its clients call the delegate directly.
- **Substitute Algorithm**: Replace an algorithm with one that is clearer or more efficient.
- **Split Temporary Variable**: When a temporary variable is assigned to more than once, split it into separate variables.
- **Replace Method with Method Object**: When a long method uses local variables in such a way that you can't apply Extract Method, turn the method into an object.
- **Introduce Explaining Variable**: Instead of a comment, put the expression in a well-named temporary variable.
- **Split Temporary Variable**: When a temporary variable is assigned to more than once, split it into separate variables.
- **Replace Constructor with Factory Method**: When you want to do more than just construct an object when it's created, replace the constructor with a factory method.
- **Encapsulate Field**: Make field private and provide accessors.
- **Encapsulate Collection**: Make collection private and provide methods that return read-only views or copies.
- **Replace Record with Data Class**: When you have a record-like data structure, replace it with a proper data class.
- **Replace Type Code with Class**: When you have a type code (enum, constants) that affects behavior, replace it with a class.
- **Replace Type Code with Subclasses**: When you have a type code that affects behavior, replace it with subclasses.
- **Replace Type Code with State/Strategy**: When you have a type code that affects behavior, replace it with State or Strategy pattern.
- **Replace Subclass with Fields**: When you have subclasses that only vary in constant data, replace them with fields in the superclass.

### AI-Assisted Programming Practices (O'Reilly)
- **Context Window Management**: Treat context as a limited resource. Prioritize relevant information.
- **Prompt Engineering**: Write clear, specific prompts that constrain the AI's output space.
- **Iterative Refinement**: Use AI for exploration, then refine with human judgment.
- **Tool Integration**: Seamlessly integrate AI tools into IDE workflow to maintain flow state.
- **Boilerplate Generation**: Use AI for generating boilerplate code, then focus on business logic.
- **Documentation Generation**: Let AI generate initial documentation, then review and refine.
- **Test Generation**: Use AI to generate test cases, especially edge cases, then validate.
- **Refactoring Assistance**: Use AI to suggest refactorings, but validate behavior preservation.
- **Debugging Assistance**: Use AI to hypothesize root causes, then verify through investigation.
- **Learning Assistance**: Use AI to explain unfamiliar code or concepts, then verify with authoritative sources.

## 3. Architecture & Design

### Architecture = Significant Decisions
- **Significant decision** = hard to change later (data models, service boundaries, consistency models, tech stack).
- **Goal of architecture**: Minimize human resources required to build and maintain the system.
- **Measure of design quality**: Effort required to meet customer needs. Low effort = good design. Growing effort = bad design.

### Architecture Preserves Options
- Good architecture keeps future options open.
- **Decoupling layers**: UI, business logic, data access, infrastructure.
- **Decoupling use cases**: Each use case independent.
- **Decoupling modes**: Development, deployment, operation, maintenance.

### Bounded Contexts & Clear Contracts
- Explicit contracts: Schema, SLA, versioning policy.
- **Anti-corruption layer**: Protect domain model from external changes.
- **Autonomous deployment**: Services evolve independently.

### Design for Testability
- Tests are first-class system components.
- **Humble Object Pattern**: Hard-to-test infrastructure → thin wrapper → testable core.
- **Dependency Injection**: Enable test doubles for external dependencies.

---

## 4. Reliability & Resilience

### Design for Failure (Nygard)
> "Everything fails, all the time." — Werner Vogels

| Pattern | Purpose |
|---------|---------|
| **Timeouts** | Prevent indefinite blocking |
| **Circuit Breaker** | Fail fast when dependency unhealthy |
| **Bulkheads** | Isolate failures, contain blast radius |
| **Retry with Backoff** | Handle transient failures |
| **Idempotency** | Safe retries without side effects |
| **Graceful Degradation** | Reduced functionality > total failure |

### Data Consistency Is a Spectrum (Kleppmann)
- **Strong consistency** where correctness demands it (payments, inventory).
- **Eventual consistency** for high-throughput, tolerant domains (analytics, search).
- **Explicit consistency boundaries**: Document where each model applies.
- **Compensating transactions** over distributed transactions (saga pattern).

### Observability by Default (Google SRE)
- **Three pillars**: Structured logs, metrics, distributed traces.
- **Cardinality management**: High-cardinality fields (user_id, request_id) for debugging.
- **Sampling strategies**: Tail-based sampling for traces, adaptive for logs.
- **Observability ≠ Monitoring**: Monitoring tells you *that* something is wrong. Observability tells you *why*.

### Reliability Is a Feature
- **SLOs > SLAs > SLIs**: Define "reliable" quantitatively.
- **Error budgets**: Make reliability trade-offs explicit.
- **Toil elimination**: Automate repetitive operational work.

---

## 5. Testing & Verification

### Verification Over Confidence
> "Testing shows the presence, not the absence of bugs." — Dijkstra

- Prefer deterministic verification (tests, types, contracts) over human review.
- Make invalid states unrepresentable (type-driven design).
- Verify at boundaries: inputs, outputs, side effects.

### Test Strategy (Test Trophy)
| Type | Proportion | Focus |
|------|------------|-------|
| **Unit** | ~70% | Pure logic, fast, deterministic |
| **Integration** | ~20% | Real dependencies, contract verification |
| **E2E** | ~10% | Critical user journeys |
| **Property-based** | — | Discover edge cases humans miss |
| **Contract** | — | Consumer-driven contracts for service boundaries |

### Tests as Documentation
- Test names describe behavior: `should_return_404_when_user_not_found`
- Arrange-Act-Assert structure for readability.
- Test data builders over fixtures for flexibility.
- **Tests are the only documentation that stays in sync with code.**

---

## 6. AI Engineering Principles

### Probabilistic Systems Require Deterministic Guardrails
- **Evaluation-Driven Development (EDD)**: Define success criteria before building.
- **Structured reasoning**: Chain-of-thought, ReAct, self-consistency.
- **Verification layers**: Lint → Unit → Integration → Eval → Canary → Production.
- **Human oversight**: Escalation paths for uncertainty, ambiguity, high-stakes decisions.

### Context Engineering as First-Class Discipline
> "Treat context as a limited engineering resource."

- **Layered documentation**: Enduring principles (global) → Domain specifics (local) → Ephemeral (session).
- **Progressive disclosure**: Load detail on demand, not pre-injected.
- **Token efficiency**: Every token in context has opportunity cost.
- **Context hygiene**: Remove stale context, avoid contamination.

### Evaluation-Driven Development (EDD)
- Define eval criteria before writing code.
- Golden datasets > synthetic benchmarks.
- Continuous eval in CI/CD (regression detection).
- Human evaluation for subjective qualities (tone, helpfulness, safety).

### Agent Architecture Principles
| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | Each agent does one thing well. Specialized > monolithic. |
| **Clear Activation Triggers** | "Use when..." in descriptions. Explicit > implicit. |
| **Composable Workflows** | Orchestrators coordinate, workers execute. |
| **Progressive Disclosure** | Tier 1: Navigation (always loaded) → Tier 2: Core guidance (on activation) → Tier 3: Deep refs (on demand). |
| **Portable Content** | Source = markdown + YAML. Adapters handle harness mechanics. No harness logic in source. |

---

## 7. Workflow & Process

### Intent Before Implementation
> "NEVER START IMPLEMENTING, UNLESS USER WANTS YOU TO IMPLEMENT SOMETHING EXPLICITLY."

**Phases:**
1. **Intent Gate** — Classify request, check ambiguity, validate assumptions.
2. **Codebase Assessment** — Understand existing patterns before changing.
3. **Exploration → Implementation → Verification** — With evidence at each step.
4. **Completion Checklist** — All todos done, diagnostics clean, build passes.

### Parallel by Default
- Fire exploration agents in parallel.
- Continue working while background tasks run.
- Collect results when needed, cancel when done.

### Evidence-Based Completion
> "NO EVIDENCE = NOT COMPLETE."

| Action | Required Evidence |
|--------|-------------------|
| File edit | LSP diagnostics clean on changed files |
| Build command | Exit code 0 |
| Test run | Pass (or document pre-existing failures) |
| Delegation | Results received AND verified |

### Incremental Delivery Reduces Risk
- **Small batches**: Smaller changes = smaller blast radius, faster feedback.
- **Feature flags**: Decouple deployment from release.
- **Rollback capability**: Every deploy must be reversible in minutes.

### Failure Recovery
- Fix root causes, not symptoms.
- Re-verify after EVERY fix attempt.
- Never shotgun debug (random changes hoping something works).
- **After 3 consecutive failures**: STOP → REVERT → DOCUMENT → CONSULT → ASK USER.

---

## 8. Knowledge Management

### Continuous Learning (The Pragmatic Programmer)
- **Knowledge Portfolio**: Invest regularly, diversify, manage risk, buy low/sell high, review/rebalance.
- Learn at least one new language/year. Read technical books quarterly.
- **Critical thinking**: Never underestimate commercialism. Analyze what you read.

### Memory Systems (AI Engineering + OpenClaw)
- **Daily notes**: Raw logs of what happened (`memory/YYYY-MM-DD.md`).
- **Long-term**: Curated wisdom (`MEMORY.md`) — distilled essence, not raw logs.
- **Periodic review**: Fold daily notes into MEMORY.md. Remove outdated entries.

### Decision Records (Clean Architecture + DDIA)
- **ADR Template**: Context → Decision → Consequences (Positive/Negative/Risks) → Alternatives → References.
- Every significant architectural decision must have an ADR.

---

## 9. Communication & Collaboration

### Know What You Want to Say
- Plan what you want to say. Write an outline.
- "Does this get across whatever I'm trying to say?" Refine until it does.

### Know Your Audience
- WISDOM: **W**hat do they want to learn? **I**nterest? **S**ophistication? **D**etail level? **O**wnership? **M**otivation?
- Adjust pitch for each stakeholder.

### Choose Your Moment & Style
- Bad timing kills good ideas.
- Match style to audience (formal vs. conversational, briefing vs. chat).
- Make it look good — presentation matters.

### Listen & Respond
- Encourage dialogue. Turn meetings into conversations.
- Always respond to communications (even "I'll get back to you").
- Archive and organize communications.

---

## 10. Anti-Patterns to Avoid

| Anti-Pattern | Why Harmful | Alternative |
|--------------|-------------|-------------|
| Premature abstraction | Creates wrong abstraction, hard to undo | Duplicate until 3+ instances |
| Cargo-cult practices | Copies form without understanding | First-principles reasoning |
| Over-engineering | Adds complexity without value | YAGNI — You Aren't Gonna Need It |
| Hidden assumptions | Silent failures, hard to debug | Explicit contracts, validation |
| Type suppression (`any`, `@ts-ignore`) | Defeats type safety, masks bugs | Fix the type, not the error |
| Shotgun debugging | Random changes, no learning | Systematic: hypothesize → test → verify |
| Large refactors without tests | High risk, hard to verify | Strangler fig, incremental with tests |
| Framework lock-in | Reduces portability, increases switching cost | Portable patterns, adapter pattern |
| Duplicate knowledge | Drift, inconsistency, maintenance burden | Single source of truth, DRY |

---

## Source Reference Map

|| Principle | Primary Source | Type |
|-----------|----------------|------||
| Essential vs. Accidental Complexity | *The Mythical Man-Month* (Brooks) | Book |
| Deep Modules / Information Hiding | *A Philosophy of Software Design* (Ousterhout) | Book |
| Strategic vs. Tactical Programming | *A Philosophy of Software Design* (Ousterhout) | Book |
| Dependency Rule / Clean Architecture | *Clean Architecture* (Martin) | Book |
| Bounded Contexts / DDD | *Domain-Driven Design* (Evans) | Book |
| Stability Patterns (Circuit Breaker, etc.) | *Release It!* (Nygard) | Book |
| Data Consistency Spectrum | *Designing Data-Intensive Applications* (Kleppmann) | Book |
| Observability / SRE | *Google SRE Book*, *Observability Engineering* (Majors) | Book |
| Test Trophy | Kent C. Dodds (blog) | Engineering Blog |
| Pragmatic Philosophy (DRY, Orthogonality, etc.) | *The Pragmatic Programmer* (Hunt/Thomas) | Book |
| Construction Practices / PPP | *Code Complete* (McConnell) | Book |
| Evaluation-Driven Development | *AI Engineering* (Huyen) | Book |
| Context Engineering | Project Instructions, *AI Engineering* (Huyen) | Internal / Book |
| Agent Architecture / Progressive Disclosure | claude-agents Architecture | Framework |
| Intent Gate / Evidence-Based Completion | claude-code-config CLAUDE.md | Config |
| AI Failure Modes | GPT CONVERSATION research | Research |
| **Clean Code Principles** | *Clean Code* (Martin) | Book |
| **Refactoring Techniques** | *Refactoring: Improving the Design of Existing Code* (Fowler) | Book |
| **AI-Assisted Programming Practices** | *AI-Assisted Programming* (O'Reilly) | Book |
| **Agentic Development Resources** | Official docs & GitHub resources (OpenAI Agents SDK, Claude Code, OpenClaw, etc.) | Resource Collection |