---
type: knowledge
scope: project
status: active
owner: context-engineering
canonical: true
audience: agent
load: on-demand
---

# Context Engineering

Context is a limited engineering resource. MIA treats context assembly as system design, not as an invitation to dump the repository into every prompt.

## Loading order

```text
entry rules
 ↓
project vocabulary
 ↓
relevant workflow/reference
 ↓
relevant skill
 ↓
source and tests
 ↓
evidence
```

Load only the layer needed for the task. More context is not automatically better context.

## Progressive disclosure

Keep always-loaded guidance small. Put detailed procedures, examples, and historical material behind focused references.

Prefer a concise entry point plus links over repeating the same rule in several documents.

## Context hygiene

- Remove stale assumptions before adding new ones.
- Treat historical/generated documents as non-authoritative unless verified against source.
- Keep project vocabulary stable and concise.
- Keep session-specific details out of durable project context unless they represent a reusable learning.
- Use handoffs to preserve objective, constraints, changed files, verification, and remaining uncertainty.

## Evidence boundary

Context can tell an agent where to look. It cannot prove executable behaviour. Verification must come from source, tests, commands, CI, or an observed runtime result.

## Related

- [CONTEXT.md](../../CONTEXT.md) is MIA's project vocabulary.
- [docs/reference/evidence.md](../reference/evidence.md) defines claim and evidence language.
