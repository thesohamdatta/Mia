# Contributing to MIA

Thank you for contributing! This guide helps you get started quickly.

## Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/mia.git
cd mia
bun install

# Configure git (one-time)
git config --local include.path ../.gitconfig
```

## Git Workflow (GitHub Flow)

We use **GitHub Flow** - simple, practical, and designed for continuous deployment.

### Branching
- **main** - always deployable, protected
- **feature/*** - new features, short-lived
- **fix/*** - bug fixes, short-lived
- **docs/*** - documentation updates
- **refactor/*** - code improvements
- **chore/*** - maintenance tasks

### Workflow
1. Create branch from `main`: `git checkout -b feature/my-feature`
2. Make changes with small, focused commits
3. Push branch: `git push -u origin feature/my-feature`
4. Open Pull Request against `main`
5. CI runs (tests, lint, type-check, build)
6. Code review (1 approval required)
7. Squash and merge to `main`
8. Delete branch locally and remotely

## Commit Messages (Conventional Commits)

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding/correcting tests |
| `chore` | Build, tools, maintenance |
| `build` | Build system, dependencies |
| `ci` | CI configuration |
| `revert` | Revert previous commit |

### Examples
```bash
feat(cli): add --json output flag
fix(core): correct store event query limit
docs: update installation guide
refactor(skills): simplify executor logic
test: add config parser tests
chore: upgrade typescript to 5.5
```

### Breaking Changes
Add `!` after type/scope and include `BREAKING CHANGE:` in footer:
```bash
feat(cli)!: change default output format

BREAKING CHANGE: default output is now JSON instead of text
```

## Code Quality Gates

All checks must pass before merge:

| Check | Command | Runs On |
|-------|---------|---------|
| Lint & Format | `bun run lint:check` | pre-commit, CI |
| Type Check | `bun run typecheck` | pre-commit, CI |
| Unused Code | `bun run knip` | pre-commit, CI |
| Tests | `bun test` | pre-push, CI |
| Build | `bun run build` | pre-push, CI |

### Local Development
```bash
# Run all checks manually
bun run lint:check
bun run typecheck
bun run knip
bun test
bun run build
```

## Pull Request Guidelines

### Before Opening
- [ ] Branch is up to date with `main`
- [ ] All checks pass locally
- [ ] Commit messages follow Conventional Commits
- [ ] No WIP/fixup commits (squash them)

### PR Template
Fill out the PR template:
- Clear description of changes
- Link related issues
- List testing done
- Check all applicable boxes

### Review Process
- Self-review first
- Request review from maintainer
- Address feedback in new commits (not force-push unless needed)
- Squash commits on merge

## Code Style

- **Language**: TypeScript (strict mode)
- **Formatter/Linter**: Biome (configured in `biome.json`)
- **No `any`** unless absolutely necessary
- **Explicit types** for public APIs
- **Small, focused functions**
- **Meaningful names** over comments

## Project Structure

```
core/
  cli/        # CLI entry point and commands
  skills/     # Executable skill modules
  state/      # UnifiedStore, jsonl-store
  config/     # Schema, loader, paths
  hosts/      # Host adapters
tests/        # Integration and unit tests
scripts/      # Build/generation scripts
docs/         # Documentation tree
```

## Getting Help

- Check existing issues and PRs
- Read `AGENTS.md` and `PRINCIPLES.md`
- Ask in discussions or open an issue

---

**Remember**: Simple, Deep, Evolvable. Keep it simple. Build only what is necessary. Test in real life, learn quickly, iterate based on evidence.
