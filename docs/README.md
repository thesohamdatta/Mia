# MIA documentation

MIA is an engineering harness around AI-assisted software development. These docs explain how to run it, how its parts fit together, and how to change it without inventing behaviour that the code does not provide.

Start with the task you came here to complete.

## Start here

| I want to… | Read |
|---|---|
| Install and run MIA | [Getting started](getting-started.md) |
| Understand the main workflow | [A first workflow](guides/first-workflow.md) |
| Understand the system design | [Architecture](core/architecture.md) |
| Find available commands | [Skills and commands](core/skills-index.md) |

## Understand MIA

- [Architecture](core/architecture.md) — the CLI execution path, skill boundary, host boundary, and local persistence.
- [Engineering principles](../PRINCIPLES.md) — the short, reader-facing statement of MIA's principles.
- [Design philosophy](core/design-philosophy.md) — simplicity, depth, and evolvability.
- [Glossary](core/glossary.md) — terms used throughout the project.

## Use and troubleshoot

- [Skills and commands](core/skills-index.md) — registered skills and their responsibilities.
- [Configuration](reference/configuration.md) — active runtime configuration and the `MIA_DIR` state root.
- [Testing and verification](reference/testing-strategy.md) — the checks the repository actually defines.

## Contribute

- [Contribution guide](workflows/contributing.md) — setup, changes, commits, and pull requests.
- [Review standards](reference/review-standards.md) — correctness, architecture, tests, and documentation expectations.
- [ADR-0001: Direct skill execution](decisions/ADR-0001-eliminate-daemon.md) — why the daemon was removed.
- [Documentation writing standard](reference/documentation-style.md) — how to keep future pages clear and accurate.
- [Documentation review checklist](reference/documentation-review-checklist.md) — a final pass before opening a pull request.

## How to read these docs

Each page should answer one clear question. Guides focus on a task; concept pages explain a system or decision; reference pages define current behaviour. We keep the navigation shallow and link to canonical sources instead of duplicating the same explanation in multiple places.

## Source of truth

When a claim matters, check it against this order:

1. Executable code and tests establish current behaviour.
2. Accepted architecture decisions explain intentional choices.
3. Documentation explains those sources for people.

MIA is under active development, so commands and implementation details can change. The docs should say what has been verified, not what merely sounds plausible.
