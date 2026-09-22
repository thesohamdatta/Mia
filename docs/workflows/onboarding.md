---
type: workflow
scope: repository
status: active
owner: engineering
canonical: true
audience: human+agent
load: on-demand
---

# MIA Onboarding

## Start here

1. [AGENTS.md](../../AGENTS.md)
2. [CONTEXT.md](../../CONTEXT.md)
3. [docs/core/architecture.md](../core/architecture.md)
4. [docs/core/skills-index.md](../core/skills-index.md)
5. The narrowest relevant workflow or reference

Do not start by reading the whole repository.

## Repository shape

```text
MIA/
├── core/
│   ├── cli/       # command entry point
│   ├── generator/ # documentation generation
│   ├── skills/    # executable skills
│   ├── state/     # unified state
│   └── test/      # regression/integration coverage
├── docs/          # project documentation
├── .agents/       # coordination protocol and state
├── AGENTS.md      # agent entry rules
├── CONTEXT.md     # project vocabulary
└── README.md      # human-facing overview
```

## Current-source rule

Executable source is the truth for current behaviour. In particular, the skill command surface comes from `core/skills/index.ts`.

## First validation

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Use the narrowest relevant set during iteration and the broader gate before integration.
