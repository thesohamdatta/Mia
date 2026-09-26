---
type: reference
scope: project
status: active
owner: engineering
canonical: true
audience: agent
load: on-demand
---

# Agent Engineering v2

MIA is an engineering system for agents, not a prompt collection.

## Core loop

`orient → bound → define acceptance → change → verify → review → record`

For repeated failure:

`reproduce → isolate → encode the lesson → fix → re-verify`

## Context

Use the narrowest useful context:

`entry → facts → local rules → workflow/skill → source/tests → evidence`

Keep `AGENTS.md` small. Put detailed procedures in skills or focused references.

Use one owner:

- facts → `CONTEXT.md`
- architecture → `docs/core/`
- procedures → `docs/workflows/`
- reusable procedures → skills
- decisions → `docs/decisions/`
- verification → `docs/reference/`
- harness adapters → `.codex/`, `.claude/`, generated surfaces

Never duplicate an active rule across owners.

## Executable constraints

Markdown guides behavior. Code and tooling enforce it.

Use the strongest cheap boundary that fits:

`types → tests → lint/structural checks → hooks/permissions → sandbox`

Make failures actionable: name the violated invariant and point to its owner.

## Acceptance signal

Every non-trivial change needs an observable success signal:

`goal → baseline → bounded change → measure → keep or revert`

Use a test, metric, snapshot, trace, log, build result, or runtime observation.

Do not keep a change because it merely sounds better.

## TDD

For deterministic behavior:

`failing test → smallest change → focused green → wider verification`

Test behavior, not implementation details.

For agent behavior, test observable outcomes. Do not test wording or private reasoning.

## Boundaries

Before editing, know:

- what may change
- what must not change
- what verification is required

Prefer small coherent diffs. Split large work into independently verifiable stages.

## Delegation

Use one agent unless another context or owner is actually useful.

Use subagents for independent work, clear outputs, or distinct tool/permission boundaries.

Give each delegated task an objective, scope, expected result, and evidence requirement.

Agents editing the same files must coordinate or use isolated worktrees.

## Memory

Keep rules, facts, and learnings separate.

Promote repeated learnings into tests, tooling, rules, or decisions.

Memory is not proof of current repository state.

## Hooks and permissions

Use executable controls for things prose cannot reliably enforce:

- unsafe or out-of-scope actions
- generated-file ownership
- focused validation
- lifecycle recording
- consequential side effects

Do not turn every guideline into a hook.

## Autonomy

More autonomy requires stronger verification, isolation, observability, recovery, and permission boundaries.

Reduce approvals only when the repository has enough evidence to make that safe.

## Repository legibility

Important behavior should be discoverable in-repo:

`source + schemas + commands + decisions + tests + evidence`

External discussion can inform a decision. Accepted decisions should become repository-visible artifacts.

## Garbage collection

Agent-generated changes create entropy.

Use:

`observe → classify → encode → enforce → clean`

Prefer continuous small cleanup over periodic rewrites.

## Review

Review behavior and boundaries before style.

Ask:

`What evidence would prove this change is wrong?`

A green check proves only the scope of that check.

## Do not build yet

Do not add another orchestration engine, complex memory layer, or large prompt framework without a concrete failure showing the need.

## References

- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code security](https://code.claude.com/docs/en/security)
- [Codex AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md)
- [Codex skills](https://developers.openai.com/api/docs/guides/tools-skills)
- [Codex subagents](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
- [Codex sandbox agents](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/)
- [Karpathy autoresearch](https://github.com/karpathy/autoresearch)
- [Chip Huyen AI Engineering](https://github.com/chiphuyen/aie-book)
