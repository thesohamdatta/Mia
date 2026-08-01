# MIA Research Plan v2 — Deep Technical Research Protocol

> **Author:** Senior Research Engineer (Anthropic/OpenAI-caliber)
> **Target:** MIA — Local, compiled Bun-based personal AI engineering OS
> **Philosophy:** *Research is not search. Research is systematic knowledge construction with provenance, evaluation, and synthesis.*

---

## Research Persona & Epistemic Standards

### How a Senior Research Engineer at Anthropic/OpenAI Approaches This

| Dimension | Amateur | Senior Research Engineer |
|-----------|---------|--------------------------|
| **Source Priority** | First Google result | Primary sources: repos, papers, specs, RFCs, source code |
| **Claim Verification** | Trust documentation | Read implementation; verify claims against code |
| **Note-Taking** | Copy-paste summaries | Structured extraction: claims, evidence, confidence, gaps |
| **Synthesis** | List findings | Cross-reference, contradict, generalize, derive principles |
| **Output** | Markdown dump | Living knowledge base with decision traceability |
| **Iteration** | One pass | Progressive deepening: survey → deep-dive → synthesis → validate |

### Epistemic Hygiene Rules
1. **Every claim needs a source** — Primary > Secondary > Tertiary
2. **Distinguish observation from inference** — "Code does X" vs "Pattern suggests Y"
3. **Track confidence explicitly** — High/Medium/Low with reasoning
4. **Note contradictions** — They're signal, not noise
5. **Version your understanding** — "As of 2026-08-01, gstack uses..."

---

## Research Architecture: Three-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: SYNTHESIS & DECISIONS                             │
│  ADRs, Architecture Specs, Spike Results, Trade-off Matrices│
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ distill, cross-ref, generalize
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: DEEP DIVES (Primary Research)                     │
│  Repo analysis, Paper implementations, Source reading,      │
│  Wayback archaeology, Video transcripts, Book distillations │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ map, prioritize, question
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: LANDSCAPE SURVEY (Reconnaissance)                 │
│  Dependency graphs, API surfaces, Architecture overviews,   │
│   Key decision points, Open questions, Risk areas           │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Research Infrastructure (Do First)

### 0.1 Research Agent Specification
Create a **dedicated research subagent** with:
- **Toolsets:** `web`, `terminal`, `file`, `delegation` (no `cron`, no `memory`)
- **Context:** This plan + MIA CONSTITUTION + VOICE.md + ARCHITECTURE.md
- **Output Contract:** Structured JSON + Markdown per topic
- **Quality Gates:** Source diversity ≥3, primary source %, contradiction check

