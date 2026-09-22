<p align="center">
  <img src="./docs/assets/mia-ascii.png" alt="MIA ASCII" width="540" />
</p>

<h1 align="center">MIA</h1>

<p align="center">
  <strong>Machine Intelligence Architecture</strong><br />
  <em>My local-first AI engineering OS for thinking clearly, building carefully, and shipping with evidence.</em>
</p>

<p align="center">
  <a href="#why-mia">Why MIA</a> &bull;
  <a href="#how-it-works">How it works</a> &bull;
  <a href="#commands">Commands</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#development">Development</a>
</p>

---

## why mia

I built MIA because writing code is no longer the scarce part of software engineering.

The scarce part is keeping the work coherent.

When an AI agent can produce a thousand lines before anyone has agreed on the problem, speed becomes a liability. MIA is the engineering harness I use to put structure around that process.

The idea is simple:

> **think first → make the work explicit → execute → verify → learn → repeat**

MIA is deliberately local-first and boring in the places where boring is useful. It is a compiled Bun CLI, its state lives on disk, and the core execution path does not need a long-running daemon or an HTTP control plane.

The model can change. The workflow should not have to.

---

## what i care about

MIA is built around a few principles that keep showing up in the code:

- **clarity before implementation** — understand the problem before touching the code.
- **verification over confidence** — a green check is more useful than a convincing paragraph.
- **small, deep modules** — simple interfaces with the complexity pushed underneath.
- **human control** — agents can help execute, but important decisions stay explicit.
- **memory that compounds** — useful context should survive the current terminal session.
- **local by default** — project state is stored locally as files rather than hidden behind another service.

That gives me a system that is less about “ask an LLM to code” and more about engineering the environment in which AI-assisted development happens.

---

## how it works

MIA's main development loop is:

```text
intent
  ↓
grill
  ↓
plan
  ↓
spec
  ↓
execute
  ↓
review
  ↓
ship
  ↓
learn
  ↺
```

### grill

I start by clarifying the actual problem, assumptions, risks, scope, and definition of done.

### plan

I turn the agreed intent into a concrete plan with verifiable success criteria.

### spec

I can turn the intent into a PRD-shaped specification and break the work into smaller issues.

### execute

Skills run directly in the CLI process. There is no daemon sitting between the command and the skill executor.

### review

The review skill is the deterministic pre-landing verification step. It reports executable evidence; human review remains responsible for architecture, security, maintainability, and product decisions.

### ship

The shipping gate is:

```text
verify → review → ship gate
```

The current `ship` implementation verifies the repository and reports whether the handoff is unblocked. It does not push, merge, or create a pull request.

### learn

MIA keeps project-level events in an append-only JSONL store. Learnings, timeline events, and checkpoints share the same event stream.

This is the part I care about most: the system should get better because previous work was recorded, not because I have to remember everything again tomorrow.

---

## commands

The current CLI is intentionally small:

| Command | What I use it for |
| :--- | :--- |
| `mia grill` | Clarify a non-trivial task before implementation |
| `mia plan` | Create a verifiable implementation plan |
| `mia spec` | Turn intent into a PRD-style spec and issues |
| `mia review` | Run the pre-landing review workflow |
| `mia health` | Inspect code-quality checks and shipping readiness |
| `mia ship` | Start the test → review → push → PR workflow |
| `mia learn` | List or add project learnings |
| `mia retro` | Review recent activity and accumulated learnings |
| `mia memory` | Read or append long-term memory |
| `mia checkpoint` | Save, list, or load working state |
| `mia vc` | Work with git status, commits, branches, tags, releases, and hooks |

Run:

```bash
mia --help
```

for the command surface compiled into the current version.

---

## architecture

MIA is a direct execution system.

