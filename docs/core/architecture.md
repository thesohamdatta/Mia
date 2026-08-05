# MIA Architecture

> Simple, deep, evolvable. The harness is more important than the model.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        MIA OS                               │
├─────────────────────────────────────────────────────────────┤
│  CLI (bin/mia)  ◄──►  Daemon (bin/miad)  ◄──►  State        │
│  (compiled Bun)     (persistent HTTP)    (~/.mia/)          │
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
| **CLI** | Bun (compiled) | Single binary, sub-ms startup, zero deps |
| **Daemon** | Bun.serve + SQLite-ish (JSONL) | Persistent state, token auth, skill registry |
| **Skills** | TypeScript → compiled into daemon | Self-contained workflows (grill, learn, retro, etc.) |
| **State** | `~/.mia/state.json` | Daemon port, token, version |
| **Projects** | `~/.mia/projects/{slug}/` | Per-repo learnings, timeline, checkpoints |
| **Memory** | `~/.mia/memory.md` | Global curated wisdom (OpenClaw-style) |

---

## Project Hierarchy (Superstructure)

```
~/.mia/
├── state.json              # daemon state
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

**Slug resolution:** Auto-detect from git repo name. If no git, use `default`.

**Domain tags (within learnings):**
```json
{ "domain": "engineering|startup|social|film|health|learning" }
```

All domains share one learning store per project. Tag for filtering.

---

## Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| **Core** | grill, plan, spec, ship, review | Engineering workflow |
| **Learning** | learn, retro, memory, checkpoint | Self-improvement loop |
| **Life** | morning, evening, weekly, health | Daily rituals (v0.3) |
| **Agent** | spawn, delegate, eval | Multi-agent (v0.4) |

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
User → mia <skill> → CLI → HTTP POST /command → Daemon
                                                      │
                    ◄──── JSON response ────────────┤
                                                      ▼
                                            ┌─────────────────┐
                                            │ handleCommand() │
                                            │ - exec skill    │
                                            │ - append learn  │
                                            │ - append timeline│
                                            └─────────────────┘
```

**Auto-learning:** Every skill completion appends to timeline. Skills can append learnings.

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
| **Simple** | JSONL files, compiled binaries, no external deps |
| **Deep** | Simple CLI, rich daemon, typed learning schema |
| **Evolvable** | Skills as modules, append-only storage, domain tags |
| **Verifiable** | Deterministic tests, health scores, confidence scores |

---

## What's Next (v0.2)

1. **Skill template system** — `SKILL.md.tmpl` + `gen-skill-docs.ts` (gstack pattern)
2. **Host adapters** — Claude Code, Hermes, OpenClaw native integration
3. **Daily rituals** — `mia morning`, `mia evening`, `mia weekly`
4. **Spec/ship/review skills** — full grill-to-ship pipeline
5. **AURA integration** — first-class project with agent scaffolding

---

*This architecture is intentionally minimal. Detail lives in skills and code.*