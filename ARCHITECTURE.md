# Architecture

This document explains **why** the EKB is built the way it is. For commands, see CLAUDE.md. For contributing, see CONTRIBUTING.md.

## Core Idea

The EKB gives AI agents a persistent engineering knowledge base with structured workflows. The knowledge base is the hard part — everything else is Markdown.

The key insight: an AI agent doing engineering work needs **instant access to principles** and **deterministic workflows**. If every task requires re-researching fundamentals, you waste context and time. If principles aren't codified, agents drift into cargo-cult patterns.

```
User Request                    EKB System
─────────                      ──────────
                               ┌──────────────────┐
  "Build a payment system"     │  CLAUDE.md       │  ← Constitutional principles
  ─────────────────────────→   │  AGENTS.md       │  ← Workspace conventions
                               │  PRINCIPLES.md   │  ← Timeless engineering laws
                               │  DECISION.md     │  ← Decision framework
                               │  WORKFLOW.md     │  ← Process & verification
                               │  SKILL.md        │  ← Available capabilities
                               │  ARCHITECTURE.md │  ← System design patterns
                               │  DESIGN.md       │  ← UI/design patterns
                               │  AI.md           │  ← AI-specific patterns
                               └──────────────────┘
```

First task: ~30s context load. Every task after: principles already in context.

## Why This Structure

### Single Responsibility Per File

| File | Responsibility |
|------|----------------|
| CLAUDE.md | Constitutional layer — mission, beliefs, decision hierarchy |
| AGENTS.md | Workspace conventions, memory, session management |
| PRINCIPLES.md | Timeless engineering laws (Layer 1 — decades) |
| ARCHITECTURE.md | System design patterns, component boundaries |
| DESIGN.md | Design system, UI patterns, visual language |
| WORKFLOW.md | Development process, verification gates |
| SKILL.md | Available skills, commands, triggers |
| DECISION.md | Decision framework, ADR template |
| CONTEXT.md | Context engineering, token budgets, progressive disclosure |
| AI.md | AI engineering patterns, failure modes, evaluation |
| REVIEW.md | Code review standards, quality gates |
| TESTING.md | Testing strategy, verification layers |
| GLOSSARY.md | Shared vocabulary |

### Layered Knowledge (OSI-style Stack)

```
Layer 1: Timeless Engineering          (PRINCIPLES.md)
    ↓ never changes
Layer 2: AI Engineering Patterns       (AI.md, CONTEXT.md)
    ↓ changes over years
Layer 3: Tool-Specific Patterns        (SKILL.md, WORKFLOW.md)
    ↓ changes over months
Layer 4: Project Knowledge             (memory/, project/)
    ↓ changes continuously
```

**Rule**: Never let a lower layer dominate a higher one. Tool-specific guidance never overrides timeless principles.

## Architecture Principles

### 1. Plugin Architecture (from gstack/claude-agents)

```
Core System (CLAUDE.md + AGENTS.md)
    │
    ├── Skill: planning      (office-hours, spec, plan-*)
    ├── Skill: review        (review, codex, investigate)
    ├── Skill: implementation (qa, design-*, devex-review)
    ├── Skill: release       (ship, land-and-deploy, canary)
    ├── Skill: operations    (context-save, learn, retro, health)
    └── Skill: browser       (browse, scrape, skillify)
```

Each skill is independently versioned and deployable. No skill depends on another's internals. Communication via well-defined triggers.

### 2. Adapter Pattern for Multi-Harness

Source content stays portable; adapters own mechanics.

```
Source (Markdown + YAML)
    │
    ▼
┌─────────────────────────────┐
│      Adapter Framework      │
│  ┌─────┬─────┬─────┬─────┐  │
│  │Claud│Codex│OpenC│Gemi │  │
│  │ e   │    │ ode │ ni  │  │
│  └──┬──┴──┬──┴──┬──┴──┬──┘  │
│     │     │     │     │     │
│     ▼     ▼     ▼     ▼     │
│  CLAUDE  .codex .openc  .   │
│  .md     /    /agent   skills│
└─────────────────────────────┘
```

**Invariants**:
- Source content never contains harness-conditional logic
- Adapters are the ONLY place harness-specific code lives
- Generated artifacts committed for native install

### 3. Progressive Disclosure

```
Skill Structure:
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

**Token Budget**:
- SKILL.md body: ≤ 8 KB (Codex hard cap)
- Total skill (with references): No hard limit, prefer < 50 KB

## System Design Patterns

### Pattern 1: Single-Purpose Skill

```
planning/
├── office-hours.md      # Reframe product idea before code
├── spec.md              # Turn vague intent into executable spec
├── plan-ceo-review.md   # CEO-level review: find 10-star product
├── plan-eng-review.md   # Lock architecture, data flow, tests
└── plan-design-review.md # Rate design dimensions 0-10
```

**Benefits**: Clear responsibility, easy maintenance, minimal tokens, composable.

### Pattern 2: Workflow Orchestration

```
autoplan.md              # Runs: CEO → design → eng → DX review
ship.md                  # Tests → review → push → PR → CI → deploy
```

Orchestrators coordinate multiple skills. Workers execute single tasks.

### Pattern 3: Skill + Tool Integration

```
User: "Build payment system with Stripe"
    ↓
spec.md (orchestrates)
    ↓
design-consultation.md (provides patterns)
    ↓
qa.md (browser test against real Stripe)
    ↓