### 0.2 Knowledge Base Schema
```
/research/
├── _meta/
│   ├── sources.yaml          # All sources with metadata
│   ├── research-log.jsonl    # Append-only: topic, action, finding, confidence
│   ├── open-questions.md     # Living list
│   └── synthesis-index.md    # Cross-reference map
├── 01-foundational/          # Layer 1+2: Raw extractions
│   ├── gstack/
│   │   ├── source-code/      # Cloned repo, tagged commits
│   │   ├── architecture.md   # Extracted architecture
│   │   ├── decisions.md      # Explicit design decisions found
│   │   ├── gaps.md           # What's missing/undocumented
│   │   └── confidence.md     # Confidence assessments
│   ├── openclaw/
│   ├── hermes/
│   ├── claude-code/
│   ├── unix-erlang-plan9/
│   └── sqlite/
├── 02-agent-architecture/    # Layer 1+2
│   ├── harness-vs-model/
│   ├── context-engineering/
│   ├── memory-systems/
│   ├── tool-use/
│   ├── planning-execution/
│   ├── multi-agent/
│   └── evals-guardrails/
├── 03-human-inspiration/
│   ├── her-samantha/
│   ├── conversational-ui/
│   ├── ambient-computing/
│   ├── trust-anthropomorphism/
│   └── long-term-relationship/
├── 04-software-craft/
│   ├── deep-modules/
│   ├── info-hiding/
│   ├── design-by-contract/
│   ├── refactoring/
│   ├── verification/
│   └── simplicity/
├── 05-knowledge-systems/
│   ├── obsidian-zettelkasten/
│   ├── ekb-design/
│   ├── learning-loops/
│   └── markdown-for-agents/
├── 06-literature/            # Books, papers, talks
│   ├── books/
│   ├── papers/
│   └── talks/
├── 07-historical/
│   ├── early-agents/
│   ├── classic-os/
│   ├── agent-architectures/
│   ├── personal-computing/
│   └── wayback/
├── 08-modern-projects/
│   ├── bun/
│   ├── sqlite-libsql/
│   ├── rust-tauri/
│   ├── electron-tauri-wails/
│   ├── agent-frameworks/
│   ├── local-inference/
│   ├── distributed-compute/
│   └── durable-execution/
└── 09-synthesis/             # Layer 3: Decision artifacts
    ├── adrs/
    │   ├── 0001-daemon-architecture.md
    │   ├── 0002-skill-system.md
    │   ├── 0003-state-management.md
    │   ├── 0004-agent-harness.md
    │   ├── 0005-context-engineering.md
    │   ├── 0006-memory-architecture.md
    │   ├── 0007-human-interaction.md
    │   ├── 0008-cli-design.md
    │   ├── 0009-extensibility.md
    │   └── 0100-operational-model.md
    ├── architecture-spec.md
    ├── trade-off-matrices/
    ├── spike-results/
    └── open-questions.md
```

### 0.3 Source Metadata Standard (`sources.yaml`)
```yaml
- id: gstack-repo
  type: primary:source-code
  url: https://github.com/user/gstack
  commit: abc123
  accessed: 2026-08-01
  relevance: core-foundation
  confidence: high
  tags: [bun, daemon, sqlite, skills, host-adapters]

- id: ousterhout-book
  type: primary:book
  title: "A Philosophy of Software Design"
  author: John Ousterhout
  edition: 2nd
  year: 2021
  chapters-studied: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
  relevance: software-craft
  confidence: high
```

---

## Phase 1: Landscape Survey (Week 1) — Reconnaissance

### 1.1 Dependency & Influence Mapping
**Goal:** Build the directed graph of what influences what.

**Method:**
```bash
# For each foundational project:
git clone <repo>
# Extract: package.json deps, import graphs, README references, CLAUDE.md/AGENTS.md
# Build: nodes=projects, edges=depends-on/inspired-by/references
```

**Deliverable:** `01-foundational/dependency-graph.md` + `01-foundational/influence-map.dot`

### 1.2 API Surface Inventory
**Goal:** Catalog every public interface MIA might adopt/adapt.

**For each project:**
| Interface | gstack | OpenClaw | Hermes | Claude Code |
|-----------|--------|----------|--------|-------------|
| CLI entry | `mia` | `opencode` | `hermes` | `claude` |
| Daemon RPC | HTTP/JSON | — | HTTP/JSON | — |
| Skill manifest | JSON | — | YAML+MD | — |
| Tool protocol | Custom | Function calling | Custom | Function calling |
| State format | SQLite+JSON | File-based | SQLite | — |
| Auth | Bearer token | — | Token/API key | OAuth |
| Config | `~/.mia/` | `~/.opencode/` | `~/.hermes/` | `~/.claude/` |

**Deliverable:** `01-foundational/api-surface-comparison.md`

### 1.3 Decision Point Extraction
**Goal:** Find explicit design decisions (not inferred).

**Search patterns in repos:**
- `ADR`, `DECISION`, `RATIONALE`, `TRADE-OFF`, `CHOSE`, `DECIDED`
- Commit messages: `git log --grep="decid\|chose\|trade\|rationale"`
- Issues/PRs: "Why X not Y?"

