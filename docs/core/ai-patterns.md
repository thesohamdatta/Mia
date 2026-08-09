# AI Engineering Patterns

Layer 2 — Changes over years. AI-specific patterns, failure modes, and evaluation strategies.

---

## AI Failure Modes (from GPT CONVERSATION research)

| Failure Mode | Description | Mitigation |
|--------------|-------------|------------|
| **Hallucination** | Plausible but wrong outputs | Evaluation gates, citation requirements, verification layers |
| **AI Slop** | Low-quality, generic, boilerplate output | Style guides, ruthless testing, human review gates |
| **Overconfidence** | Definitive answers when uncertain | Explicit uncertainty statements, "I don't know" protocol |
| **Hidden Assumptions** | Implicit premises not stated | Assumption registers, explicit context, AskUserQuestion |
| **Premature Implementation** | Coding before understanding | Intent Gate (Phase 0), mandatory design phase |
| **Context Bloat** | Loading irrelevant context | Progressive disclosure, explicit triggers, budget monitoring |
| **Prompt Injection** | Malicious input hijacking behavior | Input validation, sandboxing, harness isolation |
| **Tool Misuse** | Wrong tool, wrong parameters | Tool allowlists, skill-based tool routing, verification |
| **Stale Documentation** | Context/docs drift from reality | Automated doc generation, regular audits, ADR linkage |
| **Contradictory Instructions** | Conflicting rules in context | Single source of truth, lint for conflicts |
| **Duplication** | Repeated knowledge across files | DRY enforcement, centralized principles |
| **Unverifiable Claims** | Assertions without evidence | Evidence requirements, citation protocols |
| **Excessive Autonomy** | Acting beyond delegated scope | Explicit permission scopes, escalation paths |
| **Poor Human Communication** | Terse, unclear, unhelpful responses | Communication standards, WISDOM audience analysis |

---

## Evaluation-Driven Development (EDD)

**Core Principle**: Define success criteria before building. Evaluation is not a phase — it's a continuous architectural concern.

### Evaluation Layers (from claude-agents plugin-eval)

| Layer | Speed | Cost | What It Measures |
|-------|-------|------|------------------|
| **Static Analysis** | <2s | Free | Structure, portability, anti-patterns, token efficiency |
| **LLM Judge** | ~30s | 4 calls | Triggering accuracy, orchestration fitness, output quality, scope calibration |
| **Monte Carlo** | ~2min | 50-100 calls | Activation rate, output consistency, failure rate, token efficiency |

### Evaluation Depths

| Depth | Layers | Confidence | Time | Cost |
|-------|--------|------------|------|------|
| `quick` | Static only | Estimated | <2s | Free |
| `standard` | Static + Judge | Assessed | ~30s | 4 LLM calls |
| `deep` | Static + Judge + MC (50) | Certified | ~3min | ~54 calls |
| `thorough` | Static + Judge + MC (100) | Certified+ | ~6min | ~104 calls |

### Quality Dimensions (10)

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Triggering Accuracy | 25% | Does description fire for right prompts? |
| Orchestration Fitness | 20% | Composable worker, not orchestrator? |
| Output Quality | 15% | Would it produce correct, useful output? |
| Scope Calibration | 12% | Well-sized for its domain? |
| Progressive Disclosure | 10% | Uses references/ for large content? |
| Token Efficiency | 6% | Concise without repetition? |
| Robustness | 5% | Handles varied inputs reliably? |
| Structural Completeness | 3% | Headings, code, examples? |
| Code Template Quality | 2% | Production-ready examples? |
| Ecosystem Coherence | 2% | Links to related skills/agents? |

### Quality Badges

| Badge | Score | Elo | Meaning |
|-------|-------|-----|---------|
| Platinum | ≥90 | ≥1600 | Reference quality |
| Gold | ≥80 | ≥1500 | Production ready |
| Silver | ≥70 | ≥1400 | Functional, needs polish |
| Bronze | ≥60 | ≥1300 | Minimum viable |

---

## Agent Architecture Patterns

### Single Responsibility Agents
- Each agent does one thing well (Unix philosophy)
- Clear, focused purposes (describable in 5-10 words)
- Average agent size: focused and purposeful
- Zero bloated agents

### Composable Workflows
- Orchestrators coordinate, workers execute
- Pre-configured agent workflows for complex operations
- Mix and match agents based on needs

### Progressive Disclosure for Skills
```
Tier 1: Metadata (Frontmatter) — Always loaded
Tier 2: Instructions — Loaded when activated  
Tier 3: Resources — Loaded on demand
```