```text
┌─────────────────────────────────────────────────────────┐
│                         MIA                             │
│                                                         │
│  CLI → Context → Middleware → Skill Executor            │
│                         │                               │
│                         ├── Config                      │
│                         ├── UnifiedStore               │
│                         └── local files                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

The important boundaries are:

**CLI**

`core/cli/` parses commands and dispatches them to the skill map.

**Execution context**

`core/context.ts` carries the current working directory, project slug, local configuration, and shared `UnifiedStore`.

**Skills**

`core/skills/` contains the executable workflows. The current map includes core workflow skills, learning and memory skills, review and health workflows, and version-control operations.

**Middleware**

`core/skills/preamble.ts` provides a small composable middleware chain. It can warn when I am outside a git repository, load recent learnings, and log timeline activity around skill execution.

**State**

`core/state/unified-store.ts` stores learning, timeline, checkpoint, and verification evidence events in per-project `events.jsonl` files.

### local state

By default MIA keeps its local state under:

```text
~/.mia/
├── memory.md
├── skills/
├── projects/
│   └── <project-slug>/
│       └── events.jsonl
└── sessions/
```

The project slug is derived from the git repository root. Outside a git repository, MIA falls back to `default`.

There is no daemon in the current architecture. No `miad`. No HTTP hop in the normal CLI path. Just the process you started and the files it owns.

---

## configuration

The current CLI uses `MIA_DIR` to choose the local state root, defaulting to `~/.mia`. The remaining runtime paths are derived from that root.

```text
MIA_DIR
```

The repository also contains a broader `core/config/ConfigLoader` with JSON and environment override support, but that loader is not currently wired into `createExecutionContext()`. I treat it as transition/compatibility code rather than advertising it as the current CLI configuration contract.

Some legacy daemon-related settings still exist in the configuration schema for compatibility. They are not part of the normal daemon-free execution path.

---

## development

I keep the development toolchain intentionally light:

- **Runtime:** Bun
- **Language:** TypeScript
- **Validation:** TypeScript, Biome, Knip, markdownlint, documentation sync checks
- **Tests:** Bun test
- **Git workflow:** Husky + Conventional Commits
- **State:** JSONL + Markdown

### clone and build

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia

bun install
bun run build
```

### run locally

```bash
bun run dev
```

or invoke the CLI entry point directly:

```bash
bun run core/cli/index.ts grill
```

### quality checks

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run lint:md
bun run validate:frontmatter
```

The repository also uses pre-commit and pre-push checks through Husky.

---

## documentation

I keep the documentation split by purpose rather than dumping everything into one giant README.

| Path | Purpose |
| :--- | :--- |
| `AGENTS.md` | Canonical workspace and agent instructions |
| `CLAUDE.md` | Agent-entry alias pointing to `AGENTS.md` |
| `GEMINI.md` | Agent-entry alias pointing to `AGENTS.md` |
| `PRINCIPLES.md` | Short entry point for the engineering principles |
| `docs/core/` | Architecture, context, principles, and design philosophy |
| `docs/workflows/` | Development and contribution workflows |
| `docs/reference/` | Testing, review, voice, and reference material |
| `docs/skills/` | Skill-facing documentation |
| `docs/decisions/` | Architecture decision records |
| `docs/archive/` | Historical material kept for traceability |

The repository includes a documentation synchronization script because stale documentation is still a bug. Humans just tend to ship that bug more politely.

---

## design philosophy

I keep coming back to three words:

> **simple. deep. evolvable.**

**Simple** means removing unnecessary machinery.

**Deep** means keeping the surface easy to use while the implementation handles the hard parts underneath.

**Evolvable** means making changes without forcing the whole system to be rewritten.

For MIA, that shows up as a small CLI surface, modular skills, a shared event store, explicit architecture decisions, and verification built into the development loop.

---

## project status

MIA is an actively evolving engineering project.

The current repository is versioned as `0.3.0`. The foundation is stable enough for continued development, while higher-level ideas are still evolving, especially around richer agent orchestration, deeper evaluation, and broader integrations.

I would rather keep that visible than pretend the project is finished.

---

## licence

MIT