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

The goal is simple: make the repository easy for an agent to understand, change, verify, and recover.

## 1. Give the agent a map

Keep `AGENTS.md` short. It routes the agent to the right source of truth.

Load context in this order:

`entry → project facts → local rules → task workflow → skill → source/tests → evidence`

Do not dump the repository into the prompt.

## 2. Put rules where they apply

Use one owner for each kind of information:

- project facts → `CONTEXT.md`
- architecture → `docs/core/`
- procedures → `docs/workflows/`
- reusable skills → skill manifests and references
- accepted decisions → `docs/decisions/`
- verification semantics → `docs/reference/`
- harness adapters → `.codex/`, `.claude/`, or generated surfaces

A local rule should be closer to the code it protects when that reduces irrelevant context.

## 3. Separate facts, rules, and memory

Facts describe the current system.

Rules tell agents what to do.

Memory records useful discoveries and corrections.

Do not use memory as current-state truth. When a repeated lesson matters, promote it to the correct owner: test, lint, rule, tool, or decision.

## 4. Prefer executable constraints

Markdown is guidance, not enforcement.

Use types, tests, linters, hooks, permissions, and sandbox boundaries for rules that must hold.

For example:

- architecture boundaries → structural tests or lint
- generated-file ownership → generator checks
- unsafe actions → executable permission controls
- required verification → repository checks
- documentation shape → documentation validation

Make failure messages tell the agent what invariant was violated and where the source of truth lives.

## 5. Use acceptance signals

Before changing a system, define how success will be observed.

Use:

`goal → baseline → bounded change → measure → keep or revert → record`

The signal can be a test, metric, snapshot, trace, log, build result, or observed behavior.

Do not keep speculative changes because they sound better.

## 6. TDD for deterministic behavior

For behavior changes:

`failing test → smallest change → focused green → wider verification → review`

Start with one test that demonstrates the missing behavior.

Do not add tests that merely mirror implementation details.

For agent behavior, test observable outcomes rather than wording or internal reasoning.

## 7. Keep change surfaces bounded

Before editing, identify:

- files that may change
- responsibilities affected
- verification needed
- files that should not change

Prefer a small coherent diff.

Split large work into independently verifiable stages when useful.

## 8. Delegate only when ownership is clear

Use one agent when one agent can own the task.

Use subagents when work is independent, has a clear output, or needs a different context, tool surface, or permission boundary.

Each delegated task should state:

- question or objective
- allowed scope
- expected output
- verification or evidence required

Agents working on the same mutable files must coordinate or use isolated worktrees.

## 9. Treat the workspace as a capability boundary

A coding agent is not just a language model. It is a process with tools, filesystem access, network access, memory, and permissions.

Choose the smallest capability set that can complete the task.

Use stronger permissions only when the task requires them.

Prefer isolated environments for parallel implementation and risky experimentation.

## 10. Make the repository self-explanatory

Important system behavior should be discoverable from the repository:

- source
- schemas
- commands
- architecture
- decisions
- tests
- operational evidence

External discussions may inform a decision, but accepted decisions should become repository-visible artifacts.

## 11. Review the system, not the diff

Review changed behavior in context.

Ask:

1. What changed?
2. What invariant is supposed to remain true?
3. What could break?
4. What evidence would prove it wrong?
5. Is the change still inside its intended boundary?

Do not approve because the diff looks plausible.

## 12. Continuous garbage collection

Agent-generated work increases repository entropy.

When a repeated bad pattern appears, fix the system that allows it:

`observe → classify → encode rule → enforce → clean existing violations`

Prefer small cleanup passes over large periodic rewrites.

## 13. Keep autonomy earned

Increase autonomy only when the repository has the evidence and controls to support it.

More autonomy requires better:

- verification
- isolation
- observability
- recovery
- permission boundaries

Do not confuse fewer approval prompts with a better engineering system.

## 14. Compatibility without duplication

MIA supports multiple agent harnesses.

Share the engineering contract through `AGENTS.md` where possible.

Keep harness-specific behavior in adapter/configuration layers.

Do not duplicate MIA's engineering rules across Claude, Codex, Gemini, and other harness files.

## 15. What not to build yet

Do not add a second orchestration engine, a large agent framework, a complex memory database, or dozens of mandatory Markdown files unless a concrete failure demonstrates the need.

MIA should become more capable by making the existing system more legible and enforceable.

## Engineering loop

For normal work:

`orient → bound → define acceptance → change → verify → review → record`

For repeated failure:

`reproduce → isolate → encode the lesson → fix → re-verify`

The objective is not maximum automation.

The objective is reliable progress with the smallest useful machinery.

## References

- [Claude Code memory and instruction loading](https://code.claude.com/docs/en/memory)
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
- [Chip Huyen AI Engineering companion](https://github.com/chiphuyen/aie-book)