### Portable Agent Content
- Source of truth: Markdown + YAML frontmatter
- Adapters handle harness-specific transforms
- No harness-conditional logic in source content

### Model Tiering Strategy

| Tier | Model | Use Case |
|------|-------|----------|
| 1 | Fable / Opus | Architecture, security, code review, production coding |
| 2 | Inherit | Complex tasks — user chooses model |
| 3 | Sonnet | Docs, testing, debugging, support |
| 4 | Haiku | Fast ops, SEO, deployment, simple tasks |

**Hybrid Orchestration**:
```
Planning (Sonnet/Opus) → Execution (Haiku) → Review (Sonnet/Opus)
```

---

## Context Engineering Patterns

### Layered Documentation
- **Global**: Enduring principles (CLAUDE.md, PRINCIPLES.md)
- **Local**: Domain specifics (skills/, references/)
- **Ephemeral**: Session state (memory/, working context)

### Progressive Disclosure
- Load detail on demand, not pre-injected
- Skill SKILL.md body ≤ 8 KB (Codex cap)
- references/ for deep content
- assets/ for templates

### Token Efficiency
- Every token has opportunity cost
- Targeted search over full-file reads
- Conversation compression over truncation

---

## Human-AI Collaboration Model

### AI as Engineering Collaborator
- Not an autonomous decision maker
- Reason transparently (show work, state assumptions)
- Highlight uncertainty explicitly
- Explain trade-offs, not just recommendations
- Escalate when information insufficient
- Defer to human on: architecture, irreversible decisions, business outcomes, security

### Communication Standards
- Be concise. Be precise.
- Separate facts from opinions.
- Separate observations from recommendations.
- Explain **why** decisions are made.
- Prefer clarity over verbosity.

---

## Verification Layers

```
Lint → Unit → Integration → Eval → Canary → Production
  ↓        ↓         ↓         ↓        ↓         ↓
Static   Deterministic  Contract  Semantic  Live    Real
Analysis  Logic       Verification  Quality  Traffic  Users
```

**Gate Criteria**: Each layer must pass before advancing. No skipping.

---

## AI-Specific Anti-Patterns

| Anti-Pattern | Detection | Remediation |
|--------------|-----------|-------------|
| **One-shotting** | Trying to do everything in one pass | Mandatory phased workflow (Intent → Design → Implement) |
| **Cold-start amnesia** | Each run forgetting previous context | Context save/restore, MEMORY.md, daily notes |
| **Wish-granting genie** | Hallucinating perfect-but-wrong code | Evaluation gates, verification layers, human review |
| **Cargo-cult code** | Generic defaults filling blanks | Explicit requirements, assumption registers |
| **Working-memory rot** | Long contexts degrading critical facts | Context budgets, progressive disclosure, compression |
| **Local-optima decisions** | Locally sensible, globally breaking | Architectural review gates, decision hierarchy |
| **Mis-synchronized agents** | Sub-agents losing state | Event-driven coordination, structured handoffs |
| **Summary-only handoff** | Losing nuance in agent communication | Structured result objects, not prose summaries |

---

## Harness Engineering (from OpenAI)

> "The harness is more important than the model."

**Harness Components**:
- **Prompts**: System prompts, skill instructions, few-shot examples
- **Tools**: Function definitions, permissions, sandboxing
- **Sandboxes**: Isolated execution environments
- **Guardrails**: Validation, evaluation, safety checks
- **Observability**: Logging, tracing, metrics, alerting
- **Memory**: Context management, retrieval, persistence

**Principle**: Engineering the 90% surrounding infrastructure (sandboxes, observability, eval) rather than just the model's raw intelligence.

---

## Model Configuration

### Never Use Dated Model IDs
- ❌ `claude-sonnet-4-6-20250514`
- ✅ `claude-sonnet-5` (alias)

### Model Aliases (Portable)
| Source | Maps To |
|--------|---------|
| `opus` | Top available Opus-class |
| `sonnet` | Top available Sonnet-class |
| `haiku` | Top available Haiku-class |
| `inherit` | User-chosen at runtime |

Adapters handle per-harness mapping. Source content stays portable.

---

## References

- *AI Engineering* — Chip Huyen
- claude-agents Architecture & Plugin-Eval
- Anthropic Cookbook / OpenAI Cookbook
- GPT CONVERSATION research (AI_FAILURE_MODES.md)
- Google SRE / Amazon Builders Library
- DSPy, LangGraph, LlamaIndex, LangChain patterns