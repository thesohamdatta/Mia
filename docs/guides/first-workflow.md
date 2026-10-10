---
title: "A first MIA workflow"
layer: 2
last_updated: "2026-10-10"
owner: documentation
---

# A first MIA workflow

MIA is designed to make the path from an unclear request to a verifiable handoff more deliberate. Use only the phases that fit the work; a one-line typo does not need a full planning ceremony.

## 1. Clarify the intent

For non-trivial work, start with:

```bash
bun run core/cli/index.ts grill start
```

Make the problem, assumptions, risks, scope, and definition of done explicit. The goal is to reduce avoidable rework before implementation begins.

## 2. Create a plan

Give MIA a concrete objective:

```bash
bun run core/cli/index.ts plan create "Describe the outcome you need"
```

The plan skill stores a Work record and writes a `PLAN.md` under MIA's project state. Review its objective and success criteria. Correct the plan when the actual task requires a different scope or stronger evidence.

## 3. Execute with the appropriate tools

Do the implementation in your chosen development environment or agent host. MIA does not replace the host's model loop or tool runtime. Its registered skills provide explicit workflow boundaries around that work.

Keep the change focused. Use the source tree and tests to resolve questions about current behaviour rather than treating an old document as an implementation contract.

## 4. Review and verify

Use the registered review and health skills when appropriate:

```bash
bun run core/cli/index.ts review
bun run core/cli/index.ts health
```

The health skill runs the checks configured for the repository and records verification evidence. A passing check proves only what that check covers; it is not a blanket guarantee of correctness.

## 5. Check handoff readiness

```bash
bun run core/cli/index.ts ship
```

The ship skill evaluates repository verification and reports whether the handoff is unblocked. It does **not** push commits, merge a pull request, or create one.

## 6. Keep what you learned

Use `learn`, `retro`, `memory`, or `checkpoint` when you need to preserve a useful observation or working state. See [Skills and commands](../core/skills-index.md) for the current command list.

## The important distinction

MIA can preserve plans, work state, verification records, approvals, and learnings. It cannot make an unverified result correct by describing it confidently. Report what was checked and what remains uncertain.
