# .agents — Multi-Agent Coordination & Shared State

This directory serves as the durable repository-local system of record for multi-agent coordination in MIA.

## Directory Structure

```
.agents/
├── README.md           # Directory overview
├── PROTOCOL.md         # Multi-agent coordination protocol & pipeline rules
├── state.json          # Current pipeline state, active stage, and lock status
├── handoffs/           # Sequential structured agent handoff records
├── findings/           # Quality control findings database
├── learnings.jsonl     # Typed cross-agent learnings & rules
└── quality.json        # Repository quality metrics & health tracking
```

## Multi-Agent Pipeline

1. **SENTRY** (Quality Control & Code Guardian)
2. **PULSE** (System Health & Metric Monitoring)
3. **MAINTAINER** (Repository Architecture & Refactoring)
4. **ORCHESTRATOR** (Task Execution & Workflow Dispatch)
