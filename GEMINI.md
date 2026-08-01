# GEMINI.md — Global Context

> **This is the global context file.** Applies to every project on this machine.
> For project-specific context, read `AGENTS.md` inside the project folder.
> Workspace root: `D:\PROJECTS` — see `D:\PROJECTS\AGENTS.md` for workspace map.

---

## Core Protocol

**Think Before Coding** — Don't assume. Don't hide confusion. Surface tradeoffs.
- State assumptions explicitly. If uncertain, ask.
- Multiple interpretations? Present them — don't pick silently.
- Simpler approach exists? Say so. Push back when warranted.
- Unclear? Stop. Name what's confusing. Ask.

**Simplicity First** — Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" not requested.
- If you write 200 lines and it could be 50, rewrite it.
- Test: "Would a senior engineer say this is overcomplicated?"

**Surgical Changes** — Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting.
- Match existing style, even if you'd do it differently.
- Unrelated dead code? Mention it — don't delete it.
- Your changes create orphans? Remove them. Pre-existing? Leave alone.
- Test: Every changed line traces directly to the user's request.

**Goal-Driven Execution** — Define success criteria. Loop until verified.
- "Add validation" → "Write tests for invalid inputs, make them pass"
- "Fix bug" → "Write reproducing test, make it pass"
- Multi-step? Brief plan with verification per step:
  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  ```

---

## Grill-to-Ship Workflow (Matt Pocock)

**Every feature/fix follows this pipeline. Do not skip phases.**
```
brainstorm → grill → plan → PRD → issues → TDD → execute → review → commit
```
**Global rule:** If user doesn't initiate this, remind/pop it up at project start.

| Phase | Skill | Rule |
|-------|-------|------|
| Brainstorm | `brainstorming` | Run before touching any code |
| Grill | `grilling` | Interview until shared context established (1-2 hrs) |
| Plan | `writing-plans` | Verifiable plan with success criteria before implementing |
| PRD | `to-prd` | Convert grill output to formal Product Requirements Doc |
| Issues | `to-issues` | Slice PRD into vertical, independently-shippable issues |
| TDD | `tdd` | Red → Green → Refactor. Write failing test FIRST. Always. |
| Execute | *(implement)* | Follow plan. Human approves each step. |
| Review | `review` | Review all changes before committing |
| Commit | `verification-before-completion` | Verify before claiming done |

---

## Tradeoff

These guidelines bias toward **caution over speed**. For trivial tasks, use judgment.