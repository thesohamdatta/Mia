# MIA Research Plan — Deep Research for Machine Intelligence Architecture

> **Goal:** Comprehensive, organized research to inform MIA's design, architecture, and philosophy. One subagent, deep research, organized output.

---

## Research Areas

### 1. Foundational Engineering & Architecture
- **gstack** — Bun compiled binaries, persistent daemon, SQLite state, skill templates, host adapters
- **OpenClaw** — Agent orchestration, tool use, planning loops
- **Hermes Agent** — Skills system, CLI, daemon, cron, delegation, toolsets
- **Claude Code / Codex / OpenCode** — Agent CLI patterns, session management, tool integration
- **Unix philosophy** — Small sharp tools, composability, text streams
- **Plan 9 / 9front** — Everything is a file, network transparency
- **Erlang/OTP** — Actor model, supervision trees, fault tolerance
- **SQLite** — Embedded DB patterns, WAL mode, concurrency

### 2. AI Agent Architecture & Harness Design
- **Agent harness vs model** — Scaffolding enables reliable behavior
- **Context engineering** — Context as limited resource, window management, compression
- **Memory systems** — Short-term (session), long-term (vector/SQLite), episodic, semantic
- **Tool use patterns** — Function calling, structured output, validation loops
- **Planning & execution** — ReAct, Plan-and-Execute, Tree of Thoughts, self-reflection
- **Multi-agent orchestration** — Delegation, supervision, consensus, handoff
- **Evaluation & guardrails** — Deterministic verification, evals, circuit breakers

### 3. Human-Computer Interaction & "Her"-Inspired Design
- **Samantha (Her)** — Presence, emotional intelligence, growth through relationship, proactive engagement, vulnerability
- **Conversational UI patterns** — Natural language, context awareness, personality consistency
- **Ambient computing** — Always-on, background presence, proactive notifications
- **Trust & anthropomorphism** — Calibrated trust, uncanny valley, transparency
- **Long-term relationship design** — Memory, continuity, inside jokes, evolution

### 4. Software Craft & Simplicity
- **Deep modules** — Simple interface, rich implementation (Ousterhout)
- **Information hiding** — Parnas, bounded contexts, anti-corruption layers
- **Design by contract** — Pre/post conditions, invariants
- **Refactoring** — Continuous improvement, strangler fig, reversible decisions
- **Verification over confidence** — Types, tests, property-based, formal methods
- **Maximum value per line** — Signal density, claritymaxxing

### 5. Personal Knowledge & Learning Systems
- **Obsidian / Zettelkasten** — Linked notes, graph view, daily notes, templates
- **EKB (Engineering Knowledge Base)** — Markdown-first, agent-ready, structured
- **Learning loops** — Capture → Distill → Apply → Reflect
- **Retrospectives** — Timeline + learnings, pattern recognition

### 6. Books to Read / Reference
| Book | Why |
|------|-----|
| *A Philosophy of Software Design* (Ousterhout) | Deep modules, complexity |
| *Designing Data-Intensive Applications* (Kleppmann) | State, consistency, durability |
| *The Pragmatic Programmer* (Hunt/Thomas) | Craft, automation, tracer bullets |
| *Structure and Interpretation of Computer Programs* | Abstraction, interpretation |
| *Domain-Driven Design* (Evans) | Bounded contexts, ubiquitous language |
| *Release It!* (Nygard) | Resilience, circuit breakers, ops |
| *Staff Engineer* (Fournier) | Architecture, influence, strategy |
| *Working in Public* (Eghbal) | Open source sustainability |
| *The Design of Everyday Things* (Norman) | Affordances, mental models |
| *Thinking in Systems* (Meadows) | Feedback loops, leverage points |

### 7. Video / Talk Deep Dives
- **Rich Hickey** — Simple Made Easy, Hammock Driven Development, Value of Values
- **Bryan Cantrill** — Systems programming, debugging, operators
- **John Ousterhout** — Deep modules, complexity
- **Martin Kleppmann** — Local-first, CRDTs, data-intensive apps
- **Casey Muratori** — Performance, compression, craft
- **Jonathan Blow** — Engine design, simplicity, long-term thinking
- **Garry Tan / YC** — Speed, quality, build what people want
- **Spike Jonze / Her** — Relationship design, AI personality

### 8. Historical / Wayback Research
- **Early AI agents** — SHRDLU, ELIZA, PARRY, Cyc, SOAR, ACT-R
- **Classic OS papers** — Multics, Unix, Plan 9, Lisp Machines, Smalltalk
- **Agent architectures** — BDI, Belief-Desire-Intention, subsumption, blackboard
- **Personal computing vision** — Engelbart, Kay, Nelson, Nelson's Xanadu
- **Wayback targets:** Early gstack repos, Hermes evolution, OpenClaw history, Bun RFCs