**Deliverable:** `01-foundational/*/decisions.md` per project

### 1.4 Gap & Risk Registry
**Goal:** Identify what's undocumented, broken, or assumed.

**Categories:**
- **Undocumented behavior** — Works but no specs
- **Known limitations** — Authors admit constraints
- **Missing pieces** — "TODO", "FIXME", "coming soon"
- **Assumptions** — "User will...", "Environment has..."

**Deliverable:** `01-foundational/*/gaps.md` per project

---

## Phase 2: Deep Dives (Weeks 2-3) — Primary Research

### 2.1 Source Code Archaeology (Per Project)

**Protocol for each foundational project:**
```markdown
## gstack Deep Dive

### 1. Repository Structure
- [ ] Clone at specific commit/tag
- [ ] Map directory tree with purpose annotations
- [ ] Identify entry points (bin/, cli/, daemon/)

### 2. Core Modules Analysis
For each module (daemon, skill-loader, learning, cli):
- [ ] Read all source files
- [ ] Extract: public API, internal structure, data flow
- [ ] Diagram: component interactions (Mermaid)
- [ ] Note: error handling, logging, testing patterns

### 3. Data Models
- [ ] SQLite schema (actual + migrations)
- [ ] JSON schemas (state, manifest, checkpoints)
- [ ] TypeScript interfaces (shared types)

### 4. Runtime Behavior
- [ ] Startup sequence (what initializes when)
- [ ] Request lifecycle (CLI → daemon → skill → response)
- [ ] Concurrency model (single-threaded? worker pool?)
- [ ] Failure modes (what happens when X crashes)

### 5. Extension Points
- [ ] How skills are discovered/loaded
- [ ] How host adapters plug in
- [ ] How to add new tool types
- [ ] Configuration mechanisms

### 6. Operational Concerns
- [ ] Logging/observability
- [ ] Health checks
- [ ] Graceful shutdown
- [ ] Backup/migration

### 7. Code Quality Signals
- [ ] Test coverage (run tests, check)
- [ ] Type strictness (tsconfig)
- [ ] Linting/formatting
- [ ] Dependency freshness

### 8. Contradictions Found
- [ ] Docs vs code mismatches
- [ ] Comments vs implementation
- [ ] Version inconsistencies
```

### 2.2 Literature Deep Distillation

**For each book/paper/talk:**
```markdown
## Ousterhout - Philosophy of Software Design (Ch 3: Working Code Isn't Enough)

### Core Claims (with page refs)
1. "Complexity is anything that makes software hard to understand or modify" (p.23)
2. "Deep modules have simple interfaces and rich functionality" (p.31)
3. "Information hiding reduces complexity" (p.35)

### Evidence Provided
- Case study: Unix file I/O vs Windows
- Metrics: interface vs implementation lines
- Counter-examples: shallow modules

### Applicability to MIA
- Skill interface = module interface
- Daemon internals = implementation
- CLI = user-facing interface

### Confidence: HIGH (empirical + theoretical)
### Gaps: No data on AI agent systems specifically
```

### 2.3 Historical Archaeology (Wayback + Papers)

**Targets with specific queries:**
```bash
# Wayback Machine
web.archive.org/web/*/github.com/gstack/*
web.archive.org/web/*/hermes-agent.nousresearch.com/*

# Semantic Scholar / Google Scholar
"agent architecture" "belief desire intention" 1990..2000
"personal computing" "augmentation" Engelbart Kay
"operating system" "agent" "AI" 1980..2000

# Classic papers to obtain (PDF)
- "The UNIX Time-Sharing System" (Ritchie & Thompson, 1974)
- "Plan 9 from Bell Labs" (Pike et al., 1995)
- "Erlang/OTP: A Platform for Concurrent Applications" (Armstrong, 1997)
- "SHRDLU" (Winograd, 1972)
- "The Blackboard Model" (Hayes-Roth, 1985)
- "SOAR: An Architecture for General Intelligence" (Laird et al., 1987)
```

