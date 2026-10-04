# Shared-understanding gate

No master specification has been written.

These questions are deliberately narrow. They should be answered before turning the research into implementation work.

## 1. What outcome are we optimizing?

Which result matters most for Mia:
- better generated code
- better end-to-end engineering outcomes
- lower human review/rework
- stronger reliability
- better agent context
- faster delivery without quality loss
- a durable self-improving engineering loop

Do not optimize all of them at once.

## 2. What does "better" mean in measurable terms?

The corpus repeatedly criticizes activity-based measures and weak signals.

Possible observable signals include:
- task completion quality
- verification pass rate
- human intervention
- review rework
- recurrence of the same failure
- recovery time
- context reuse
- cost
- time-to-verified outcome

Which signals actually matter to this project?

## 3. Is repository verification enough?

Mia can prove typecheck, lint, unused-code, tests, and build.

What evidence is still missing for the claim:
"the agent solved the requested engineering problem correctly and sustainably"?

This is likely the most important research question.

## 4. Should learnings remain recency-based?

Current learning use is intentionally simple.

Before adding semantic retrieval, ask:
- What concrete failure does recency-only retrieval cause?
- How often is an old learning more relevant than a recent one?
- How should stale or contradictory learnings be retired?
- What provenance is required?
- What makes a learning safe to apply automatically?

## 5. What is the right self-improvement boundary?

Possible boundaries:
- suggestions only
- generated documentation updates
- reviewed skill PRs
- automatically proposed evaluation changes
- model routing experiments

Which boundary preserves the intended human-control principle?

## 6. Where should semantic correctness live?

Do existing Work, Capability, Approval, and Evidence contracts express the important invariants?

Only introduce ontology-like machinery if real domain ambiguity remains after those contracts are used.

## 7. Where should agent authority end?

Mia already separates capability admission from the underlying tool runtime.

We should identify which future actions need:
- no approval
- capability admission
- explicit human approval
- stronger verification
- complete human ownership

## 8. What should be deleted as models improve?

For every future layer ask:
"What value does this code provide that the host/model cannot provide more simply?"

The desired direction is deletion of obsolete machinery, not indefinite accumulation.

## 9. Should factory-level metrics become first-class?

The corpus repeatedly highlights intervention, rework, reliability, and cost.

Mia currently has timeline and evidence events.

Question:
Should those events eventually support engineering metrics, or would that add machinery without enough value?

## 10. What must never change?

Potential architectural invariants to validate:
- local-first default
- direct in-process core path
- one owner per responsibility
- explicit human approval for consequential decisions
- runtime as executable truth
- evidence-bound completion
- no second competing orchestration engine
- no silent self-modification of production behavior

These should be treated as candidate invariants until explicitly confirmed.

## Current stopping point

The research phase has enough evidence to discuss direction.

Do not:
- write a master specification
- implement a new evaluation framework
- change memory retrieval
- add ontology infrastructure
- add a model router
- add a second agent runtime
- automatically rewrite skills

The next step is judgment and validation, not coding.
