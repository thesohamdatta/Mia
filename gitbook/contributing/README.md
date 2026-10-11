# Contributing

Contributions should be focused, reviewable, and backed by appropriate verification.

## Development setup

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
bun install
```

The integration branch is `master`. Use a short-lived branch and open a pull request against `master`.

## Suggested workflow

1. Clarify the problem and expected outcome.
2. Keep changes focused.
3. Add or update tests and documentation when behaviour changes.
4. Run relevant checks locally.
5. Open a pull request with a clear summary and evidence.
6. Address review feedback and confirm final checks.

Use [Conventional Commits](https://www.conventionalcommits.org/) where practical, for example `feat(cli): add a command`, `fix(state): handle an invalid event`, or `docs: clarify installation`.

See [Testing and verification](testing-and-verification.md).