---
type: reference
scope: project
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
---

# Markdown Engineering

MIA uses Markdown as a small knowledge system for agents and people.

## Layers

Use the narrowest layer that owns the rule:

1. `AGENTS.md` routes agents.
2. `CONTEXT.md` defines project vocabulary and stable facts.
3. `docs/core/` explains architecture and engineering rules.
4. `docs/workflows/` defines procedures.
5. `docs/reference/` holds verification and review details.
6. `docs/decisions/` records accepted architectural decisions.
7. `docs/archive/` keeps historical material.

Prefer:

`entry → context → relevant workflow/reference → source/tests → evidence`

Do not load the whole tree by default.

## One owner

Every important rule should have one canonical owner.

If a rule already exists, link to it. Do not copy a second version into another Markdown file.

Runtime code owns executable behaviour. Markdown explains the behaviour and points to evidence.

## Agent-facing Markdown

Keep instructions:

- scoped to one responsibility
- short enough to scan
- explicit about when they apply
- explicit about what to do and when to stop
- linked to deeper material instead of repeating it

Use imperative language for actions. Put stable facts in context files, not workflow instructions.

## Project Markdown

A useful project document should make these clear:

- what this is
- what it owns
- what it does not own
- what changed or was decided
- how to verify it
- where the source of truth lives

Prefer small documents with strong links over one large handbook.

## TDD for documentation

When a documentation rule is important and deterministic:

`write failing test → smallest change → focused green → wider verification`

Test repository invariants, not writing preferences. Examples include:

- canonical files exist
- required links are discoverable
- layer boundaries stay separate
- workflow steps remain present
- generated files are not treated as sources

For prose-only improvements that cannot be expressed as a stable invariant, review them normally.

## AI engineering connection

AI systems need explicit inputs, constraints, evaluation, feedback, and failure handling. Apply the same discipline to the agent-facing knowledge layer.

For MIA, that means:

`context → instruction → action → verification → evidence`

When an agent failure repeats, first check whether the missing constraint belongs in a canonical document or executable test. Fix the owner, not every downstream copy.

## References

- [AI Engineering companion materials](https://github.com/chiphuyen/aie-book)
- [GitHub Copilot custom instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions)
- [Gemini CLI context files](https://geminicli.com/docs/cli/gemini-md/)
- [Write the Docs software documentation guide](https://www.writethedocs.org/guide/)
- [Architecture Decision Records](https://adr.github.io/)
