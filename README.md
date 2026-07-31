# MIA (Machine Intelligence Architecture)

> A personal AI engineering OS — compiled, local-first, self-improving.

## What is MIA?

MIA is a **personal AI chief of staff** for software engineers. It runs as a compiled Bun binary with a persistent daemon, giving you:

- **Grill-to-Ship pipeline** — never code without clarification
- **Self-improving memory** — every session makes the next one smarter
- **Daily rituals** — morning briefing, evening reflection, weekly retro
- **AURA integration** — first-class support for your agent projects
- **Zero external deps** — local-first, privacy-first, Bun compiled

## Quick Start

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/thesohamdatta/Mia/main/scripts/bootstrap.sh | bash

# Start daemon
mia daemon

# Start your day
mia morning

# Before any non-trivial work
mia grill

# Plan with success criteria
mia plan create

# Spec → PRD → issues
mia spec start "Build an AI agent"

# Verify quality before shipping
mia health

# Ship: test → review → push → PR
mia ship

# End of day
mia evening

# End of week
mia weekly
```

## Core Skills

| Skill | Purpose |
|-------|---------|
| `grill` | Clarification interview (golden rule: never code without grill) |
| `plan` | Verifiable planning with success criteria |
| `spec` | Turn intent into PRD → atomic issues |
| `ship` | Test → health ≥7 → review → push → PR |
| `review` | Adversarial pre-landing review |
| `health` | Code quality scorekeeper (verification baked in) |

## Learning Skills

| Skill | Purpose |
|-------|---------|
| `learn` | Manage project learnings (JSONL, confidence, decay) |
| `retro` | Timeline + learnings retrospective |
| `memory` | Global long-term memory (`~/.mia/memory.md`) |
| `checkpoint` | Save/resume working state |

## Daily Rituals

| Skill | When | Purpose |
|-------|------|---------|
| `morning` | Start of day | Context, priorities, health checks |
| `evening` | End of day | Capture learnings, prepare tomorrow |
| `weekly` | End of week | Trends, patterns, strategy |

## AURA Integration

```bash
mia aura init    # Scaffold AURA monorepo
mia aura agent   # Create agent template
```

## Architecture

```
~/.mia/
├── state.json              # Daemon state (port, token, version)
├── memory.md               # Global curated wisdom
├── bin/
│   ├── mia                 # Compiled CLI (~94MB)
│   └── miad                # Compiled daemon (~94MB)
├── skills/                 # Auto-loaded from filesystem
│   ├── core/               # grill, plan, spec, ship, review, health
│   ├── learning/           # learn, retro
│   ├── life/               # morning, evening, weekly
│   └── agent/              # aura
└── projects/{slug}/        # Per-project learning
    ├── learnings.jsonl     # Typed, confidence-scored, decaying
    ├── timeline.jsonl      # Auto-logged skill events
    └── checkpoints/        # Working state snapshots
```

## Design Philosophy

| Principle | Source |
|-----------|--------|
| Simple — remove until you can't | Jony Ive |
| Deep — simple interface, rich underneath | Dieter Rams |
| Evolvable — designed to change without breaking | Steve Jobs |
| Verification baked in, not afterthought | Tariq Shaukat (Sonar) |
| Cognitive debt is real | Geoffrey Litt (Notion) |

## Requirements

- **Bun** ≥ 1.3 (for running source)
- **Windows/macOS/Linux** (compiled binaries are cross-platform)

## Building from Source

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
bun run build
```

Produces `bin/mia` and `bin/miad` — single-file executables with zero runtime dependencies.

## Status

**v0.2** — Complete grill-to-ship pipeline, learning layer, daily rituals, AURA scaffolding.  
Daemon auto-loads skills from `~/.mia/skills/`. All 12 skills registered and working.

---

*Built on gstack patterns. Designed for engineers who ship.*