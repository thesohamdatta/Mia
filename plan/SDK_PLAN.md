# SDK Plan — Architecture Improvement Agent

> Built via the `/agent-builder` workflow, using the repo's MIA `/plan` skill as the planning authority.
> MIA plan (source): `Run de2a52bc` / `Work work_8c5b6c50` → `/home/openhands/.mia/projects/Mia/PLAN.md`

## 1. Objective

Build a single-file Python agent on the **OpenHands Software Agent SDK** that improves a
codebase's architecture. Given a repository path, the agent:

1. Detects architectural problems (coupling, duplication, dead code, boundary violations,
   oversized modules, unclear module responsibilities).
2. Backs every finding with **evidence** gathered from real read-only analysis of the repo
   (commands run + file:line references), never from model confidence alone.
3. Produces a prioritized, MIA-aligned **refactoring plan** (small, deep modules; explicit
   boundaries; reversible, evidence-driven changes) saved to disk.

The agent is **analysis-only by default**: it does not rewrite the target repository. It
emits an evidence-backed plan an engineer (or a follow-up execution agent) can act on.

## 2. Requirements Summary (interview outcome)

| Dimension | Decision |
| :--- | :--- |
| Purpose | Improve codebase architecture (analysis + refactoring plan) |
| Target | Any local repository supplied as a CLI argument |
| Output | `ARCHITECTURE_REPORT.md` + prioritized `REFACTOR_PLAN.md` in an output dir |
| Autonomy | Read-only analysis; no source mutation (safe default) |
| Evidence | Mandatory: findings must cite command output / file:line |
| Model default | `openhands/claude-sonnet-4-5-20250929` (env `LLM_BASE_MODEL`) |
| Runtime | `python output/architecture_agent.py <repo> [--out DIR]`, venv, terminal logging |

## 3. OpenHands SDK Building Blocks Used

Grounded in `temp/software-agent-sdk/examples/01_standalone_sdk` and `temp/docs/sdk`:

| SDK concept | Import | Use in this agent |
| :--- | :--- | :--- |
| `LLM` | `openhands.sdk` | Configure model + `LLM_API_KEY` / `LLM_BASE_MODEL` / `LLM_BASE_URL`; structured + condenser usage ids |
| `Agent` | `openhands.sdk` | Main architecture agent; `agent_context` for skills; `condenser` for long analysis runs |
| `AgentContext` + `Skill` / `KeywordTrigger` | `openhands.sdk.context` | Inject MIA architecture rubric; always-on `architecture-rubric` skill |
| `Conversation` + `LocalWorkspace` | `openhands.sdk` / workspace | Run the agent read-only against the target repo |
| `TerminalTool` | `openhands.tools.terminal` | Discover structure, metrics (LOC, fan-in/out, duplication, dead-code candidates) |
| `FileEditorTool` (read mode) | `openhands.tools.file_editor` | Read files to confirm findings; write report/plan into the *output* dir only |
| `TaskTrackerTool` | `openhands.tools.task_tracker` | Agent self-tracks analysis phases |
| `LLMSummarizingCondenser` | `openhands.sdk.context.condenser` | Keep the long repo-analysis conversation within budget |
| `get_logger` | `openhands.sdk` | Terminal-visible structured logging |

Reference examples:
- `01_hello_world.py` — minimal LLM/Agent/Conversation/Tool wiring.
- `02_custom_tools.py` — tool sets / custom tools (extension point for a metrics tool).
- `03_activate_skill.py` — `AgentContext(skills=[...])`, keyword triggers, `load_public_skills`.
- `14_context_condenser.py` — `LLMSummarizingCondenser(max_size, keep_first)`.
- `24_planning_agent_workflow.py` — plan → artifact on disk → consume plan.

## 4. Architecture

