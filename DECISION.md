# Decision Framework

Structured approach to engineering decisions that makes trade-offs explicit, traceable, and revisitable.

## Decision Hierarchy

When multiple valid options exist, optimize in this order:

```
1. Mission Alignment
2. Correctness (functional + safety)
3. Architecture (preserves future options)
4. Maintainability (low cost of change)
5. Reliability (graceful degradation, observability)
6. Developer Experience (clarity, tooling)
7. Performance (measured, not assumed)
8. Convenience
```

**Rule**: Never sacrifice a higher priority for a lower one without explicit, documented justification.

## Decision-Making Protocol

### Phase 1: Understand (Before Deciding)

| Step | Action | Output |
|------|--------|--------|
| 1.1 | Define the problem in one sentence | Problem statement |
| 1.2 | Identify constraints (hard/soft) | Constraint list |
| 1.3 | List assumptions (explicit vs. implicit) | Assumption register |
| 1.4 | Research: authoritative sources, prior art, similar decisions | Research brief |
| 1.5 | Identify stakeholders and impact radius | Stakeholder map |

### Phase 2: Explore Options

| Step | Action | Output |
|------|--------|--------|
| 2.1 | Generate ≥3 viable alternatives (including "do nothing") | Option set |
| 2.2 | For each: identify trade-offs (use Trade-off Matrix) | Trade-off analysis |
| 2.3 | Identify irreversible decisions (one-way doors) | Irreversibility register |
| 2.4 | Estimate effort, risk, maintenance burden | Effort/risk matrix |

### Phase 3: Decide

| Step | Action | Output |
|------|--------|--------|
| 3.1 | Apply Decision Hierarchy to rank options | Ranked options |
| 3.2 | Document rationale (why this, why not others) | Decision rationale |
| 3.3 | Define success criteria (measurable, time-bound) | Acceptance criteria |
| 3.4 | Define rollback/reversal plan | Rollback plan |
| 3.5 | Record as ADR (Architecture Decision Record) | ADR document |

### Phase 4: Verify & Evolve

| Step | Action | Output |
|------|--------|--------|
| 4.1 | Implement with verification gates | Working implementation |
| 4.2 | Measure against success criteria | Metrics dashboard |
| 4.3 | Schedule decision review (90 days default) | Review calendar |
| 4.4 | Update or supersede ADR when evidence changes | Updated ADR |

## Trade-off Matrix Template

For each option, evaluate against decision hierarchy:

| Criterion (Priority) | Option A | Option B | Option C | Notes |
|---------------------|----------|----------|----------|-------|
| **1. Mission Alignment** | | | | Does it serve the mission? |
| **2. Correctness** | | | | Functional + safety guarantees |
| **3. Architecture** | | | | Preserves future options? Coupling? |
| **4. Maintainability** | | | | Cost of change? Cognitive load? |
| **5. Reliability** | | | | Failure modes? Observability? |
| **6. Developer Experience** | | | | Clarity? Tooling? Onboarding? |
| **7. Performance** | | | | Measured? Bottlenecks? |
| **8. Convenience** | | | | Short-term ease? |

**Scoring**: ++ (strongly positive), + (positive), 0 (neutral), - (negative), -- (strongly negative)

## Irreversibility Classification

| Type | Description | Examples | Decision Process |
|------|-------------|----------|------------------|
| **One-Way Door** | Cannot be undone or extremely costly to reverse | Data model changes, public API contracts, security model, core architecture | Full ADR, multi-stakeholder review, explicit sign-off, extensive verification |
| **Two-Way Door** | Can be reversed with moderate effort | Library choice, internal tooling, configuration, feature flags | ADR-lite, team consensus, standard verification |
| **Revolving Door** | Trivial to change, experiment freely | Code formatting, variable names, local refactoring, prototyping | No formal process, revert if needed |

**Rule**: Default to two-way doors. Make one-way doors explicitly, deliberately, and rarely.

## Decision Quality Checklist

Before finalizing any significant decision, verify:

- [ ] Problem statement is clear and agreed upon
- [ ] Constraints are explicit (not assumed)
- [ ] ≥3 options were genuinely explored
- [ ] Trade-offs are documented for each option
- [ ] Irreversible decisions are identified and justified
- [ ] Decision hierarchy was applied correctly
- [ ] Success criteria are measurable and time-bound
- [ ] Rollback plan exists and is tested
- [ ] ADR is written and linked from relevant docs
- [ ] Review date is scheduled

## Common Decision Traps

| Trap | Symptom | Antidote |
|------|---------|----------|
| **Premature Convergence** | First plausible option chosen | Force ≥3 options; timebox exploration |
| **Analysis Paralysis** | Endless research, no decision | Set decision deadline; use two-way door default |
| **Hidden Assumptions** | "Everyone knows X" | Explicit assumption register; validate each |
| **Sunk Cost Fallacy** | "We've invested so much" | Evaluate from current state forward only |
| **Optimizing for Convenience** | Choosing easiest short-term path | Apply Decision Hierarchy rigorously |
| **False Consensus** | Silent agreement, private doubts | Require explicit dissent or documented concerns |
| **Tool-Driven Decisions** | "Let's use Technology X" | Start with problem, not solution |

## AI-Specific Decision Guidance

### When AI Recommends a Decision

1. **Demand rationale** — "Why this option? What were the alternatives?"
2. **Verify trade-offs** — Check that AI identified genuine downsides, not just benefits
3. **Test irreversibility** — Ask "What happens if we're wrong? How hard to undo?"
4. **Require evidence** — "What sources support this? What would change your recommendation?"
5. **Escalate one-way doors** — Human must approve irreversible decisions

### When AI Implements a Decision

1. **Verify against ADR** — Implementation must match documented rationale
2. **Check for scope creep** — Implementation shouldn't implicitly make new decisions
3. **Validate success criteria** — Tests must measure what ADR defined as success
4. **Document deviations** — Any implementation-driven changes to decision must update ADR

## ADR Template

```markdown
# ADR: [Title]

## Status
Proposed | Accepted | Superseded | Deprecated

## Context
What is the problem? What constraints exist? What assumptions?

## Decision
What did we decide? Be specific.

## Consequences
### Positive
- ...

### Negative
- ...

### Risks
- ...

## Alternatives Considered
1. **Alternative A** — Why rejected
2. **Alternative B** — Why rejected
3. **Do Nothing** — Why rejected

## Success Criteria
- Measurable criterion 1 (target, deadline)
- Measurable criterion 2 (target, deadline)

## Rollback Plan
- Trigger conditions
- Steps to reverse
- Estimated effort

## References
- Links to relevant docs, issues, discussions

## Review Date
YYYY-MM-DD (default: 90 days from acceptance)
```