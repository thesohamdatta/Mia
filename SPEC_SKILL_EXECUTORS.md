# SPEC: Real Skill Executors for MIA Core Skills (grill, health, plan)

## Problem Statement

MIA v0.2.1 has a production-grade constitutional foundation but **zero executable skill logic**. All 13 skill executors are stubs returning static text. The grill-to-ship pipeline exists only as documentation. Users cannot actually use MIA for real engineering work.

## User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As an engineer, I want `mia grill` to actually ask me clarifying questions and capture my answers, so I follow the golden rule before coding | P0 |
| US-02 | As an engineer, I want `mia health` to run real quality checks (tsc, biome, knip, tests) and give me a 0-10 score, so I know if my code is ship-ready | P0 |
| US-03 | As an engineer, I want `mia plan` to create a verifiable plan with success criteria and save it, so I have a contract before implementing | P0 |
| US-04 | As an engineer, I want `bun test` to pass with real unit/integration tests, so I have confidence in changes | P0 |
| US-05 | As a researcher, I want new book principles integrated into MIA's knowledge base, so MIA learns from human expertise | P1 |

## Acceptance Criteria

| AC | Description | Verification |
|----|-------------|--------------|
| AC-01 | `tests/` directory exists with Vitest config | `bun test` runs |
| AC-02 | `grill` executor uses `AskUserQuestion` interactively, logs to timeline | Manual test + timeline entry |
| AC-03 | `health` executor runs `tsc --noEmit`, `biome check`, `knip`, `bun test`, computes 0-10 score | Real score output |
| AC-04 | `plan` executor creates verifiable plan with success criteria, saves to timeline | Plan file + timeline |
| AC-05 | `bun test` passes (all green) | Exit code 0 |
| AC-06 | `mia constitution-check audit` passes after each skill | No drift |
| AC-07 | EKB at `/c/Users/Soham/Downloads/AI/ekb/` remains untouched | `git status` clean |
| AC-08 | 5 new book principles integrated into `PRINCIPLES.md` + learning layer | 5 entries with `source: "book:<title>"` |
| AC-09 | All changes via grill→plan→spec→review→ship pipeline | Timeline shows full pipeline |

## Technical Approach

### Architecture
- **Skill executor interface**: `execute(args: string[], token: string) → Promise<{ok, output?, error?}>`
- **Tool integration**: Direct imports of `tsc`, `biome`, `knip`, `vitest` via `child_process` or Bun APIs
- **Interactive prompts**: `AskUserQuestion` via stdin/stdout in compiled Bun binary (test first)
- **Timeline integration**: Auto-logged by daemon on skill start/complete
- **Constitutional alignment**: Every skill declares `constitutionalAlignment` in manifest

### Skill Implementations

#### 1. `grill` — Interactive Clarification
```typescript
// skills/core/grill/execute.ts
- Parse args for context (optional problem description)
- Present 4 golden questions (problem, assumptions, risks, done criteria)
- Use AskUserQuestion for each (interactive stdin/stdout)
- Capture answers, structure as grill result
- Return formatted output + auto-log to timeline
```

#### 2. `health` — Quality Scorekeeper
```typescript
// skills/core/health/execute.ts
- Run checks in parallel where possible:
  * tsc --noEmit (TypeScript)
  * biome check (lint/format)
  * knip (dead code)
  * bun test (tests + coverage)
  * npm audit (security)
- Score each: 0-2 points, composite 0-10
- Track trend in health-history.jsonl
- Block if <7, warn if 5-6
```

#### 3. `plan` — Verifiable Planning
```typescript
// skills/core/plan/execute.ts
- Accept goal + optional context
- Guide through: success criteria, steps, dependencies, risks, effort estimates
- Output structured plan (Markdown + JSON)
- Save to ~/.mia/projects/{slug}/plans/{timestamp}.md
- Auto-log to timeline
```

### Test Strategy (TDD)

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest | ≥90% pure logic |
| Integration | Vitest + real CLI/daemon | CLI→daemon contract |
| E2E | Manual (for interactive) | Happy path + 2 edge cases |

### Integration Points
- **Daemon**: Auto-logs timeline on skill start/complete
- **Learning layer**: Skills can append learnings via `/learn` API
- **Constitution-check**: Validates alignment after each skill
- **Daily rituals**: `evening` captures drift, `morning` shows alignment

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bun compiled binary + interactive stdin fails | High | Critical | Test immediately; fallback to file-based protocol |
| Skill executors couple to daemon internals | Medium | High | Strict interface; no internal imports |
| Tests brittle/flaky | Medium | High | Unit test pure logic; integration only for CLI↔daemon |
| Daemon crash loses session | Low | Medium | PM2 + checkpoint auto-save + state.json |
| Constitutional drift during implementation | Medium | Medium | constitution-check after each skill |

## Implementation Sequence (TDD)

```
1. Create tests/ + Vitest config
2. GRILL: Write grill tests → implement grill executor
3. HEALTH: Write health tests → implement health executor  
4. PLAN: Write plan tests → implement plan executor
5. INTEGRATION: CLI↔daemon contract tests
6. CONSTITUTION: Run constitution-check after each
6. REVIEW: Adversarial review of all changes
7. SHIP: bun test passes, health ≥7, review clean
```

## Success Metrics

- **Velocity**: 3 core skills executable in 2 weeks
- **Quality**: `bun test` 100% pass, health ≥7, zero constitutional drift
- **Usability**: `mia grill/health/plan` work end-to-end for real engineering

---

**Constitutional Alignment**: Safe (grill/health gates) → Ethical (plan honesty) → Compliant (workflow) → Helpful (real execution)

**Approval Required**: Human confirms this spec before TDD begins.