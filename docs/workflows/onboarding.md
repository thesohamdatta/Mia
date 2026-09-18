# MIA Onboarding

> A small guide for a human or AI agent joining the MIA repository.

## Start here

Read these in order:

1. `README.md` for what MIA is
2. `AGENTS.md` for workspace rules
3. `docs/core/architecture.md` for the runtime structure
4. `docs/core/skills-index.md` for the current CLI surface
5. the relevant workflow or reference document for the task

Do not start by reading the entire repository. Find the smallest context that lets you make a correct change.

## First local run

```bash
bun install
bun run build
bun test
```

Then inspect the CLI:

```bash
bun run dev
```

or:

```bash
bun run core/cli/index.ts --help
```

## Repository shape

```text
MIA/
├── core/
│   ├── cli/          # command entry point
│   ├── config/       # local config and overrides
│   ├── generator/    # documentation generation
│   ├── hosts/        # host adapters
│   ├── skills/       # executable skills
│   ├── state/        # JSONL and unified state
│   └── test/         # current tests
├── docs/             # project documentation
├── .husky/           # commit/push hooks
├── AGENTS.md         # canonical agent guidance
├── CLAUDE.md         # alias
├── GEMINI.md         # alias
└── README.md         # public entry point
```

## Make your first change

Start from the actual problem.

```text
grill → plan → spec → execute → review → ship
```

For a small documentation or maintenance change, use judgement and keep the scope narrow.

## Before opening a PR

Run the relevant checks:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Use a Conventional Commit message, for example:

```text
docs(readme): align documentation with current runtime
```

## When you learn something

Do not leave the knowledge trapped in the conversation.

Put it in the right place:

| What changed | Where it belongs |
| :--- | :--- |
| Reusable agent rule | `AGENTS.md` |
| Architecture decision | `docs/decisions/` |
| Architecture behaviour | `docs/core/architecture.md` |
| Workflow rule | `docs/workflows/` |
| Test/review practice | `docs/reference/` |
| Historical context | `docs/archive/` |

## Current-source rule

When documentation and source disagree, verify the source before updating anything.

For the executable CLI, `core/cli/index.ts` and `core/skills/index.ts` are the runtime truth.

Some older documents describe earlier MIA designs or broader agent ecosystems. They are useful as history, but they are not evidence that the current CLI implements those ideas.

---

*Read enough to understand. Change little. Verify everything that matters.*