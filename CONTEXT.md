# Context Engineering

Context is a limited engineering resource. This document defines how to manage it effectively.

## Context Budget Allocation

```
Context Budget (typical 100-200K tokens):
├── System Prompt (principles, identity)     ~2-5 KB
├── Task Definition                          ~1-3 KB
├── Relevant Skills (progressive disclosure) ~5-20 KB
├── Codebase Context (targeted)              ~10-50 KB
├── Conversation History (compressed)        ~5-15 KB
└── Working Memory (scratchpad)              ~2-5 KB
```

## Context Hygiene Rules

1. **Remove stale context before adding new** — Don't let old context pollute new tasks.
2. **Compress conversation history** — Summarize, don't truncate. Keep decisions and outcomes, drop intermediate steps.
3. **Never include unrelated skills/agents** — Only load what's relevant to current task.
4. **Use references/ for deep content** — Load on demand via progressive disclosure.
5. **Global context stays stable** — CLAUDE.md, PRINCIPLES.md, AGENTS.md change rarely.
6. **Task-specific knowledge is ephemeral** — Load via skills, discard after task.

## Progressive Disclosure Architecture

### Tier 1: Always Loaded (Global Context)
- CLAUDE.md — Constitutional principles (~500 tokens)
- AGENTS.md — Workspace conventions (~1000 tokens)
- PRINCIPLES.md — Timeless engineering laws (~2000 tokens)
- **Total: ~3500 tokens**

### Tier 2: Loaded on Skill Activation
- SKILL.md navigation + quick-start (~2-5 KB per skill)
- Only skills relevant to current task
- **Typical: 1-3 skills = 5-15 KB**

### Tier 3: Loaded on Demand
- references/ details.md, api-reference.md, examples/
- assets/ templates, configs, scaffolding
- Codebase context via targeted search (grep, LSP, not full files)
- **Variable: 10-50 KB as needed**

## Token Optimization Strategies

| Strategy | Description | Savings |
|----------|-------------|---------|
| **Skill references/** | Push detail out of SKILL.md body | 50-80% reduction |
| **Targeted code search** | grep/LSP instead of reading full files | 90%+ reduction |
| **Conversation compression** | Summarize history, keep decisions only | 60-80% reduction |
| **Explicit skill triggers** | Only load skills that declare "Use when..." | Prevents bloat |
| **Reference linking** | Link to docs instead of copying content | Eliminates duplication |

## Context Window Management

### For Long-Running Sessions
- Periodic `/context-save` to persist git state, decisions, remaining work
- `/context-restore` to resume with full context
- Daily memory files (`memory/YYYY-MM-DD.md`) for raw logs
- MEMORY.md for curated long-term wisdom

### For Multi-Agent Workflows
- Parent agent holds minimal context
- Subagents receive only task-relevant context
- Results returned as structured summaries, not full transcripts
- Event-driven coordination (not context passing)

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Context bloat** | Loading unrelated skills/docs | Explicit triggers, progressive disclosure |
| **Stale context** | Old decisions contaminating new work | Regular context saves, explicit clears |
| **Truncation loss** | Cutting history loses decisions | Compress/summarize instead |
| **Duplication** | Same info in multiple places | Single source of truth, link don't copy |
| **Implicit context** | Assumptions not stated | Explicit context in task definition |

## Context Budget Monitoring

Track approximate token usage:
```
echo "System: ~4K | Skills: ~10K | Code: ~20K | History: ~10K | Working: ~5K = ~49K"
```

If approaching 80% of window: compress history, drop unused skills, save context.

## Memory Management (from OpenClaw)

### Daily Notes (`memory/YYYY-MM-DD.md`)
- Raw logs of what happened
- Decisions made, context, things to remember
- Skip secrets unless asked to keep them

### Long-Term Memory (`MEMORY.md`)
- Load only in main session (direct chats)
- Significant events, thoughts, decisions, opinions, lessons learned
- Distilled essence, not raw logs
- Periodically review daily files and fold into MEMORY.md

### Write It Down Protocol
- "Mental notes" don't survive session restarts; files do
- Before writing: read first, then write concrete updates only
- Someone says "remember this" → update daily notes or relevant file
- You learn a lesson → update AGENTS.md, CONTEXT.md, or relevant skill
- You make a mistake → document it so future-you doesn't repeat it