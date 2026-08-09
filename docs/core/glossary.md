# Glossary

Shared vocabulary for the EKB system. Ensures consistent terminology across humans and agents.

## A

**ADR** — Architecture Decision Record. Documents a significant architectural decision with context, alternatives, and consequences.

**Agent** — An AI system with a defined role, capabilities, and activation triggers that can execute tasks autonomously within guardrails.

**Anti-pattern** — A common response to a recurring problem that is usually ineffective and risks being highly counterproductive.

## B

**Bounded Context** — A DDD concept defining explicit boundaries within which a domain model applies. Changes inside don't leak outside without explicit translation.

**Bulkhead** — Isolation pattern that partitions system resources to contain failures (like ship bulkheads).

## C

**Canary** — Gradual rollout to a small subset of users/traffic to detect issues before full deployment.

**Circuit Breaker** — Pattern that fails fast when a dependency is unhealthy, preventing cascade failures.

**CLAUDE.md** — The constitutional layer of the EKB. Contains mission, beliefs, decision hierarchy, and non-goals. Intentionally small.

**Codex** — OpenAI's CLI coding agent. One of the harnesses the EKB supports.

**Context Engineering** — The discipline of managing context as a limited engineering resource. Includes token budgets, progressive disclosure, and context hygiene.

**Context Window** — The maximum token capacity available to an LLM in a single interaction.

## D

**DDD** — Domain-Driven Design. An approach to software development focusing on the core domain and domain logic.

**Dependency Rule** — Clean Architecture principle: source code dependencies must point inward toward higher-level policies.

**Deterministic Verification** — Testing, typing, contracts — verification that produces the same result every time, unlike human review.

**Diff-based Test Selection** — Running only tests affected by recent code changes (via git diff analysis).

## E

**EDD** — Evaluation-Driven Development. Defining success criteria and evaluation methods before building.

**Elo Rating** — A method for calculating relative skill levels, used in plugin-eval for quality ranking.

**E2E** — End-to-End. Tests that exercise the full system from user perspective.

## F

**Feature Flag** — Runtime toggle to enable/disable functionality without deploying new code.

## G

**Gate** — A quality checkpoint that must pass before advancing (e.g., lint gate, test gate, eval gate).

**God Skill/Class/Module** — An anti-pattern where a single component has too many responsibilities.

## H

**Harness** — The scaffolding around a model (prompts, tools, sandboxes, guardrails, observability) that enables reliable agent behavior.

**Hallucination** — AI generating plausible but factually incorrect output.

**Hook** — Deterministic script that runs at lifecycle events (PreToolUse, PostToolUse, Stop) to enforce standards.

## I

**Idempotency** — Property where repeating an operation produces the same result as doing it once. Safe for retries.

**Intent Gate** — Phase 0 of the workflow: classify request, check ambiguity, validate assumptions before acting.

**Integration Test** — Tests with real dependencies (DB, external APIs, message queues) verifying contracts.

## K

**Knowledge Portfolio** — The Pragmatic Programmer concept: treat your knowledge like a financial portfolio (invest regularly, diversify, manage risk, review/rebalance).

## L

**Layer 1 (Timeless)** — Engineering principles that change over decades (PRINCIPLES.md).

**Layer 2 (AI Engineering)** — Patterns that change over years (AI.md, CONTEXT.md).

**Layer 3 (Tooling)** — Patterns that change over months (SKILL.md, WORKFLOW.md).

**Layer 4 (Project)** — Knowledge that changes continuously (memory/, project/).

**LLM** — Large Language Model.

**Lint** — Static analysis for code style, errors, and anti-patterns.

## M

**MCP** — Model Context Protocol. Standard for connecting agents to external data/tools.

**Monte Carlo** — Statistical simulation method (Layer 3 evaluation) running many iterations for confidence intervals.

**Model Tiering** — Assigning tasks to appropriate model tiers (Opus/Fable → Sonnet → Haiku) for cost/quality optimization.

## N

**Non-goal** — Explicitly documented things the system does NOT do. Prevents scope creep.

## O

**Observability** — Ability to understand system internals from external outputs (logs, metrics, traces). Not monitoring.

**One-Way Door** — Irreversible or extremely costly to reverse decision (data models, public APIs, security model).

**Orthogonality** — Independence: changes in one component don't affect others. From The Pragmatic Programmer.

## P

**Pragmatic Programmer** — Classic software engineering book by Hunt & Thomas. Source of many timeless principles.

**Progressive Disclosure** — Loading detail on demand: Tier 1 (always) → Tier 2 (on activation) → Tier 3 (on demand).

**Property-Based Testing** — Testing by defining invariants that must hold across randomly generated inputs.

## Q

**Quality Budget** — Explicit allocation of resources to quality activities (testing, review, documentation).

## R

**RAG** — Retrieval-Augmented Generation. Combining LLM with external knowledge retrieval.

**Refactoring** — Improving internal structure without changing observable behavior.

**Release It!** — Book by Michael Nygard on production-ready software patterns.

**Rollback** — Reverting a deployment to a previous known-good state.

## S

**Saga Pattern** — Distributed transaction using compensating transactions instead of two-phase commit.

**SLA** — Service Level Agreement. Contractual reliability commitment to customers.

**SLO** — Service Level Objective. Internal reliability target (stricter than SLA).

**SLI** — Service Level Indicator. Measurable metric (latency, error rate, availability).

**Slop** — Low-quality, generic, boilerplate AI output.

**Static Analysis** — Automated code analysis without execution (lint, typecheck, security scan).

**Strategic Programming** — Investing in good design that pays compound interest (vs. tactical).

## T

**Test Trophy** — Modern test distribution: 70% unit, 20% integration, 10% E2E (Kent C. Dodds).

**Token Budget** — Explicit allocation of context window tokens across system prompt, skills, code, history, working memory.

**Two-Way Door** — Reversible decision with moderate effort (library choice, config, feature flags).

## U

**Unit Test** — Tests of pure logic in isolation, fast and deterministic.

## V

**Verification** — Deterministic confirmation that system meets specifications (tests, types, contracts).

## W

**WISDOM** — Audience analysis acronym: What, Interest, Sophistication, Detail, Ownership, Motivation.

**Workflow** — Defined process with steps, gates, and handoffs (WORKFLOW.md).

## Y

**YAGNI** — You Aren't Gonna Need It. Don't build functionality until you actually need it.