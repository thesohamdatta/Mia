# MIA Markdown Context Engineering & Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MIA's 25 scattered Markdown files into a 5-layer Progressive Disclosure Documentation Engine with a slim (<100 line) Layer 0 Context Router (`AGENTS.md`) and automated Markdown Sync Linter (`bun run lint:md`).

**Architecture:** 
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`: Layer 0 Context Router.
- `docs/core/`: Principles, Architecture, Glossary.
- `docs/workflows/`: Grill-to-Ship, Learning Loop, Onboarding.
- `docs/specs/` & `docs/decisions/`: Active technical specs and ADRs.
- `docs/archive/`: Historical audit reports and research prompts.
- `scripts/sync-docs.ts`: Automated Markdown link & frontmatter validator.

**Tech Stack:** Bun, TypeScript, Markdown, YAML Frontmatter.

## Global Constraints
- `AGENTS.md` must remain under 100 lines.
- All docs under `docs/` must contain valid YAML frontmatter.
- Zero broken internal links (`file:///...` or relative paths).

---

### Task 1: Directory Restructuring & File Relocation

**Files:**
- Create: `docs/core/`
- Create: `docs/workflows/`
- Create: `docs/decisions/`
- Create: `docs/archive/`

- [ ] **Step 1: Create directory hierarchy (`docs/core/`, `docs/workflows/`, `docs/decisions/`, `docs/archive/`)**
- [ ] **Step 2: Move historical files (`AUDIT_REPORT.md`, `RESEARCH_PROMPT_FINAL.md`, `HANDOFF.md`) to `docs/archive/`**
- [ ] **Step 3: Move ADRs (`DECISION.md`) to `docs/decisions/`**
- [ ] **Step 4: Move specs (`SPEC_SIMPLIFY_DEEPEN.md`, `SPEC_SKILL_EXECUTORS.md`) to `docs/specs/`**
- [ ] **Step 5: Commit Task 1**

---

### Task 2: Consolidation into Single Sources of Truth (SSOT)

**Files:**
- Create: `docs/core/principles.md` (merging `PRINCIPLES.md`, `DESIGN_PHILOSOPHY.md`, `DESIGN.md`, `VOICE.md`)
- Create: `docs/core/architecture.md` (merging `ARCHITECTURE.md`, `AI.md`, `CONTEXT.md`)
- Create: `docs/workflows/grill-to-ship.md` (merging `WORKFLOW.md`, `REVIEW.md`, `TESTING.md`)
- Create: `docs/workflows/learning-loop.md` (merging `MIA_CONSTITUTIONAL_LEARNING_PROCESS.md`)
- Create: `docs/workflows/onboarding.md` (from `ONBOARDING.md`)
- Create: `docs/core/glossary.md` (from `GLOSSARY.md`)

- [ ] **Step 1: Write `docs/core/principles.md` with YAML frontmatter**
- [ ] **Step 2: Write `docs/core/architecture.md` with system topology & context budget rules**
- [ ] **Step 3: Write `docs/workflows/grill-to-ship.md` with complete lifecycle gates**
- [ ] **Step 4: Write `docs/workflows/learning-loop.md` with constitutional learning process**
- [ ] **Step 5: Remove obsolete root files (`PRINCIPLES.md`, `DESIGN_PHILOSOPHY.md`, `DESIGN.md`, `VOICE.md`, `WORKFLOW.md`, `REVIEW.md`, `TESTING.md`, `CONTEXT.md`, `AI.md`)**
- [ ] **Step 6: Commit Task 2**

---

### Task 3: Layer 0 Context Gateway Refactoring (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`)

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `GEMINI.md`

- [ ] **Step 1: Write slim (<100 line) `AGENTS.md` with Task-to-Context Router Map**
- [ ] **Step 2: Update `CLAUDE.md` to reference `AGENTS.md`**
- [ ] **Step 3: Update `GEMINI.md` to reference `AGENTS.md`**
- [ ] **Step 4: Commit Task 3**

---

### Task 4: Markdown Sync & Verification Engine (`scripts/sync-docs.ts`)

**Files:**
- Create: `scripts/sync-docs.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/sync-docs.ts` script using Bun to validate frontmatter & markdown links**
- [ ] **Step 2: Add `lint:md:sync` to `package.json` scripts**
- [ ] **Step 3: Test `bun run scripts/sync-docs.ts`**
- [ ] **Step 4: Commit Task 4**

---

### Task 5: Final Validation & Integration Verification

- [ ] **Step 1: Run `bun run scripts/sync-docs.ts` to ensure 0 broken links**
- [ ] **Step 2: Verify root directory structure**
- [ ] **Step 3: Commit Task 5**
