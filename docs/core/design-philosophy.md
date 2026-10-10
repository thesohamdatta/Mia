---
title: "MIA design philosophy"
layer: 1
last_updated: "2026-10-10"
owner: architecture
---

# MIA design philosophy

MIA is shaped by three design principles: simple, deep, and evolvable. They describe how we want the system to feel to a user and how we want it to change over time.

## Simple

Choose the smallest mechanism that solves the problem. Avoid speculative abstractions, duplicate sources of truth, and machinery without a demonstrated need.

Simplicity is not the same as removing useful safeguards. A small interface can still enforce validation, record evidence, and make side effects explicit.

## Deep

Keep the public interface small while the implementation handles complexity behind it. Callers should depend on stable contracts instead of learning the details of every subsystem.

In MIA, this means named skills, explicit boundaries, and a shared persistence interface instead of one large command handler that knows about everything.

## Evolvable

Expect requirements and implementations to change. Prefer boundaries that let one part change without forcing unrelated parts to change with it.

Record important architectural decisions, keep patches reviewable, and preserve a way to verify or recover from consequential changes.

## What this means in practice

- **Make ownership explicit.** Each important piece of state or behaviour should have a clear owner.
- **Keep claims close to evidence.** Tests and source code should support important statements.
- **Use context deliberately.** Load the information needed for the current task rather than copying the entire repository into every interaction.
- **Keep humans in control.** Make consequential permissions, architectural choices, and handoffs visible.
- **Learn from repeated failures.** Turn recurring problems into tests, focused documentation, or tooling.

These principles guide trade-offs; they are not a substitute for inspecting the actual implementation.
