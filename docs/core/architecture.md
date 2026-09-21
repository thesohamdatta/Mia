# MIA Architecture

> Simple, deep, evolvable. The harness is more important than the model.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        MIA OS                               │
├─────────────────────────────────────────────────────────────┤
│  CLI (bin/mia)  ◄──►  ExecutionContext  ◄──►  State         │
│  (compiled Bun)       (Direct Execution)      (~/.mia/)     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Skills     │  │  Learning   │  │  Projects          │  │
│  │  (core,     │  │  (learnings,│  │  (per-repo,        │  │
│  │   learning, │  │   timeline, │  │   per-domain)      │  │
│  │   life)     │  │   memory)   │  │                    │  │
│  └─────────────┘  └─────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **CLI** | Bun (compiled) | Single binary (`bin/mia`), sub-ms startup, direct execution |
| **Execution Context** | Middleware Pipeline | Config resolution, state store initialization, skill dispatch |
| **Skills** | TypeScript → compiled CLI | Self-contained workflows (`grill`, `learn`, `retro`, `vc`, etc.) |
| **State** | `~/.mia/` | Global memory and project event logs (`JSONL`) |
| **Projects** | `~/.mia/projects/{slug}/` | Per-repo learnings, timeline, checkpoints |
| **Memory** | `~/.mia/memory.md` | Global curated wisdom |

---

## Project Hierarchy (Superstructure)

```
~/.mia/
├── memory.md               # global long-term memory
└── projects/
    ├── aura/               # AURA project
    │   ├── learnings.jsonl
    │   ├── timeline.jsonl
    │   └── checkpoints/
    ├── mia/                # MIA self-development
    │   ├── learnings.jsonl
    │   ├── timeline.jsonl
    │   └── checkpoints/
    ├── work/               # work projects
    │   ├── learnings.jsonl
    │   ├── timeline.jsonl
    │   └── checkpoints/
    └── life/               # personal domains (tagged)
        ├── learnings.jsonl
        ├── timeline.jsonl
        └── checkpoints/
```

**Slug resolution:** Auto-detect from git repo name via local directory lookup. If no git, use `default`.

**Domain tags (within learnings):**
```json
{ "domain": "engineering|startup|social|film|health|learning" }
```

All domains share one learning store per project. Tag for filtering.

---

## Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| **Core** | grill, plan, spec, ship, review, vc | Engineering workflow |
| **Learning** | learn, retro, memory, checkpoint | Self-improvement loop |
| **Life** | morning, evening, weekly, health | Daily rituals |
| **Agent** | spawn, delegate, eval | Multi-agent coordination |

---

## Learning Loop (gstack-inspired)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  OBSERVE    │───►│  LEARN      │───►│  DISTILL    │
│  (session)  │    │  (auto)     │    │  (retro)    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                                    │
       │                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  EVOLVE     │◄───│  VERIFY     │◄───│  APPLY      │
│  (patterns) │    │  (tests)    │    │  (next run) │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Storage:**
- `learnings.jsonl` — typed, confidence (1-10), decay (1pt/30d), source
- `timeline.jsonl` — auto-logged skill events (start/complete/fail)
- `checkpoints/` — markdown snapshots for resume
- `memory.md` — global curated wisdom

---

## Data Flow

```
User → mia <skill> → CLI → ExecutionContext → Middleware
                                                    │
                   ◄──── Direct Result ─────────────┤
                                                    ▼
                                          ┌───────────────────┐
                                          │ Skill Executor    │
                                          │ - exec skill      │
                                          │ - append learn    │
                                          │ - append timeline │
                                          └───────────────────┘
```

**Direct Execution Model:**
Per [ADR-0001](../decisions/ADR-0001-eliminate-daemon.md), MIA executes commands directly in process without a background daemon or HTTP control plane.

**Auto-learning:** Every skill completion appends to timeline via `UnifiedStore`. Skills can append learnings.

---

## North Star: Agentic Software Development

```
/autoship (future)
  describe feature → approve plan → autonomous execution
    │
    ├── /office-hours → /autoplan (CEO → design → eng)
    ├── /checkpoint auto-save before each phase
    ├── /health quality gate (score ≥ 7)
    ├── /review (adversarial + specialists)
    ├── /qa (browser + unit + integration)
    └── /ship (tests → review → push → PR)
```

MIA is the **harness** that makes autonomous agents reliable:
- Persistent state across compaction/sessions
- Learnings compound across runs
- Verification > confidence

---

## Design Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Simple** | Direct CLI execution, JSONL files, compiled binary, zero deps |
| **Deep** | Simple CLI interface, rich middleware pipeline, typed learning schema |
| **Evolvable** | Skills as modules, append-only storage, domain tags |
| **Verifiable** | Deterministic tests, health scores, confidence scores |

---

*This architecture is intentionally minimal. Detail lives in skills and code.*
