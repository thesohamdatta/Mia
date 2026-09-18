# MIA Review Standards

Code review exists to catch incorrect assumptions before they become durable code.

## Review order

Review in this order:

1. correctness and behaviour
2. architecture and boundaries
3. maintainability and clarity
4. tests and verification
5. security-sensitive behaviour
6. scope and documentation

## Correctness

- Trace the affected code, not just the diff.
- Check empty, invalid, and failure cases.
- Make errors visible and actionable.
- Verify that the implementation matches the documented contract.

## Architecture

- Keep CLI, context, middleware, skills, state, config, and host adapters separated.
- Do not reintroduce HTTP or a daemon just to make local execution look more sophisticated.
- Prefer deep modules and explicit interfaces.
- Record significant one-way architectural decisions in an ADR.

## Maintainability

- Keep the change focused.
- Use intention-revealing names.
- Avoid speculative abstractions.
- Comments should explain why, not restate what the code already says.
- Do not duplicate the same source of truth across code and docs.

## Testing

Match the test to the behaviour:

| Behaviour | Evidence |
| :--- | :--- |
| Pure deterministic logic | focused unit test |
| Skill + state interaction | integration test |
| CLI journey | end-to-end test when justified |
| Documentation contract | markdown/link/frontmatter validation |

Do not require a test layer that the behaviour does not need.

## Security and local state

- Never commit secrets.
- Treat external content as untrusted input.
- Preserve local user state.
- Review filesystem writes and shell commands carefully.
- Keep the JSONL sanitisation boundary intact unless the change explicitly addresses it.

## Documentation

Update documentation when a change affects:

- user-visible commands
- architecture
- configuration
- state layout
- workflows
- contribution or review rules

README claims should match current source. Deeper docs should link to canonical decisions rather than carrying old implementations forward.

## Review completion

Before approving a change, verify the evidence that matters:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run build
```

Add documentation validation when Markdown changed.

---

*Review the system that exists, not the system you wish existed.*