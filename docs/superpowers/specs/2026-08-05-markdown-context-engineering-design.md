# Design Spec: MIA Markdown Context Engineering & Documentation Sync

**Date:** 2026-08-05  
**Project:** Mia (Machine Intelligence Architecture)  
**Topic:** Context Engineering, Documentation Topology, and Progressive Disclosure Harness  

---

## 1. Executive Summary & Problem Statement
MIA currently has **25 standalone Markdown files** at the root of the repository. This causes severe **context window inflation**, **redundant token usage**, and **documentation drift** across LLM sessions. 

This spec defines a **Progressive Disclosure Documentation Engine** that restructures documentation into a 5-layer graph, establishes `AGENTS.md` as a slim (<100 lines) Context Router Gateway, consolidates redundant files into Single Sources of Truth (SSOT), and adds an automated Markdown Sync Linter (`bun run lint:md`).

---

## 2. Layered Documentation Architecture (Progressive Disclosure)

### Layer 0: Context Router Gateway (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`)
- **`AGENTS.md`**: Primary workspace context router (<100 lines). Contains explicit task-to-file navigation mapping.
- **`CLAUDE.md` / `GEMINI.md`**: Minimal aliases referencing `AGENTS.md` to prevent duplication.

### Layer 1: Core System Architecture & Governance (`docs/core/`)
- **`docs/core/principles.md`**: Consolidated SSOT merging `PRINCIPLES.md`, `DESIGN_PHILOSOPHY.md`, `DESIGN.md`, `VOICE.md`.
- **`docs/core/architecture.md`**: System topology, data flow, daemon/CLI interfaces, memory stores.
- **`docs/core/glossary.md`**: Terminology definitions (Grill, Ship, Health, AURA, JSONL, Harness).

### Layer 2: Workflows & Operational Guides (`docs/workflows/`)
- **`docs/workflows/grill-to-ship.md`**: Merges `WORKFLOW.md`, `REVIEW.md`, `TESTING.md`.
- **`docs/workflows/learning-loop.md`**: Merges `MIA_CONSTITUTIONAL_LEARNING_PROCESS.md` and memory decay specs.
- **`docs/workflows/onboarding.md`**: Onboarding guide for developers and sub-agents.

### Layer 3: Technical Specifications & ADRs (`docs/specs/` & `docs/decisions/`)
- **`docs/specs/`**: Active specifications (`SPEC_SIMPLIFY_DEEPEN.md`, `SPEC_SKILL_EXECUTORS.md`).
- **`docs/decisions/`**: Architecture Decision Records (`DECISION.md`).

### Layer 4: Historical Archives (`docs/archive/`)
- Move static audit reports (`AUDIT_REPORT.md`), past research prompts (`RESEARCH_PROMPT_FINAL.md`), and handoff notes (`HANDOFF.md`) to `docs/archive/` so they never load into context by default.

---

## 3. Standardized Frontmatter & Context Router Graph
Every documentation file under `docs/` must contain YAML frontmatter:
```yaml
---
title: "Core Engineering Principles"
layer: 1
last_updated: "2026-08-05"
owner: "MIA Core Team"
dependencies: ["docs/core/architecture.md"]
---
```

---

## 4. Markdown Sync & Verification Engine (`scripts/sync-docs.ts`)
Add a script `scripts/sync-docs.ts` runnable via `bun run lint:md`:
1. Validates frontmatter presence and schema.
2. Checks all internal markdown file links (`[link](file:///...)`) and heading anchors (`#anchor`).
3. Detects orphaned markdown files missing from the `AGENTS.md` context map.
4. Integrated into `bun run validate` and `mia health`.