ship.md (tests, review, deploy)
```

### Pattern 4: Multi-Skill Composition

```
Feature Development:
1. spec → plan-ceo-review → plan-eng-review
2. qa → design-review → devex-review  
3. review → codex → investigate
4. ship → land-and-deploy → canary
5. document-release → document-generate
```

## AI System Architecture

### Evaluation-Driven Architecture

```
┌─────────────────────────────────────────────┐
│           EVALUATION LAYER                  │
├─────────────────────────────────────────────┤
│  Static Analysis (Layer 1)  →  <2s, free   │
│  LLM Judge (Layer 2)        →  ~30s, eval  │
│  Monte Carlo (Layer 3)      →  ~2min, stat │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           APPLICATION LAYER                 │
├─────────────────────────────────────────────┤
│  Skills (Reasoning)  │  Knowledge  │ Commands│
│  - Specialized       │  - Progressive│  - Slash│
│  - Model-optimized   │    disclosure │    cmds │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           INFRASTRUCTURE LAYER              │
├─────────────────────────────────────────────┤
│  Model Router    │  Context Manager │ Tools │
│  (tiered models) │  (token budgets) │(sandbox)│
└─────────────────────────────────────────────┘
```

### Model Tiering Strategy

| Tier | Model | Use Case |
|------|-------|----------|
| 1 | Opus / Fable | Architecture, security, code review, production coding |
| 2 | Inherit | Complex tasks — user chooses model |
| 3 | Sonnet | Docs, testing, debugging, support |
| 4 | Haiku | Fast ops, SEO, deployment, simple tasks |

**Hybrid Orchestration**:
```
Planning (Sonnet/Opus) → Execution (Haiku) → Review (Sonnet/Opus)
```

## Data Architecture

### Context as First-Class Resource

```
Context Budget Allocation:
├── System Prompt (principles, identity)     ~2-5 KB
├── Task Definition                          ~1-3 KB
├── Relevant Skills (progressive disclosure) ~5-20 KB
├── Codebase Context (targeted)              ~10-50 KB
├── Conversation History (compressed)        ~5-15 KB
└── Working Memory (scratchpad)              ~2-5 KB
```

**Context Hygiene Rules**:
- Remove stale context before adding new
- Compress conversation history (summarize, don't truncate)
- Never include unrelated skills/agents
- Use references/ for deep content — load on demand

### Knowledge Base Architecture

```
Engineering Knowledge Base (EKB)
├── principles/           # Timeless engineering principles
│   └── PRINCIPLES.md
│
├── architecture/         # Architectural patterns & decisions
│   ├── ARCHITECTURE.md
│   └── adr/              # Individual ADRs
│
├── ai-engineering/       # AI-specific patterns
│   ├── AI.md
│   ├── CONTEXT.md
│   └── EVALUATION.md
│
├── workflows/            # Development workflows
│   ├── WORKFLOW.md
│   ├── SKILL.md
│   └── DECISION.md
│
└── reference/            # Source mappings & glossary
    ├── GLOSSARY.md
    └── SOURCES.md
```

## Service Architecture Patterns

### Bounded Contexts for AI Systems

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Reasoning      │   │  Knowledge      │   │  Execution      │
│  Service        │   │  Service        │   │  Service        │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ - Agent         │   │ - Skill Store   │   │ - Tool          │
│   Orchestration │   │ - RAG Pipeline  │   │   Execution     │
│ - Planning      │   │ - Embeddings    │   │ - Sandbox       │
│ - Model Routing │   │ - Retrieval     │   │ - Code Gen      │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Context Gateway    │
                    │  (Token Budget,     │
                    │   Progressive      │
                    │   Disclosure)       │
                    └─────────────────────┘
```

### Event-Driven Skill Coordination

```python
# Event types
class SkillEvent(Enum):
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    CONTEXT_NEEDED = "context.needed"
    HUMAN_ESCALATION = "human.escalation"

# Skill publishes events, orchestration subscribes
# No direct skill-to-skill calls
```

## Infrastructure Architecture

### Local-First Development with CI Parity

```
Local Development          CI Pipeline
┌─────────────────┐       ┌─────────────────┐
│ bun test        │       │ bun test        │
│ bun run test:evals│     │ bun run test:evals│
└─────────────────┘       └─────────────────┘
         │                        │
         └──────────┬─────────────┘
                    ▼
         ┌─────────────────────┐
         │   Identical         │
         │   Tool Versions     │
         │   (bun lockfile)    │
         └─────────────────────┘
```

### Generated Artifact Management

```
Source (Authored)              Generated (Committed)
├── skills/                        ├── .claude/skills/
│   ├── planning/                      ├── gstack-planning/
│   ├── review/                        ├── gstack-review/
│   └── ...                            └── ...
└── marketplace.json             └── .agents/plugins/marketplace.json
```

**Rules**:
- Never hand-edit generated files
- `bun run build` before committing source changes
- CI fails on drift

## Architectural Anti-Patterns

| Anti-Pattern | Detection | Remediation |
|--------------|-----------|-------------|
| God Skill | >15 components, multiple domains | Split into focused skills |
| Harness logic in source | `if codex:` in markdown | Move to adapter |
| Missing ADR | Significant decision undocumented | Write ADR before implementing |
| Context pollution | Unrelated skills loaded | Progressive disclosure |
| Model misuse | Haiku for architecture, Opus for formatting | Follow tiering strategy |
| Tight skill coupling | Direct skill-to-skill calls | Event-driven coordination |
| Untested generation | No `bun test` in CI | Add validation gate |

## Decision Checklist

Before any architectural change, verify:

- [ ] ADR written for significant decisions
- [ ] Single responsibility maintained
- [ ] Adapter pattern respected (no harness logic in source)
- [ ] Progressive disclosure used for context-heavy components
- [ ] Model tiering followed
- [ ] Evaluation strategy defined
- [ ] Generated artifacts will be committed
- [ ] `bun test` passes locally
- [ ] No new anti-patterns introduced