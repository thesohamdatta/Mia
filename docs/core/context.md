# Context Engineering

Context is a limited engineering resource. MIA treats it as part of the system design rather than an unlimited scratchpad.

## Current context layers

```text
1. Workspace rules     → AGENTS.md / PRINCIPLES.md
2. Task context        → the current request and constraints
3. Relevant docs       → focused architecture/workflow/reference pages
4. Code context        → targeted files and symbols
5. Project memory      → ~/.mia/memory.md + events.jsonl
```

Load only the layer needed for the task. More context is not automatically better context.

## Progressive disclosure

Prefer this order:

1. Read the narrowest relevant entry point.
2. Follow links to focused reference material.
3. Inspect implementation only when behaviour needs verification.

Do not copy the same architectural truth into several documents. Link to the canonical source.

## Project-aware context

MIA derives a project slug from the current git repository root.

```text
git repository → <project-slug>
no git repository → default
```

Project events are stored in:

```text
~/.mia/projects/<project-slug>/events.jsonl
```

Long-term memory is stored in:

```text
~/.mia/memory.md
```

## Context hygiene

- Remove stale assumptions before adding new ones.
- Prefer targeted reads to entire repository dumps.
- Record decisions that need to survive the current session.
- Do not treat generated or historical documents as runtime truth without checking their source.

## Agent handoff

When handing work to another agent or another session, leave:

- the current objective
- constraints and non-goals
- files already changed
- verification already performed
- remaining uncertainty

A small, explicit handoff beats a giant transcript.

## Verification

Context itself should not be used as evidence for code behaviour.

Use the implementation and repository checks to verify claims:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run build
```

---

*Context is a budget. Spend it where it reduces uncertainty.*