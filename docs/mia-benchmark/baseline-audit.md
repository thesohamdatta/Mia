# Baseline Audit

## Mia
Repository: thesohamdatta/Mia on master.

### Current documented lifecycle
README documents intent/grill/plan/spec/execute/review/ship/learn plus health, retro, memory, checkpoint, and VC-related helpers.

### Current implementation evidence
The CLI entry point dispatches skills through core/cli/index.ts and getSkillExecutor(). Skill directories currently exist for grill, plan, spec, review, ship, health, learn, retro, memory, checkpoint, and vc.

### State architecture
core/state/unified-store.ts defines learning, timeline, and checkpoint events and appends them to per-project events.jsonl files. README and AGENTS.md describe this local-first state model.

### Agent guidance
AGENTS.md requires clarify-before-coding, explicit human approval, smallest useful changes, and verification before claims.

### Testing
docs/reference/testing-strategy.md lists tests, typecheck, lint, Knip, markdown checks, frontmatter validation, and build. The current CI workflow runs these supported checks on the master integration branch.

### CI
The CI discrepancy identified in the original baseline has been resolved. The current workflow targets master, uses supported package scripts, uses a single repository validation job, pins the Bun runtime through package.json, and keeps pull-request title validation separate within the same workflow.

### Recent development history
Recent MIA commits include performance work on JSONL tail queries and git-root lookup, a documentation alignment pass, and coordination-state/Jules protocol changes. Recent Jules PRs include #23, #24, and #25, all focused on performance improvements.

## Mia-Lens
Repository: thesohamdatta/Mia-Lens on main.

README states the product is a local-first project intelligence cockpit inspired by MIA, using Bun/TypeScript/Vite and deterministic sample data. Recent commit history shows the MVP was populated through multiple file commits, including workflow, event parsing, tests, UI, and CI.

## Aura
Repository: thesohamdatta/aura on main.

Recent history shows active website and architecture maintenance. Existing issues include deterministic visual-quality checks, image loading verification, accessibility work, and architecture cleanup opportunities.

## Status
This baseline establishes the benchmark target. It does not itself prove end-to-end model quality, because repository inspection is evidence of implementation/state, not evidence of model reasoning under task conditions.
