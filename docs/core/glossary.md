---
title: "MIA glossary"
layer: 2
last_updated: "2026-10-10"
owner: documentation
---

# MIA glossary

A short reference for terms used in the MIA documentation and source code.

| Term | Meaning in MIA |
|---|---|
| **Agent host** | The environment that runs the model loop, routes tools, and manages the model session. MIA integrates around this host rather than replacing it. |
| **Capability grant** | A tool permission represented in an execution context. MIA checks the skill's declared requirements against those grants. |
| **Checkpoint** | A saved representation of working state that can be listed or loaded later. |
| **Evidence** | A recorded result or artifact that supports a claim about work or verification. |
| **Skill** | A named workflow registered in the CLI with a manifest and executor. |
| **UnifiedStore** | The local event-store interface used for project learning, timeline, checkpoint, verification, and approval events. |
| **Work** | A durable unit of engineering work created from a plan and advanced through the supported lifecycle. |
| **Verification** | A check or observation used to establish a bounded claim about behaviour or repository state. |
| **ADR** | Architecture Decision Record: a durable explanation of an accepted architectural decision and its trade-offs. |

Use a term consistently. If the implementation's meaning changes, update the source, tests, and relevant documentation together.
