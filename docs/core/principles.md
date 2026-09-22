---
type: knowledge
scope: project
status: active
owner: architecture
canonical: true
audience: agent
load: on-demand
---

# MIA Engineering Principles

MIA prefers engineering choices that reduce accidental complexity and keep future change cheap.

## Simplicity

Use the smallest mechanism that solves the problem. Avoid speculative abstractions, duplicate owners, and framework-shaped machinery without a concrete need.

## Deep modules

Prefer small interfaces with useful behaviour behind them. Hide decisions that are likely to change and keep callers dependent on stable contracts rather than implementation details.

## Explicit ownership

One responsibility has one canonical owner. Callers consume the owner's operations and recorded facts. Adapters translate contracts rather than becoming competing sources of truth.

## Explicit contracts

Make important inputs, outputs, states, side effects, and failure modes visible. Prefer valid states represented by types and narrow interfaces.

## Verification over confidence

A review comment, plan, or model statement is not equivalent to executable evidence. Verify behaviour at the boundary that matters and state the scope of what the evidence proves.

## Progressive context

Treat agent context as a constrained engineering resource. Keep entry points small, project vocabulary stable, and deeper guidance on demand.

## Reversible evolution

Prefer small, reviewable changes. Record significant one-way architecture decisions in ADRs. Preserve unrelated working state and keep recovery possible.

## Human control

Consequential product, architecture, permission, migration, and release decisions remain explicit. Automation should make those decisions easier to inspect, not silently make them disappear.

## Reliability

Assume dependencies and workflows can fail. Make failure states explicit, keep side effects bounded, and design verification and recovery paths before relying on automation.

## Learning

Turn repeated failures and useful discoveries into durable improvements such as tests, checks, tooling, focused documentation, or accepted decisions. Do not preserve raw incident history as permanent policy.

## Related references

- [Agent Engineering](agent-engineering.md)
- [Evidence and Verification](../reference/evidence.md)
- [MIA Project Context](../../CONTEXT.md)
- [Architecture](architecture.md)
