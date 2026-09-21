# ONBOARDING.md — New Member Onboarding & Knowledge Sharing

> A lightweight, living guide for bringing new members (human or AI) up to speed and keeping team knowledge current.

## Core Principles

- **Documentation is a first‑class product** – treat it like code: review, test, version.
- **Progressive disclosure** – newcomers get a starter kit; experts dive deeper on demand.
- **Single source of truth** – the EKB (`ekb/`) is the canonical reference; project‑specific docs live in each repo’s `docs/` or `AGENTS.md`.
- **Learn by doing** – pair programming, mobbing, and small, well‑scoped first tasks beat passive reading.

## 1. Welcome Kit (Day 0‑1)

| Item | Purpose | Location |
|------|---------|----------|
| Welcome email with links | Sets expectations, provides credentials | Sent by lead |
| `README.md` at repo root | Project purpose, tech stack, one‑line setup | Repository root |
| `AGENTS.md` (project‑specific) | Workspace conventions, memory, heartbeats, tool whitelist | Project root |
| `ekb/GLOSSARY.md` | Shared vocabulary & acronyms | `ekb/` |
| First‑ticket (≤ 2 h) | Low‑risk, well‑scoped issue with clear acceptance criteria | Issue tracker |

## 2. Knowledge‑Sharing Practices

### 2.1 Living Documentation
- **README‑driven development**: keep the repo README up‑to‑date; it’s the first thing newcomers read.
- **Decision Records (ADR)**: every architectural decision gets an `docs/adr/NNN-title.md` file (see `ekb/DECISION.md` for template).
- **Inline documentation**: follow *Clean Code* – use intention‑revealing names; add comments only when code cannot be self‑explaining.
- **Wiki‑style knowledge base**: for cross‑project patterns, use the `ekb/` folder (Markdown + YAML). Treat it like a wiki: searchable, linkable, versioned.

### 2.2 Onboarding Buddy System
- Assign a **buddy** (human or experienced AI agent) for the first week.
- Buddy responsibilities:
  - Review the newcomer’s first PR within 24 h.
  - Answer “where‑is‑X” questions.
  - Run a 30‑minute knowledge‑transfer session on the project’s architecture and conventions.

### 2.3 Regular Knowledge Syncs
- **Weekly 15‑minute “Show & Tell”**: anyone shares a tip, a gotcha, or a small refactor.
- **Monthly deep‑dive** (30 min): pick a subsystem, a library, or an AI‑agent pattern and walk through code + docs.
- **Retrospective action items** that improve documentation are treated as regular tickets.

### 2.4 Off‑boarding & Knowledge Retention
- When someone leaves, schedule a **knowledge‑transfer session** and convert notes into `ekb/` entries or project ADRs.
- Archive inactive repos but keep their `README` and `ADRs` accessible.

## 3. Tooling for Documentation

| Tool | Use | Why |
|------|-----|-----|
| **MkDocs / Docusaurus** | Public‑facing docs | Easy search, versioning, theme |
| **Markdown + Prettier** | Internal notes (`*.md`) | Consistent formatting, diff‑friendly |
| **Mermaid** | Diagrams in Markdown | Version‑controlled architecture diagrams |
| **GitHub Wikis** (optional) | Legacy knowledge | Only if already in use; prefer `ekb/` |
| **IDE plugins** (e.g., Grammarly, Vale) | Prose linting | Catch typos, passive voice, inconsistent terminology |

## 4. AI‑Assisted Onboarding

- Use **AI‑powered documentation generators** (see *AI‑Assisted Programming* O'Reilly) to create initial drafts from code comments and type definitions.
- Prompt the agent: “Generate a README for this repository based on the source tree and existing docstrings.”
- Always **review and edit** AI output – treat it as a first draft, not final.
- Leverage **context‑window management**: load only the relevant files (e.g., public API surface) when asking for docs to keep token usage low.

## 5. Checklist for a New Contributor

- [ ] Read the repo’s `README.md` and `AGENTS.md`.
- [ ] Clone the repo, run the dev setup script (`scripts/setup.sh` or equivalent).
- [ ] Run the test suite (`bun test` or `npm test`) – should pass.
- [ ] Look at the latest open issue labeled `good first issue`.
- [ ] Ask the buddy for clarification if anything is unclear.
- [ ] Submit a small PR (e.g., typo fix, documentation improvement) to get familiar with the PR workflow.
- [ ] After first PR is merged, take on a slightly larger task (bug‑fix or small feature).
- [ ] Add any missing or outdated information to the project’s `README` or `AGENTS.md`.
- [ ] Schedule a 15‑minute retro with the buddy to discuss what worked and what was confusing.

## 6. Keeping the EKB Fresh

- **Monthly EKB grooming**: treat `ekb/` like a codebase – run `lint` (markdown linter), fix broken links, update outdated advice.
- **Contribute via PR**: any team member can propose a change to an EKB file; follow the same PR workflow as code.
- **Version‑tag major releases**: when the EKB undergoes a significant restructuring, tag a release (e.g., `ekb-v1.2.0`) and announce in the team channel.

---
*This document lives in `ekb/ONBOARDING.md`. Update it whenever you discover a better way to onboard or share knowledge.*