```
CLI (argparse)
  │  repo path, --out, --focus, --max-rounds
  ▼
Config loader ── validates LLM_API_KEY, resolves model (LLM_BASE_MODEL/LLM_BASE_URL)
  ▼
LLM (main) + LLM (condenser, usage_id="condenser")
  ▼
Agent
  ├── tools: Terminal, FileEditor, TaskTracker
  ├── agent_context:
  │      skills=[ architecture-rubric (trigger=None),  --> always in system prompt
  │                refactor-planning (KeywordTrigger) ] --> injected on demand
  │      system_message_suffix: evidence + MIA-principles contract
  └── condenser: LLMSummarizingCondenser
  ▼
Pipeline (deterministic phases, each a Conversation.run())
  P0 RECON        → inventory: languages, dirs, LOC, entrypoints
  P1 SIGNALS      → collect raw metrics (coupling, duplication, file sizes, dead code)
  P2 ANALYSIS     → map signals to MIA rubrics + boundary violations, with evidence
  P3 PRIORITIZE   → score by impact/risk/effort; order smallest reversible slices first
  P4 REPORT       → write ARCHITECTURE_REPORT.md
  P5 PLAN         → write REFACTOR_PLAN.md (MIA success-criteria shape)
  ▼
Artifacts: <out>/ARCHITECTURE_REPORT.md, <out>/REFACTOR_PLAN.md
```

### Design decisions
- **Read-only safety.** The target repo is mounted read-only in spirit: the prompt contract
  forbids edits there; the agent writes only under `--out` (default `./architecture-review/`).
- **Evidence gate.** Every finding must include a `## Evidence` block: the exact command(s)
  run and observed output, or `file:line` citation. Findings without evidence are dropped.
- **MIA alignment.** The rubric maps MIA principles (`docs/core/principles.md`,
  `CONTEXT.md`) onto measurable heuristics, so output is reviewable by the MIA workflow.
- **Determinism where possible.** Recon/signal phases use fixed shell commands; the LLM
  interprets rather than invents structure.
- **Single file.** All logic in `output/architecture_agent.py`; no package split.

## 5. Detection Rubric

| Signal | Heuristic | MIA principle |
| :--- | :--- | :--- |
| High coupling | fan-in/out, import cycles, cross-boundary imports | explicit boundaries, small deep modules |
| Duplication | repeated blocks (>N similar lines) / copy-paste clusters | clarity, single ownership |
| Dead code | unreferenced exports/functions/files | remove, don't accumulate |
| Oversized modules | files/functions above LOC/complexity thresholds | small, deep modules |
| Boundary violations | layering breaks (e.g. CLI → store directly) | explicit contracts |
| Unclear ownership | multiple stores/registries/engines for one concern | single ownership |

Thresholds are configurable constants at the top of the file (documented, not magic).

## 6. CLI & Configuration

```bash
python output/architecture_agent.py <repo-path> [--out DIR] [--focus coupling,deadcode] [--max-rounds N]
```

| Env var | Meaning | Default |
| :--- | :--- | :--- |
| `LLM_API_KEY` | Provider key (required) | — (must be set) |
| `LLM_BASE_MODEL` | Model name | `openhands/claude-sonnet-4-5-20250929` |
| `LLM_BASE_URL` | Optional custom base URL | unset |

## 7. Success Criteria

- [ ] `python output/architecture_agent.py --help` runs with no SDK import error in a
      prepared venv.
- [ ] With `LLM_API_KEY` set, runs end-to-end against a sample repo and writes both
      artifacts.
- [ ] Every finding in `ARCHITECTURE_REPORT.md` contains an `Evidence` section.
- [ ] `REFACTOR_PLAN.md` follows MIA shape: Objective, Success Criteria, Steps, Risks,
      Out of Scope.
- [ ] Terminal logs at each phase; no mutation of the target repo.

## 8. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| LLM hallucinates findings | Evidence gate; recon commands fixed |
| Long runs exceed context | `LLMSummarizingCondenser` |
| SDK version drift | Install `openhands-sdk` + `openhands-tools` together (matched versions) |
| Analyzer edits target repo | Prompt contract + `--out` isolation; recommend read-only mount |

## 9. Out of Scope

- Automatic application of refactors (execution agent is a future phase).
- Multi-repo / remote (Docker sandbox) execution.
- CI integration / PR creation.

## 10. Open Items for the User

1. Confirm delivery of `output/architecture_agent.py` (single file) after this plan.
2. Provide `LLM_API_KEY` (or approve using the environment's `OPENHANDS_API_KEY`) before running.
3. Confirm the default output dir name `architecture-review/`.
