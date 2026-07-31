# Workflow

Development process and verification gates for the EKB.

## Core Workflows

### A. Grill-to-Ship (Feature/Fix Development)

**Golden Rule: Never jump to code without a grill session for anything non-trivial.**

**Human-in-the-loop always: present choices, wait for approval before executing.**

**One issue at a time: never multi-task in one session — context degrades fast.**

**Keep sessions focused: LLM performance degrades past ~100k tokens; small tasks win.**

**Deep modules: design code with simple, stable interfaces that hide complexity.**

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

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

### B. Intent → Verify (All Other Requests)

**Phase 0 — Intent Gate (EVERY request):**
1. Classify: Trivial | Explicit | Exploratory | Open-ended | GitHub Work | Ambiguous
2. Check ambiguity: Single → proceed | Multiple → ask | Flawed design → raise concern
3. Validate assumptions before acting

**Phase 1 — Assessment:** Check configs, sample files, classify codebase state (Disciplined/Transitional/Legacy/Greenfield)

**Phase 2 — Execute:** Explore (parallel) → Implement (evidence-based) → Verify (lint → unit → integration → eval → canary)

**Phase 3 — Complete:** All todos done, diagnostics clean, build passes, request fully addressed

---

## Tool Selection

| Tool | Cost | When to Use |
|------|------|-------------|
| `grep`, `glob`, `lsp_*`, `ast_grep` | FREE | Not Complex, Scope Clear, No Implicit Assumptions |
| `explore` agent | FREE | Multiple search angles, unfamiliar modules, cross-layer patterns |
| `librarian` agent | CHEAP | External docs, GitHub examples, OSS reference |
| `oracle` agent | EXPENSIVE | Architecture, review, debugging after 2+ failures |

**Default:** explore/librarian (background) + tools → oracle (if required)

---

## Parallel Execution (DEFAULT)

- Fire explore/librarian agents in parallel
- Continue immediate work
- Collect results: `background_output(task_id="...")`
- Before final answer: `background_cancel(all=true)`

---

## Delegation Prompt Structure (MANDATORY - ALL 7 sections)

```
1. TASK: Atomic, specific goal (one action per delegation)
2. EXPECTED OUTCOME: Concrete deliverables with success criteria
3. REQUIRED SKILLS: Which skill to invoke
4. REQUIRED TOOLS: Explicit tool whitelist
5. MUST DO: Exhaustive requirements - leave NOTHING implicit
6. MUST NOT DO: Forbidden actions - anticipate and block rogue behavior
7. CONTEXT: File paths, existing patterns, constraints
```

---

## Evidence Requirements (task NOT complete without these)

| Action | Required Evidence |
|--------|-------------------|
| File edit | `lsp_diagnostics` clean on changed files |
| Build command | Exit code 0 |
| Test run | Pass (or explicit note of pre-existing failures) |
| Delegation | Agent result received and verified |

---

## Failure Recovery

1. Fix root causes, not symptoms
2. Re-verify after EVERY fix attempt
3. Never shotgun debug

**After 3 Consecutive Failures:**
1. **STOP** all further edits
2. **REVERT** to last known working state
3. **DOCUMENT** what was attempted and what failed
4. **CONSULT** Oracle with full failure context
5. If Oracle cannot resolve → **ASK USER** before proceeding

---

## Testing Workflow

```bash
# Before every commit
bun test             # free, <2s

# Before shipping  
bun run test:evals   # paid, diff-based (~$4/run max)
```

**Two-Tier Test System:**

| Tier | Tests | When | CI |
|------|-------|------|-----|
| Gate | Safety guards, deterministic functional | Every commit | Required |
| Periodic | Quality benchmarks, Opus models, non-deterministic, external services | Weekly cron / manual | Optional |

---

## Skill Validation

```bash
bun run skill:check           # health dashboard for all skills
bun run gen:skill-docs        # regenerate SKILL.md from templates
bun run dev:skill             # watch mode: auto-regen + validate on change
```

---

## Commands Quick Reference

```bash
# Development
bun run dev <cmd>       # run CLI in dev mode
bun run build           # gen docs + compile binaries
bun run gen:skill-docs  # regenerate SKILL.md files from templates
bun run skill:check     # health dashboard for all skills
bun run dev:skill       # watch mode: auto-regen + validate on change

# Evaluation
bun run eval:list       # list all eval runs
bun run eval:compare    # compare two eval runs
bun run eval:summary    # aggregate stats across all eval runs
bun run eval:select     # show which tests would run based on current diff

# Quality
bun run slop            # full slop-scan report (all files)
bun run slop:diff       # slop findings in files changed on this branch only
```

---

## Tradeoff

These guidelines bias toward **caution over speed**. For trivial tasks, use judgment.