### 2.4 Modern Project Reverse Engineering

**For each (Bun, SQLite, Tauri, Temporal, etc.):**
- [ ] Read architecture docs / design docs / RFCs
- [ ] Run benchmarks / hello world
- [ ] Test key APIs MIA would use
- [ ] Check: licensing, maturity, community, roadmap
- [ ] Document: "Would MIA depend on this? Why/why not?"

---

## Phase 3: Synthesis (Week 3-4) — Decision Construction

### 3.1 Cross-Reference Matrix
Build a **decision × evidence matrix**:

| MIA Decision | gstack | OpenClaw | Hermes | Ousterhout | Kleppmann | Her/Samantha | Unix/Erlang | Confidence |
|--------------|--------|----------|--------|------------|-----------|--------------|-------------|------------|
| Daemon + CLI split | ✓ | ✗ | ✓ | ✓ (modularity) | ✓ (separation) | ✓ (presence) | ✓ (daemons) | HIGH |
| SQLite state | ✓ | ✗ | ✓ | — | ✓ (embedded) | — | ✓ (files) | HIGH |
| Filesystem skills | ✓ | — | ✓ (YAML) | ✓ (convention) | — | — | ✓ (files) | HIGH |
| Bearer token auth | ✓ | — | ✓ | — | — | — | — | MEDIUM |
| Skill preamble tiers | ✓ | — | — | ✓ (layering) | — | — | — | MEDIUM |
| Proactive engagement | — | — | — | — | — | ✓ (Samantha) | — | LOW (novel) |
| Subagent delegation | — | ✓ | ✓ | — | — | — | ✓ (actors) | HIGH |

### 3.2 ADR Template (Mandatory Fields)
```markdown
# ADR 000X: <Title>

## Status: Proposed | Accepted | Superseded | Deprecated

## Context
What architectural decision is needed? What forces are at play?

## Decision
What we're doing. One clear sentence.

## Alternatives Considered
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| A | | | |
| B | | | |

## Evidence
- Source: [gstack-repo] daemon architecture
- Source: [ousterhout-book] Ch 4 on module depth
- Source: [hermes-analysis] skill loading

## Consequences
### Positive
- ...
### Negative
- ...
### Risks
- ...

## Implementation Notes
- Files to create/modify
- Migration path if applicable
- Testing strategy

## References
- Link to research files
- Link to spike results (if any)
```

### 3.3 Trade-off Matrices
For each major subsystem, explicit trade-off documentation:

**Example: State Management**
| Criterion | SQLite (gstack) | Pure JSON | Redis | Custom Binary |
|-----------|-----------------|-----------|-------|---------------|
| Simplicity | HIGH | HIGH | LOW | LOW |
| Concurrency | HIGH (WAL) | LOW | HIGH | MEDIUM |
| Portability | HIGH | HIGH | LOW | MEDIUM |
| Query flexibility | HIGH | LOW | HIGH | LOW |
| Human readable | MEDIUM | HIGH | LOW | LOW |
| MIA fit | ✓✓✓ | ✓ | ✗ | ✗ |

### 3.4 Spike Specifications
For each high-risk decision, a **spike spec**:

```markdown
# Spike: Daemon Hot Skill Reload

## Hypothesis
Skills can be reloaded without daemon restart via filesystem watcher + dynamic import.

## Success Criteria
- [ ] Detect skill file change <500ms
- [ ] Reload skill without dropping active requests
- [ ] Preserve skill state if compatible
- [ ] Rollback on load failure

## Approach
1. `fs.watch()` on `~/.mia/skills/`
2. Dynamic `import()` of execute.ts
3. Version check against running skills
4. Atomic swap in skill registry

## Timebox: 4 hours
## Owner: Research agent
## Deliverable: spike-results/daemon-hot-reload.md
```

