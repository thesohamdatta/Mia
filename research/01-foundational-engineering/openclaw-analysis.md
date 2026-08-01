# OpenClaw Analysis — Agent Orchestration Patterns

> **Source:** OpenClaw (open-source Claude Code alternative). Key patterns for agent orchestration, tool use, planning loops.

---

## Overview

OpenClaw is an open-source implementation of Claude Code's agent loop — planning, tool use, and execution in a ReAct-style loop.

---

## Core Architecture

### 1. Agent Loop (ReAct Pattern)
```
User Input → Plan → Tool Call → Observe → Reflect → (repeat) → Final Answer
```

**Key Components:**
- **Planner** — Breaks down task into steps
- **Executor** — Runs tools (bash, read, write, search, etc.)
- **Memory** — Conversation history + tool results
- **Reflector** — Evaluates progress, decides next action

### 2. Tool System
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (args: any) => Promise<ToolResult>;
}
```

**Built-in Tools:**
- `bash` — Shell commands with timeout, background support
- `read` / `write` / `edit` — File operations
- `glob` / `grep` — File search
- `task` — Subagent delegation
- `web_search` / `web_fetch` — Web research

### 3. Session Management
- **Conversation history** — Full transcript with tool calls/results
- **Context window management** — Summarization, truncation
- **Checkpointing** — Save/restore agent state
- **Branch/fork** — Explore alternative paths

### 4. Planning & Todo Tracking
```typescript
interface Todo {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}
```
- Single `in_progress` at a time
- User-visible progress
- Auto-updates on tool completion

---

## Patterns Worth Adopting for MIA

### 1. Structured Tool Results
```typescript
interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, any>;
}
```
- Consistent format for all tools
- Easy to feed back to LLM
- Metadata for debugging

### 2. Delegation (Subagents)
```typescript
async function delegate(task: string, context: string): Promise<string> {
  // Spawns isolated subagent with own context
  // Returns summary only (not full transcript)
}
```
- Parallel task execution
- Context isolation
- Summary aggregation

### 3. Background Processes
```typescript
interface BackgroundProcess {
  id: string;
  command: string;
  status: "running" | "completed" | "failed";
  output: string;
  notifyOnComplete: boolean;
}
```
- Long-running commands (servers, builds)
- Polling for output
- Completion notification

### 4. Context Budgeting
- Tier 1: Always included (system prompt, current task)
- Tier 2: Recent history (last N turns)
- Tier 3: Summarized older history
- Tier 4: On-demand retrieval (search, fetch)

---

## Gaps / Limitations

| Issue | Impact |
|-------|--------|
| No persistent daemon | Restart loses state |
| Single-process | No background/daemon separation |
| File-based skills only | No dynamic skill loading |
| No multi-user/tenant | Personal use only |
| Limited observability | Hard to debug agent loops |

---

## MIA Integration Ideas

1. **Adopt tool result format** — Standardize across all skills
2. **Subagent delegation** — Use for parallel research, code review
3. **Background process support** — For daemon, builds, watches
4. **Context tiering** — Apply to skill preamble system
5. **Session persistence** — SQLite-backed conversation history

---

## References

- OpenClaw GitHub: https://github.com/opencode-ai/opencode (or similar)
- ReAct paper: "ReAct: Synergizing Reasoning and Acting in Language Models"
- Anthropic's tool use docs: https://docs.anthropic.com/en/docs/tool-use

---

*Part of MIA Research: 01-foundational-engineering/openclaw-analysis.md*