# Hermes Agent Analysis — Skills, Cron, Delegation Patterns

> **Source:** Hermes Agent (this platform). The user's daily driver — skills system, CLI, daemon, cron, delegation, toolsets.

---

## Overview

Hermes is a local-first AI assistant with a **skill system**, **persistent daemon**, **cron jobs**, **delegation/subagents**, and **toolset management**. It's the environment MIA runs in.

---

## Core Architecture

### 1. Skill System
**Location:** `~/.hermes/skills/` (per-profile)

**Skill Structure:**
```
skill-name/
├── SKILL.md          # YAML frontmatter + markdown body
├── references/       # Reference docs
├── templates/        # Template files
├── scripts/          # Executable scripts
└── assets/           # Images, data files
```

**SKILL.md Frontmatter:**
```yaml
---
name: skill-name
description: One-line trigger + behavior (first 57 chars critical)
category: devops|data-science|mlops|...
---
```

**Loading:** `skill_view(name)` → loads SKILL.md + linked files
**Listing:** `skills_list()` → name + description index

### 2. Toolsets
**Configurable tool groups** to reduce token overhead:
- `web` — browser, search, extract
- `terminal` — shell, process, file ops
- `file` — read, write, search, patch
- `delegation` — delegate_task, process
- `memory` — memory, session_search
- `cron` — cronjob management

**Per-job toolset restriction:** `enabled_toolsets: ["web", "terminal"]`

### 3. Cron Jobs
**Scheduler with delivery:**
```yaml
schedule: "0 9 * * *"  # daily 9am
prompt: "Self-contained task instruction"
skills: ["skill1", "skill2"]
deliver: "origin" | "local" | "all" | "platform:chat_id:thread_id"
attach_to_session: true  # conversational recurring jobs
context_from: [job_id]   # chain jobs
no_agent: true           # script-only (watchdog pattern)
```

**Delivery:** Auto to origin chat, or fan-out to Telegram/Discord/Slack/Email

### 4. Delegation / Subagents
**Two modes:**
- **Single:** `goal` + `context` + `role`
- **Batch:** `tasks[]` (up to 50 parallel)

**Roles:**
- `leaf` (default) — focused worker, cannot delegate
- `orchestrator` — can spawn workers (nesting OFF by default)

**Live transcripts:** `cache/delegation/live/<delegation_id>/task-0.log`

**Constraints:**
- Subagents have NO memory of parent conversation
- Must pass all context via `context` field
- Leaf agents cannot use: `delegate_task`, `clarify`, `memory`, `send_message`
- Background only — not durable across session close

### 5. Memory System
**Two stores:**
- `user` — who the user is (preferences, style, role)
- `memory` — agent notes (environment, conventions, lessons)

**Batch operations:** Atomic multi-add/replace/remove with char budget
**Injected every turn** — keep compact and high-signal

### 6. Session Search
**FTS5-backed conversation history:**
- Discovery: `query="topic"` → top sessions with snippets
- Scroll: `session_id` + `around_message_id` → window
- Read: `session_id` → full session
- Browse: no args → recent sessions

**Link format:** `@session:default/20260722_204335_d62c16`

### 7. Profiles
**Isolated environments:** `~/.hermes/profiles/<name>/`
- Each has own: skills/, plugins/, cron/, memories/
- Active profile: `default` (this session)

---

## Patterns Worth Adopting for MIA

### 1. Skill Frontmatter + Markdown Body
- Machine-parseable metadata (triggers, category, tools)
- Human-readable documentation in same file
- Version-controlled, portable

### 2. Toolset Restriction per Task
- Reduces token overhead significantly
- Explicit capability declaration
- Security boundary

### 3. Cron Job Chaining
- `context_from` links upstream job output
- `attach_to_session` for conversational jobs
- `no_agent` for watchdog scripts

### 4. Delegation with Live Transcripts
- Append-only logs for debugging
- Background execution with result aggregation
- Role-based capability restriction

### 5. Profile Isolation
- Clean separation of concerns
- Per-project or per-purpose profiles
- No cross-contamination

### 6. Session Search as Knowledge Base
- FTS5 over conversation history
- Bookend + window reconstruction
- Linkable session references

---

## Gaps / Limitations for MIA

| Issue | MIA Consideration |
|-------|-------------------|
| Skills loaded per-session | MIA needs persistent daemon skill cache |
| No skill hot-reload | MIA could add filesystem watcher |
| Cron delivery only to chat | MIA needs local file output option |
| Subagents not durable | MIA needs persistent background agents |
| Single-profile active | MIA could support multi-profile daemon |

---

## MIA Integration Ideas

1. **Adopt SKILL.md format** — Use for MIA skills (already similar)
2. **Toolset restriction** — Apply to skill `allowedTools` field
3. **Cron-inspired scheduler** — For MIA's background tasks
4. **Delegation patterns** — For MIA's subagent/spawn system
5. **Session search** — For MIA's conversation memory
6. **Profile isolation** — For MIA's project/context separation

---

## References

- Hermes docs: https://hermes-agent.nousresearch.com/docs
- Skill authoring guide: `hermes-agent-skill-authoring` skill
- This session's profile: `default` at `~/.hermes/profiles/default/`

---

*Part of MIA Research: 01-foundational-engineering/hermes-analysis.md*