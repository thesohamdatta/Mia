# AI Engineer Research Corpus

Status: research phase
Baseline: master @ f0a24827546fdf1ab25f4219d08902a018754f30
Production code changed: no
Implementation PRs created: no

## Purpose

This workspace captures research from the selected AI Engineer videos and maps the findings to Mia without turning the videos into implementation requirements.

Evidence chain:

Source → evidence → principle → repository observation → potential implication → validation

## Source handling

The official AI Engineer talk pages expose timestamped transcripts. Those pages are treated as the primary transcript source.

Full third-party transcripts are not copied into this repository. This workspace records:

- source URL
- transcript availability/status
- chapter and timestamp references
- concise evidence notes
- paraphrased technical findings
- repository applicability

This keeps the research reproducible without turning the repository into a transcript archive.

## Corpus

1. zCJtYuqwm7E — Coding Agents Don't Scale Themselves. Neither Do Your Teams. — Patrick Debois, Tessl
2. Ib5GBkD555M — Why Software Factories Fail — Dex Horthy, HumanLayer
3. v4F1gFy-hqg — Software Fundamentals Matter More Than Ever — Matt Pocock
4. Sir59K8ZDPU — Why Agentic Systems Need Ontologies — Frank Coyle, UC Berkeley
5. am_oeAoUhew — Harness Engineering: How to Build Software When Humans Steer, Agents Execute — Ryan Lopopolo, OpenAI
6. 8kMaTybvDUw — 12-Factor Agents: Patterns of reliable LLM applications — Dex Horthy, HumanLayer
7. HvboD89DyQ8 — No, That's Not a Software Factory — Ryan Cooke, WorkOS
8. TN3mj92oZ8I — How Software Factories Improve Themselves — Suraj Gupta, Warp
9. xs-ob87TTzg — Total Recall: Agent Memory and Harness Engineering — Ignacio Martinez, Oracle
10. fjF8EKnxKCU — Agents Without Code: Skills, YAML, and Filesystems Replaced Python — Philipp Schmid, Google DeepMind

## Verification status

All ten videos have an official AI Engineer talk page with a timestamped transcript surface and chapter structure. The research notes use those primary pages. Transcript text was analyzed at the cited sections rather than reproduced wholesale.

## Repository baseline

Mia is a local-first Bun CLI with a direct runtime path:

CLI → ExecutionContext → middleware → skill executor → UnifiedStore/local files

The repository explicitly treats runtime code as executable truth, keeps one owner per responsibility, uses evidence-bound completion, and treats context as a constrained resource.

## Active repository work considered during reconnaissance

Open PRs are treated as proposed work, not as current runtime truth:

- #102 refactor(core): tighten runtime boundaries
- #105 fix(maintainer): cycle-008 clean unused exports and update shared state
- #111 feat(agents): reconcile cycle-007 orchestrator handoff and update state

This distinction is important because the research baseline is master, not an unmerged branch.

## Additional corpus policy

No extra videos were added to the initial corpus. The selected ten already cover the most relevant themes: harness engineering, context, software-factory design, evaluation, memory, skills, reliability, domain constraints, and agent orchestration.
