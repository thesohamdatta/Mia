# AGENTS.md — Workspace Conventions

> This folder is home. Treat it that way.

---

## Canonical context

`AGENTS.md` is the canonical workspace entry point for MIA. `CLAUDE.md` and `GEMINI.md` are aliases that point here.

The deeper architecture, workflows, principles, references, and historical decisions live under `docs/`.

Use the runtime-provided startup context first. Read deeper files only when the task needs them or the user explicitly asks.

---

## Session startup

Start with:

1. `AGENTS.md`
2. `PRINCIPLES.md`
3. the relevant `docs/` file
4. recent project memory when it is available

Do not reread the entire documentation tree by default. Context is a resource too.

---

## Memory

MIA keeps long-lived local context under `~/.mia/`.

- Project events: `~/.mia/projects/<slug>/events.jsonl`
- Long-term memory: `~/.mia/memory.md`
- Sessions: `~/.mia/sessions/`

Use the current `UnifiedStore` for project learnings, timeline events, and checkpoints.

**Write it down:**
- mental notes do not survive restarts; files do
- read before writing
- record useful decisions, failures, and reusable patterns
- do not duplicate the same truth across documents without a reason

---

## Architecture

The current runtime is a **direct CLI execution model**.

```text
CLI
 ↓
ExecutionContext
 ↓
Middleware
 ↓
Skill Executor
 ↓
UnifiedStore / local files / optional host integrations
```

There is **no current MIA daemon or HTTP control plane** in the normal execution path.

The accepted architectural decision is recorded in [`docs/decisions/ADR-0001-eliminate-daemon.md`](docs/decisions/ADR-0001-eliminate-daemon.md).

---

## Core rules

### 1. Clarify before coding

For non-trivial work, start with the grill.

Ask:
- What problem are we solving?
- What assumptions are we making?
- What could go wrong?
- What does done mean?
- What is explicitly out of scope?

### 2. Human approval stays explicit

Present meaningful choices before consequential execution. Do not silently invent product or architecture decisions.

### 3. Prefer the smallest useful change

Use existing patterns and maintained libraries before introducing new machinery.

Prefer:
- small diffs
- deep modules
- explicit contracts
- deterministic verification
- reversible decisions

### 4. Verification beats confidence

Before claiming work is complete, verify the relevant layers:

```text
typecheck → lint → tests → build → targeted behaviour checks
```

Use the narrowest set that proves the claim, but do not replace evidence with intuition.

### 5. Preserve local state

Do not overwrite or delete local memory, configuration, credentials, or unrelated project state just because a task is easier that way.

Prefer recoverable changes.

---

## Multi-agent coordination

MIA uses a serialized repository coordination protocol for Jules agents.

Canonical coordination source:

```text
.agents/PROTOCOL.md
```

The normal stage order is:

```text
Sentry → Pulse → Maintainer → Orchestrator
```

Rules for coordinated work:

- The repository default branch is the integration branch. Current integration branch: `master`.
- Every coordinated PR must target the current integration branch.
- Agents share one cycle state and one handoff lineage. Do not create duplicate state for the same cycle.
- One repository-changing writer is active at a time.
- A stale, duplicated, missing, malformed, or conflicting handoff means `HOLD`.
- No agent may approve, merge, or release its own work.
- Preserve newer benchmark, product, and repository changes when reconciling stale PRs.
- Handoffs are evidence records, not merge authority.
- The Orchestrator prepares the final repository state. Human review remains the final integration gate.

When branch state and documentation disagree, inspect the current executable source, tests, accepted ADRs, and Git history before changing either.

---

## Existing-solutions preflight

Before building something custom, check for a maintained library, existing MIA skill, compatible host adapter, or other established solution.

Build custom only when the existing option is unsuitable, unsafe, unavailable, too expensive, or the task explicitly requires it.

---

## Change boundaries

When changing:

**Code**
- keep module boundaries intact
- avoid unrelated refactors
- update tests for behavioural changes

**Architecture**
- update or add an ADR
- update the architecture reference
- keep README statements consistent with the accepted design

**Skills**
- update the executable skill and its documentation source
- keep `docs/skills/` consistent with the current skill surface
- keep deep material out of the concise entry point

**Documentation**
- update the narrowest relevant document
- remove dead paths and stale claims
- verify internal links

---

## Git and commits

Use Conventional Commits:

```text
feat(scope): add something
fix(scope): correct something
docs(scope): update documentation
refactor(scope): restructure without changing behaviour
test(scope): add or repair tests
chore(scope): maintenance
```

Use `mia vc` for the project-aware git helpers when appropriate.

Do not rewrite shared history or force-update branches without explicit instruction.

---

## Repository validation

Use the narrowest read-only checks that prove the claim:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

`bun run gen:skill-docs` regenerates generated skill docs and may write files. Run it intentionally when checking or updating generated documentation.

`bun run validate` is a composite maintenance command that includes the write-enabled `lint` script. Treat it as a formatting/repair command, not a pure verification gate.

If a command is not present in `package.json`, do not document it as a supported command.

---

## Documentation map

| Area | Canonical location |
| :--- | :--- |
| Architecture | `docs/core/architecture.md` |
| Context engineering | `docs/core/context.md` |
| Engineering principles | `docs/core/principles.md` |
| Design philosophy | `docs/core/design-philosophy.md` |
| Skills | `docs/core/skills-index.md` + `docs/skills/` |
| Development workflow | `docs/workflows/grill-to-ship.md` |
| Onboarding | `docs/workflows/onboarding.md` |
| Testing | `docs/reference/testing-strategy.md` |
| Code review | `docs/reference/review-standards.md` |
| Voice/style | `docs/reference/voice-guide.md` |
| Decisions | `docs/decisions/` |
| Historical material | `docs/archive/` |

---

## Proactive maintenance

Do not pretend MIA has a magical always-on background brain. The current project is a CLI and local state system.

When working proactively:
- check project git state
- update documentation when implementation makes it stale
- fold reusable learnings into the right file
- avoid destructive cleanup without a clear reason

---

## Failure recovery

If a change fails:

1. reproduce the failure
2. isolate the root cause
3. make the smallest corrective change
4. re-run the relevant verification
5. document the lesson when it is reusable

After repeated failures, stop broad editing and reassess the design instead of stacking patches on patches.

---

## Agent entry points

The repository supports several agent entry points:

- `AGENTS.md` is canonical.
- `CLAUDE.md` aliases `AGENTS.md`.
- `GEMINI.md` aliases `AGENTS.md`.

Do not create a second competing source of truth.

---

*Simple rules. Explicit state. Evidence before claims.*