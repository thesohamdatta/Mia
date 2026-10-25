---
type: reference
scope: project
status: active
owner: architecture
canonical: false
audience: human
load: on-demand
---

# Work lifecycle audit (#170)

Audit target: the v0.4 lifecycle in `docs/specs/MIA_V0_4.md`.
Runtime code, not the conceptual diagram, determines the actual transitions.

## Execution and persistence paths

1. `core/cli/index.ts` resolves a registered skill, creates an `ExecutionContext`,
   and invokes `executeSkillDefinition`.
2. `core/skills/executor.ts` admits capabilities and runs the skill through
   `core/skills/preamble.ts`. The middleware records invocation outcomes
   in `UnifiedStore` timeline events.
3. `plan create` derives planned `Work` from a `RootPlan` and calls `saveWork`.
4. `saveWork` appends the full Work snapshot to the existing timeline;
   `loadWork` retrieves the latest snapshot for a Work ID.
5. `review <workId>` loads planned or in-progress Work, executes configured
   verification, stores evidence, and advances its state based on the result.
6. `ship <workId>` loads ready-to-ship Work, runs its configured checks,
   loads required approval, and calls the guarded `shipWork` function.
7. `shipped -> maintained -> in_progress` remains an allowed domain path.
   Operational observations and maintenance Work use existing timeline storage.

## State transitions exercised by real skills

| Operation | Starting state | Successful state | Failed verification |
| :--- | :--- | :--- | :--- |
| `plan create` | New Work | `planned` | Not applicable |
| `review` | `planned` or `in_progress` | `ready_to_ship` | `in_progress` |
| `ship` | `ready_to_ship` only | `shipped` | `in_progress` |

The review path is `planned -> in_progress -> verification -> review -> ready_to_ship`.
On failure it returns `verification -> in_progress`.

A failed ship check returns `ready_to_ship -> review -> in_progress`,
using the existing transition rules. A later ship attempt requires a new review.

`transitionWork` deliberately does not expose a direct `ready_to_ship -> shipped`
transition. `shipWork` is the gated shipping boundary: it checks evidence,
required verification names, and human approval before setting `shipped`.
This prevents an ungated call to the general state transition function.

## Mismatches found and corrected

| Previous behavior | Consequence | Fix |
| :--- | :--- | :--- |
| `ship` verified Work before checking readiness | Repeated and premature shipping could overwrite evidence | Reject other states before checks or writes |
| Failed ship checks saved failure while Work stayed `ready_to_ship` | Persisted readiness contradicted verification | Return to `in_progress` through existing transitions |
| A reported aggregate pass could contradict a failed check record | Review could mark Work ready despite failed evidence | Require nonempty, all-passing records for a passing verdict |
| Verification runner exceptions did not save Work recovery state | A crashed review or ship attempt could leave stale readiness | Save a failed verification projection and resumable `in_progress` state |

Existing `Work` remains the lifecycle authority. `UnifiedStore` remains
the only event persistence boundary. Work stores evidence references,
not the full check output, and approvals remain separate approval events.

## Behavior and recovery tests

- `core/test/work-lifecycle-reconciliation.test.ts`: invalid ship states,
  repeat shipping, failing or contradictory evidence, and verifier exceptions.
- `core/test/work-journey.integration.test.ts`: plan, review, approval, ship,
  and recovery across new execution contexts.
- `core/test/work-persistence.test.ts`: Work snapshot round-trip and latest
  event recovery.
- `core/test/work-shipping.test.ts`: guarded direct shipping and approval.
- `core/test/review-workflow.test.ts` and `core/test/ship-runtime.test.ts`:
  direct skill execution compatibility.

The CLI remains `mia plan`, `mia review <workId>`, and
`mia ship <workId>`; no daemon, workflow DSL, or new store is introduced.

## Remaining boundaries and uncertainty

An arbitrary skill invocation has a run identity but is not inherently
associated with a particular Work ID. Its timeline status cannot safely
advance arbitrary Work without explicit association. This issue reconciles
the Work-aware review and ship boundaries, not generic skill orchestration.

The review runner's catalog selection remains unchanged. Its current tests
also include intentionally narrow injected verification results; these prove
lifecycle handling, not full live repository verification.

The full CI suite and binary smoke test provide broader compatibility
evidence; the targeted tests establish the state transitions above.
