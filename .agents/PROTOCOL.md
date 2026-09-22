# Multi-Agent Coordination Protocol

## Pipeline Sequence

```
SENTRY → PULSE → MAINTAINER → ORCHESTRATOR
```

- **SENTRY**: First quality-control agent. Verifies correctness, safety, testability, eliminates AI slop, enforces architecture and type safety.
- **PULSE**: System health & metric monitoring agent. Evaluates runtime health and benchmark trends.
- **MAINTAINER**: Repository maintainer. Handles dependency hygiene, documentation alignment, and structural refactoring.
- **ORCHESTRATOR**: High-level task coordinator and dispatch agent.

## Governing Rules

1. **Stage Locks**: Check `state.json` before starting work. If the current stage is locked or conflicting work exists, halt.
2. **Sequential Handoffs**: Every agent must record a compact, structured handoff record in `.agents/handoffs/` after execution.
3. **Branching**: Never modify `main`/`master` directly. Work on dedicated feature/review branches and submit PRs.
4. **Memory Promotion Model**:
   - **OBSERVATION**: Unverified incident seen during execution.
   - **LESSON**: Observation verified as useful through evidence.
   - **RULE**: Reliable lesson elevated to govern future behavior.

## Shared Handoff Contract Schema

```json
{
  "agent": "<agent-name>",
  "task": "<task-id>",
  "objective": "<objective description>",
  "scope": ["<path>"],
  "files_changed": ["<path>"],
  "verification": ["<check: result>"],
  "findings": [],
  "decisions": [],
  "uncertainty": [],
  "next_agent": "<next-agent-or-human>",
  "status": "complete"
}
```
