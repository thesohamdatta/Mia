# Testing and verification

MIA treats verification as evidence, not ceremony. Run the narrowest useful checks while iterating, then broaden the gate before integration.

## Repository checks

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
bun run build
```

Choose checks based on the affected surface, then run the broader relevant suite before handoff.

## Review versus verification

- **Automated verification** provides repeatable evidence: tests, type checks, lint, build, and related checks.
- **Review** evaluates design, security, correctness, maintainability, and product intent that a green check cannot establish by itself.
- **Handoff** summarizes changes, checks run, and remaining uncertainty.

Do not claim a check passed unless it was actually run and observed.