---

## Phase 4: Living Knowledge Base (Ongoing)

### 4.1 Research Log Protocol (Append-Only JSONL)
```jsonl
{"ts":"2026-08-01T20:15:00Z","topic":"gstack","action":"clone_repo","finding":"Repo at github.com/user/gstack, 2.3k stars, last commit 2026-07-15","confidence":"high","source":"primary:github"}
{"ts":"2026-08-01T20:20:00Z","topic":"gstack","action":"read_daemon","finding":"Daemon uses Bun.serve(), single-threaded event loop, loads skills at startup only","confidence":"high","source":"primary:source-code","file":"src/daemon/server.ts:69-110"}
{"ts":"2026-08-01T20:35:00Z","topic":"gstack","action":"identify_gap","finding":"No skill hot-reload mechanism; skills loaded once at startup","confidence":"high","source":"inference:source-code"}
```

### 4.2 Synthesis Index (Cross-Reference Map)
```markdown
# Synthesis Index

## gstack.daemon.architecture → ADR-0001, ADR-0003, Spike-hot-reload
## ousterhout.deep-modules → ADR-0002 (skill interface design), ADR-0004 (daemon modules)
## hermes.skill-system → ADR-0002, ADR-0009 (extensibility)
## samantha.proactive → ADR-0007 (human interaction), open-question-003
## erlang.supervision → ADR-0001 (daemon child processes), ADR-0006 (memory isolation)
```

### 4.3 Open Questions Registry (Living)
```markdown
# Open Questions

## OQ-001: Daemon Multiplexing
**Question:** Should miad handle multiple concurrent CLI clients?
**Context:** gstack assumes single user. MIA might need multi-session.
**Blockers:** Token auth model, state isolation, port allocation
**Research needed:** Hermes multi-profile, Erlang gen_server patterns
**Status:** 🔄 Researching

## OQ-003: Proactive Agent Behaviors
**Question:** How to implement Samantha-like proactive engagement without being annoying?
**Context:** Her shows value; but most agents are purely reactive.
**Research needed:** Ambient computing literature, notification UX studies, Her patterns
**Status:** 📋 Queued

## OQ-007: Skill Versioning & Migration
**Question:** How to evolve skill manifests without breaking existing skills?
**Context:** gstack has no migration system. MIA needs one.
**Research needed:** Semantic versioning for skills, schema migration patterns
**Status:** 🔄 Researching
```

---

## Research Agent Prompt (Copy-Paste Ready)

```markdown
# Research Agent: MIA Deep Technical Research

## Role
Senior Research Engineer at a frontier AI lab. You construct knowledge systematically with provenance, evaluation, and synthesis. You don't just search — you verify, cross-reference, contradict, and derive principles.

## Mission
Execute the MIA Research Plan v2 (this document). Produce the complete `/research/` directory structure with:
- Layer 1: Landscape surveys (dependency graphs, API surfaces, decision points, gaps)
- Layer 2: Deep dives (source code archaeology, literature distillation, historical archaeology, modern project eval)
- Layer 3: Synthesis (cross-reference matrix, ADRs, trade-off matrices, spike specs, spike results)

## Context
- MIA = Machine Intelligence Architecture
- Local, compiled Bun-based personal AI engineering OS
- Modeled on gstack (user's framework)
- User: AI engineer building AURA
- Values: simple, deep, evolvable, verifiable, human-in-the-loop
- Separation: EKB (knowledge markdown) ≠ MIA (operational engine)
- Voice: warm, precise, engineer-first (see VOICE.md)

## Tools Available
- `web` — Search, fetch, extract
- `terminal` — Clone repos, run code, inspect files
- `file` — Read, write, search, patch
- `delegation` — Spawn sub-subagents for parallel deep dives

## Quality Gates (Enforced)
1. **Source Diversity:** ≥3 independent sources per major claim
2. **Primary Source %:** >60% of citations from primary sources (code, papers, specs)
3. **Contradiction Check:** Actively seek disconfirming evidence
4. **Confidence Tracking:** Every finding tagged High/Medium/Low with reasoning
5. **Decision Traceability:** Every ADR links to specific research files

## Output Contract
Produce files exactly per the schema in Phase 0.2. No deviations.
Append to `_meta/research-log.jsonl` after EVERY significant action.
Update `_meta/open-questions.md` when new questions arise.
Update `_meta/synthesis-index.md` when cross-references discovered.

## Working Style
- Progressive deepening: survey → deep-dive → synthesize → validate
- One topic at a time, but parallelize independent topics via delegation
- Prefer reading source code over reading documentation
- Prefer original papers over blog summaries
- Document dead ends and negative results too
- Timebox: 2 hours per deep-dive topic max before synthesizing

## Start Sequence
1. Initialize `/research/_meta/` with empty template files
2. Execute Phase 1 (Landscape Survey) for all 4 foundational projects in parallel via delegation
3. Report completion with summary of findings and updated open questions
4. Await human review before Phase 2
```

