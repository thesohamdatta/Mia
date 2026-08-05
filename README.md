<p align="center">
  <img src="./docs/assets/mia-ascii.png" alt="MIA ASCII (#B61C1C)" width="540" />
</p>

<p align="center">
  <b>Personal AI Engineering OS</b> &bull; Compiled &bull; Local-First &bull; Self-Improving
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#core-pipeline">Core Pipeline</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#philosophy">Design Philosophy</a>
</p>

---

### What is MIA?

**MIA** (Machine Intelligence Architecture) is a compiled, local-first AI engineering harness that runs on your machine. It turns raw intent into verified code while compounding learnings across sessions.

- **Grill-to-Ship Pipeline** &mdash; Never write code without explicit clarification & verifiable plans.
- **Self-Improving Memory** &mdash; Every session logs learnings (`.jsonl`) with confidence decay and global wisdom.
- **Zero External Dependencies** &mdash; Compiled Bun single-file binary with sub-millisecond execution.

---

### Quick Start

```bash
# Install MIA OS
curl -fsSL https://raw.githubusercontent.com/thesohamdatta/Mia/main/scripts/bootstrap.sh | bash

# Daily engineering workflow
mia morning     # Start your day: context, priorities & health
mia grill       # Clarification interview before non-trivial tasks
mia ship        # Test -> health check -> review -> PR
```

---

### Core Pipeline

| Skill | Command | Purpose |
| :--- | :--- | :--- |
| **Grill** | `mia grill` | Clarification interview (never code without intent alignment) |
| **Plan** | `mia plan create` | Verifiable task plan with explicit success criteria |
| **Spec** | `mia spec start` | Turn intent into PRD & atomic issue tickets |
| **Health** | `mia health` | Code quality scorekeeper with baked-in verification |
| **Ship** | `mia ship` | Test verification &rarr; pre-landing review &rarr; git PR |
| **Learn** | `mia learn` | Capture typed learnings, confidence scores & decay |

---

### Architecture

```
~/.mia/
├── state.json          # Daemon runtime state (port, token, version)
├── memory.md           # Global curated long-term wisdom
├── bin/
│   ├── mia             # Compiled CLI binary (~94MB)
│   └── miad            # Compiled persistent daemon (~94MB)
└── projects/{slug}/    # Per-repository learning store
    ├── learnings.jsonl # Typed, decay-scored learnings
    └── timeline.jsonl  # Skill execution history
```

---

### Design Philosophy

> *"Simple is deep. The harness is more important than the model."*

1. **Simple** &mdash; Remove everything until you can't. Single binary, local JSONL, zero bloat.
2. **Deep** &mdash; Clean interface on top, rich state engine underneath.
3. **Verifiable** &mdash; Evidence before claims. Verification baked into every execution step.

---

### Building from Source

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
bun run build
```

---

<p align="center">
  MIT Licensed &bull; Built for engineers who ship.
</p>