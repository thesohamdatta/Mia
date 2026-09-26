---
type: reference
scope: project
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
---

# Agent Engineering

MIA engineers the environment around AI agents without making the environment complicated.

## Rules

- **Small first:** use the smallest instruction, file, tool, and abstraction that solves the task.
- **Explicit contracts:** make inputs, outputs, side effects, and verification visible.
- **Progressive disclosure:** keep entry context small and load depth only when needed.
- **One owner:** one responsibility has one canonical source of truth.
- **Evidence-bound completion:** completion claims point to checks or observations.
- **Scoped instructions:** project rules live in project context; workflow rules live in workflows; skill rules live with skills.
- **Learn from failure:** recurring failures become tests, checks, tooling, or focused guidance.
- **No parallel process:** reuse MIA's existing workflow instead of creating a second one.

## TDD for agent-facing changes

When changing behaviour, treat the test as the contract before treating Markdown as the contract.

Use:

`failing test → smallest change → focused green → wider verification`

For Markdown-only changes, add a deterministic test when the rule can be expressed as a stable repository invariant. Keep the invariant small enough that future documentation changes do not require rewriting the validator.

## Markdown shape

A canonical agent-facing document should answer only the questions its scope owns:

- What is this?
- When should an agent read it?
- What source or workflow owns the behaviour?
- What must the agent do?
- What should stop the agent?
- Where is deeper evidence?

Do not repeat the same rule in multiple files. Link to the owner.

## Context boundaries

Use root context for project vocabulary and stable facts. Use agent engineering guidance for how agents work. Use workflow documents for procedures. Use skill documents for skill-specific execution.

## Invocation

MIA may distinguish `user`, `model`, and `both` invocation modes. Until the runtime enforces those states, documentation must not imply that model-triggering or permission semantics are executable guarantees.

## External influences

MIA incorporates transferable ideas from modern agent engineering systems, including composable skills, domain context, scoped instructions, persistent learning, workflow generation, verification gates, and evidence binding. These are design influences, not compatibility claims.