### 9. Modern Projects to Study
| Project | Focus |
|---------|-------|
| **Bun** | Compiled binaries, runtime, package manager |
| **SQLite / libSQL** | Embedded DB, replication, WASM |
| **Rust / Tauri** | Native performance, system integration |
| **Electron / Tauri / Wails** | Desktop app patterns |
| **LangChain / LangGraph / AutoGen** | Agent frameworks (learn what NOT to do) |
| **Ollama / llama.cpp** | Local inference, model management |
| **Ray / Dask** | Distributed compute, actors |
| **Temporal / Hatchet** | Durable execution, workflows |

### 10. Markdown & Knowledge Representation
- **CommonMark / GFM** — Spec compliance, extensions
- **Frontmatter / YAML** — Metadata, schema validation
- **Markdoc / MDX** — Components in markdown
- **Obsidian flavor** — Wikilinks, dataview, canvas, plugins
- **Agent-ready markdown** — Structured, parseable, semantic

---

## Research Methodology

### Phase 1: Broad Survey (Week 1)
- [ ] Clone/scan gstack, OpenClaw, Hermes repos
- [ ] Watch 5-10 key talks (Hickey, Ousterhout, Cantrill, Kleppmann)
- [ ] Read 3-5 core books (Ousterhout, Kleppmann, Evans)
- [ ] Map concept space — create taxonomy

### Phase 2: Deep Dives (Week 2-3)
- [ ] Study each foundational project in detail
- [ ] Extract patterns, anti-patterns, decisions
- [ ] Read Her screenplay fully (done) — extract interaction patterns
- [ ] Wayback machine: trace evolution of key projects

### Phase 3: Synthesis (Week 3-4)
- [ ] Cross-reference patterns across domains
- [ ] Identify MIA-specific architectural decisions
- [ ] Write decision records (ADRs)
- [ ] Create reference implementations / spikes

### Phase 4: Living Knowledge Base
- [ ] Organize as Markdown in `research/` folder
- [ ] Link to EKB for long-term reference
- [ ] Update as MIA evolves

---

## Output Format

```
/research/
├── 01-foundational-engineering/
│   ├── gstack-analysis.md
│   ├── openclaw-analysis.md
│   ├── hermes-analysis.md
│   └── unix-erlang-patterns.md
├── 02-agent-architecture/
│   ├── harness-vs-model.md
│   ├── context-engineering.md
│   ├── memory-systems.md
│   ├── tool-use-patterns.md
│   └── multi-agent-orchestration.md
├── 03-human-inspiration/
│   ├── her-samantha-patterns.md
│   ├── conversational-ui.md
│   ├── ambient-computing.md
│   └── trust-design.md
├── 04-software-craft/
│   ├── deep-modules.md
│   ├── verification.md
│   ├── refactoring-patterns.md
│   └── simplicity-principles.md
├── 05-knowledge-systems/
│   ├── obsidian-patterns.md
│   ├── ekb-design.md
│   ├── learning-loops.md
│   └── markdown-for-agents.md
├── 06-books-notes/
│   ├── ousterhout-philosophy.md
│   ├── kleppmann-ddia.md
│   ├── evans-ddd.md
│   └── ...
├── 07-video-notes/
│   ├── hickey-simple-made-easy.md
│   ├── ousterhout-deep-modules.md
│   └── ...
├── 08-historical/
│   ├── early-agents.md
│   ├── classic-os.md
│   ├── personal-computing-vision.md
│   └── wayback-findings.md
├── 09-modern-projects/
│   ├── bun-analysis.md
│   ├── sqlite-patterns.md
│   ├── agent-frameworks-critique.md
│   └── ...
├── 10-synthesis/
│   ├── mia-architecture-decisions.md
│   ├── adrs/
│   ├── spikes/
│   └── open-questions.md
└── INDEX.md
```

---

## Success Criteria

- [ ] Every research area has ≥1 detailed markdown file
- [ ] Cross-references between related findings
- [ ] ADRs written for top 10 architectural decisions
- [ ] Spike implementations for 3-5 risky areas
- [ ] Research indexed and searchable from MIA
- [ ] Can answer "why this design?" for any MIA component

---

## Delegation

**Single subagent task:** Execute this entire research plan. Produce the `/research/` directory structure above with thorough, well-organized markdown files. Prioritize depth over breadth — but cover all areas. Use web search, GitHub exploration, Wayback Machine, video transcripts, book summaries. Store PDFs/references locally where possible.

**Context for subagent:** You're researching for MIA — a local, compiled Bun-based personal AI engineering OS. The user is an AI engineer building AURA on gstack patterns. Values: simple, deep, evolvable, verifiable, human-in-the-loop. Voice: warm, precise, engineer-first (see VOICE.md). Separation: EKB (knowledge) ≠ MIA (operational engine).