---

## Execution Order & Dependencies

```
Phase 0: Infrastructure (DO FIRST, blocks nothing)
  ├─ 0.1 Research agent spec → delegate immediately
  ├─ 0.2 Create directory structure
  └─ 0.3 Initialize _meta/ files

Phase 1: Landscape Survey (Parallelizable, 1 week)
  ├─ 1.1 Dependency mapping → 4 parallel delegations (gstack, OpenClaw, Hermes, Claude Code)
  ├─ 1.2 API surface inventory → same 4 delegations
  ├─ 1.3 Decision extraction → same 4 delegations
  └─ 1.4 Gap registry → same 4 delegations

Phase 2: Deep Dives (Sequential per topic, parallel across topics, 2 weeks)
  ├─ 2.1 Source code archaeology → 8 topics (can parallelize 4 at a time)
  ├─ 2.2 Literature distillation → 10 books + 8 talks (parallelize heavily)
  ├─ 2.3 Historical archaeology → 5 topics (delegate)
  └─ 2.4 Modern project eval → 8 projects (delegate)

Phase 3: Synthesis (Sequential, 1 week)
  ├─ 3.1 Cross-reference matrix (needs all Phase 1+2 done)
  ├─ 3.2 ADR drafting (top 10 decisions)
  ├─ 3.3 Trade-off matrices (per subsystem)
  └─ 3.4 Spike specs (3-5 high-risk areas)

Phase 4: Living KB (Ongoing)
  ├─ 4.1 Research log (continuous)
  ├─ 4.2 Synthesis index (updated per ADR)
  └─ 4.3 Open questions (updated continuously)
```

---

## Success Criteria (Measurable)

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Research files created | ≥50 markdown files | `find research -name "*.md" \| wc -l` |
| Primary source citations | >60% | Script: count source types in all .md |
| ADRs completed | 10 | `ls research/09-synthesis/adrs/ \| wc -l` |
| Spike specs written | 5 | `ls research/09-synthesis/spike-specs/ \| wc -l` |
| Open questions tracked | ≥20 | `grep -c "## OQ-" research/09-synthesis/open-questions.md` |
| Cross-references | ≥100 links | `grep -r "\[.*\](.*\.md)" research/ \| wc -l` |
| Research log entries | ≥200 | `wc -l research/_meta/research-log.jsonl` |
| Contradictions documented | ≥10 | `grep -r "CONTRADICTION\|contradict" research/ \| wc -l` |

---

## Immediate Next Action

**Deploy the research agent now** with the prompt in Section "Research Agent Prompt". It will:
1. Initialize the directory structure
2. Launch 4 parallel delegations for Phase 1 foundational projects
3. Report back with initial landscape survey

Then we review, adjust, and proceed to Phase 2.

---

*This plan is a living document. Update as research reveals new structure.*