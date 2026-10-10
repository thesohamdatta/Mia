# Memory and checkpoints

MIA is designed to preserve useful project context beyond one terminal session.

## Local state root

The active runtime uses `MIA_DIR`, defaulting to `~/.mia`. State paths are derived from this root.

A typical layout includes:

```text
~/.mia/
├── memory.md
├── skills/
├── projects/
│   └── <project-slug>/
│       └── events.jsonl
└── sessions/
```

The exact files evolve with the implementation; current source and tests are authoritative.

## Project events

The shared store persists project events such as learnings, timeline activity, and checkpoints. Relevant commands are `mia memory`, `mia learn`, `mia checkpoint`, and `mia retro`.