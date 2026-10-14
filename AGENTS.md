MIA is a local-first Bun and TypeScript CLI for structured, evidence-driven AI-assisted software engineering.

This repository uses **Bun**. Check `package.json` for the available scripts.

- Build: `bun run build`
- Typecheck: `bun run typecheck`
- Tests: `bun test`
- Markdown and documentation validation: `bun run lint:md` and `bun run validate:frontmatter`

For the task at hand, inspect the current source and tests, then load only the relevant guidance:

- Project vocabulary: [CONTEXT.md](CONTEXT.md)
- Architecture and engineering principles: [docs/core/architecture.md](docs/core/architecture.md), [docs/core/principles.md](docs/core/principles.md)
- Context and agent design: [docs/core/context.md](docs/core/context.md), [docs/core/agent-engineering.md](docs/core/agent-engineering.md)
- Skills and their executable responsibilities: [docs/core/skills-index.md](docs/core/skills-index.md)
- Task workflow: [docs/workflows/](docs/workflows/) and [docs/workflows/grill-to-ship.md](docs/workflows/grill-to-ship.md)
- Tests and review: [docs/reference/testing-strategy.md](docs/reference/testing-strategy.md), [docs/reference/review-standards.md](docs/reference/review-standards.md)
- Evidence and verification claims: [docs/reference/evidence.md](docs/reference/evidence.md)
- Multi-agent coordination, only when coordinating agents: [.agents/PROTOCOL.md](.agents/PROTOCOL.md)

Prefer executable code and tests over stale prose. Preserve unrelated work, keep changes focused, and do not introduce duplicate owners, stores, registries, or execution engines. Match verification to the change and report only checks that actually ran.
