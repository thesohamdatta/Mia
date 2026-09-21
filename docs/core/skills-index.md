# Skills & Commands

Available skills and commands for the EKB system. Skills live in `.agents/skills/` (or `~/.claude/skills/ekb/` on Claude Code). Invoke by name (e.g., `/spec`).

## Core Workflow Skills (Grill-to-Ship)

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/brainstorming` | Generate and explore ideas before committing to direction | "brainstorm", "ideas", "explore options" |
| `/grilling` | Interview until shared context established (1-2 hrs) | "grill", "interview", "clarify requirements" |
| `/writing-plans` | Write verifiable plan with success criteria before implementing | "plan", "write plan", "planning" |
| `/to-prd` | Convert grill output to formal Product Requirements Doc | "prd", "product requirements" |
| `/to-issues` | Slice PRD into vertical, independently-shippable issues | "issues", "slice", "break down" |
| `/tdd` | Red → Green → Refactor. Write failing test FIRST. Always. | "tdd", "test driven", "write test first" |
| `/review` | Review all changes before committing | "review", "code review", "pr review" |
| `/verification-before-completion` | Verify before claiming done | "verify", "check done", "completion" |

## Planning & Strategy (gstack)

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/office-hours` | Start here. Reframes your product idea before you write code. | "office hours", "reframe", "product idea" |
| `/spec` | Turn vague intent into a precise, executable spec in five phases. Files GitHub issue, optionally spawns agent in fresh worktree. | "spec", "specification", "plan this" |
| `/plan-ceo-review` | CEO-level review: find the 10-star product in the request. | "ceo review", "product strategy" |
| `/plan-eng-review` | Lock architecture, data flow, edge cases, and tests. | "eng review", "architecture review", "technical review" |
| `/plan-design-review` | Rate each design dimension 0-10, explain what a 10 looks like. | "design review", "ux review" |
| `/plan-devex-review` | DX-mode review: TTHW, magical moments, friction points, persona traces. | "dx review", "developer experience" |
| `/plan-tune` | Self-tune AskUserQuestion sensitivity per question. | "tune questions", "question sensitivity" |
| `/autoplan` | One command runs CEO → design → eng → DX review. | "autoplan", "auto plan" |
| `/design-consultation` | Build a complete design system from scratch. | "design system", "design consultation" |

## Implementation & Review

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/codex` | Second opinion via OpenAI Codex. Review, challenge, or consult modes. | "codex", "second opinion" |
| `/investigate` | Systematic root-cause debugging. No fixes without investigation. | "investigate", "debug", "root cause" |
| `/design-review` | Live-site visual audit + fix loop with atomic commits. | "design review", "visual audit" |
| `/design-shotgun` | Generate multiple AI design variants, comparison board, iterate. | "design variants", "design shotgun" |
| `/design-html` | Generate production-quality HTML/CSS. | "design html", "generate html" |
| `/devex-review` | Live developer experience audit (TTHW measured against real flow). | "devex", "developer experience audit" |
| `/qa` | Open a real browser, find bugs, fix them, re-verify. | "qa", "quality assurance", "test this" |
| `/qa-only` | Same methodology as /qa but report only — no code changes. | "qa only", "report bugs" |
| `/scrape` | Pull data from a web page. First call prototypes; codified call runs in ~200ms. | "scrape", "extract data" |
| `/skillify` | Codify the most recent successful `/scrape` flow into a permanent browser-skill. | "skillify", "make skill" |

## Release & Deploy

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/ship` | Run tests, review, push, open PR. Workspace-aware version queue. | "ship", "create pr", "push" |
| `/land-and-deploy` | Merge the PR, wait for CI and deploy, verify production health. | "land", "deploy", "merge and deploy" |
| `/canary` | Post-deploy monitoring loop using the browse daemon. | "canary", "monitor deploy" |
| `/landing-report` | Read-only dashboard for the workspace-aware ship queue. | "landing report", "ship status" |
| `/document-release` | Update all docs to match what you just shipped. | "document release", "update docs" |
| `/document-generate` | Generate Diataxis docs (tutorial/how-to/reference/explanation) from code. | "generate docs", "document generate" |
| `/setup-deploy` | One-time deploy config detection (Fly.io, Render, Vercel, etc.). | "setup deploy", "configure deploy" |

## Operations & Memory

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/context-save` | Save working context (git state, decisions, remaining work). | "save context", "context save" |
| `/context-restore` | Resume from a saved context, even across workspaces. | "restore context", "context restore" |
| `/learn` | Manage what the system learned across sessions. | "learn", "learning", "knowledge" |
| `/retro` | Weekly retro with per-person breakdowns and shipping streaks. | "retro", "retrospective" |
| `/health` | Code quality dashboard (type checker, linter, tests, dead code). | "health", "code health", "quality dashboard" |
| `/benchmark` | Performance regression detection (page load, Core Web Vitals). | "benchmark", "performance" |
| `/benchmark-models` | Cross-model benchmark for skills (Claude, GPT, Gemini side-by-side). | "benchmark models", "model comparison" |
| `/cso` | OWASP Top 10 + STRIDE security audit. | "security audit", "cso", "owasp" |

## Browser & Agent Integration

| Skill | Description | Triggers |
|-------|-------------|----------|
| `/browse` | Headless browser — real Chromium, real clicks, ~100ms/command. | "browse", "open browser", "navigate" |
| `/open-browser` | Launch the visible browser with sidebar + stealth. | "open browser", "visible browser" |
| `/setup-browser-cookies` | Import cookies from your real browser for authenticated testing. | "browser cookies", "import cookies" |
| `/pair-agent` | Pair a remote AI agent (OpenClaw, Codex, etc.) with your browser. | "pair agent", "remote agent" |

---

## Skill Frontmatter Template

```yaml
---
name: skill-name
description: Use when [trigger phrase]. What the skill does.
version: 1.0.0
triggers:
  - trigger phrase
  - another trigger
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---
```

## Progressive Disclosure Structure

```
skills/skill-name/
├── SKILL.md              # Tier 1: Navigation + quick-start (always loaded)
│   ├── Frontmatter       # name, description with "Use when..."
│   ├── Quick Decision Tree
│   └── Links to references/
│
├── references/           # Tier 2: Deep content (loaded on demand)
│   ├── details.md
│   ├── api-reference.md
│   └── examples/
│
└── assets/               # Tier 3: Templates, configs (loaded by name)
    ├── config.template.ts
    └── scaffold/
```

**Token Budget:**
- SKILL.md body: ≤ 8 KB (Codex hard cap)
- Total skill (with references): No hard limit, prefer < 50 KB

## Portability Rules (from gstack/claude-agents)

1. **Talk about actions, not tools** — "Open the file" not "Use the Read tool"
2. **Respect Codex 8 KB skill body cap** — Push detail into references/
3. **Use globally unique skill names** — `ekb-planning-spec` not `spec`
4. **Don't collide with built-in names** — Avoid `default`, `worker`, `explorer`
5. **Avoid skill/command name collisions** — Pick distinct names within a skill
6. **Model aliases** — Use `inherit` for portability; adapters handle mapping