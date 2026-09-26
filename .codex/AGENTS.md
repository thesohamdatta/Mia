# MIA Agent Entry for Codex

MIA exposes a small project-local agent skill surface under `.agents/skills/`.

## MIA skills

- `/plan` — structured engineering planning
- `/review` — pre-landing review
- `/ship` — shipping verification and handoff

These files are generated adapters. The executable source of truth is `core/skills/index.ts`.

Run `mia setup` from the project root to install or refresh the MIA skill surface for supported coding agents.

## Engineering rule

Use MIA's workflow rather than inventing a parallel process. Preserve upstream artifacts, verify claims with evidence, and keep consequential human approval explicit.
