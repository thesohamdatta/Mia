# MIA QA Acceptance

This is the project-level QA matrix for the current MIA CLI.

The automated repository suite is evidence for deterministic behaviour. This document covers the system-level journeys that must be checked before calling a release or MVP milestone complete.

## Current release posture

- Integration branch: `master`
- Runtime: Bun + TypeScript CLI
- Deployment model: local CLI, not a long-running service
- Current GitHub release: none
- Current release artifact: compiled `bin/mia`
- CI: required repository validation on `master`
- Real external host acceptance: still open in issue #100

There is no production server to monitor for MIA today. Release readiness is therefore about source integrity, CI, compiled CLI behaviour, local persistence, and real host invocation.

## Automated QA

Run:

```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run validate:frontmatter
bun run lint:md
bun run build
bun run verify:binary
```

The dedicated `core/test/repository-qa.test.ts` contract checks the public CLI, package/runtime alignment, verification catalog, architecture boundaries, agent surface, and current documentation claims.

## System QA matrix

| ID | Area | Test | Expected result | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| QA-01 | Install | Fresh checkout + `bun ci` | Dependencies install cleanly | CI log |
| QA-02 | CLI | `mia --help` | Help exits 0 and lists public commands | CLI output |
| QA-03 | CLI | `mia --version` | Version is printed and matches package version | CLI output |
| QA-04 | CLI error | Unknown command | Non-zero exit and actionable error | CLI output |
| QA-05 | Plan | `mia plan create "<objective>"` in a Git repo | Work + plan artifact created | artifact + timeline |
| QA-06 | Setup | `mia setup` in a fresh project | Claude/Codex public skill surfaces generated | generated files |
| QA-07 | Setup safety | Pre-existing unmanaged skill | Existing file is preserved | collision test |
| QA-08 | State | Plan/review/ship journey | State persists in one local event stream | `events.jsonl` |
| QA-09 | Review | Valid Work + passing checks | Work reaches `ready_to_ship` | Work state + evidence |
| QA-10 | Review failure | Failing verification | Work returns to `in_progress` | Work state + evidence |
| QA-11 | Ship | Verification passed, approval satisfied when required | Work reaches `shipped` | Work state + evidence |
| QA-12 | Ship safety | Missing/invalid approval | Ship is blocked | error + persisted evidence |
| QA-13 | Recovery | Reload Work after a fresh process/context | Latest durable state is recovered | recovered Work |
| QA-14 | Learning | Record learning, start later run | Learning is available to later planning | event evidence |
| QA-15 | Memory | Append/read memory | Local memory persists without a service | file evidence |
| QA-16 | Checkpoint | Save/load checkpoint | Checkpoint can be recovered | file + output |
| QA-17 | Health | `mia health` | Verification results are recorded as evidence | event evidence |
| QA-18 | Git safety | `mia vc` help/status paths | Read-only operations remain safe and explicit | CLI output |
| QA-19 | Security | Store adversarial instruction-like content | Injection content is rejected/sanitized | JSONL evidence |
| QA-20 | Build | `bun run build` | Compiled binary is produced | build output |
| QA-21 | Binary | `bun run verify:binary` | Compiled binary executes core smoke journey | smoke output |
| QA-22 | CI | Push/PR against `master` | Complete validation pipeline passes | GitHub Actions |
| QA-23 | Documentation | Current docs match runtime paths/commands | No stale daemon/host-runtime claims | markdown validation + QA test |
| QA-24 | Release | Tag/release decision | Only after QA + host acceptance criteria are met | release record |

## Manual acceptance for the MVP

The highest-value manual test is the real host workflow:

1. Start from a fresh project.
2. Run `mia setup`.
3. Open the project in a supported coding agent.
4. Confirm the agent discovers the generated MIA instructions.
5. Ask it to use MIA planning for a real objective.
6. Confirm the agent invokes the CLI rather than inventing a parallel workflow.
7. Confirm a real MIA artifact and durable event are created.
8. Continue through review and ship in a test repository.
9. Capture host, command, run identifier, result, and repository state.

That is the remaining product acceptance gate tracked by issue #100.

## Failure policy

A failure blocks the milestone until it is classified as one of:

- real product defect
- test defect
- CI/environment defect
- stale documentation
- intentional limitation

Do not downgrade a failing acceptance test just to keep a release green.

## Definition of QA complete

QA is complete only when:

- automated repository checks are green on current `master`
- compiled binary smoke is green
- critical lifecycle paths have deterministic coverage
- security-sensitive persistence behaviour has regression coverage
- current documentation matches the runtime
- the real supported-host journey is proven
- known limitations are written down

The goal is confidence backed by evidence, not a large test count.
