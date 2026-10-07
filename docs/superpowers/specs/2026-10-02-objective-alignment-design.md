# Specification: Objective & Task-Outcome Alignment Verification

- **Author:** Senior AI Systems Engineer
- **Status:** Approved / Ready for Tickets
- **Feature Branch:** `feat/objective-alignment-verification`
- **Target Integration:** `master`
- **Related Research:**
  - AE-02: *Why Software Factories Fail* (Passing tests ≠ quality; unmeasured maintainability; recovery tax)
  - AE-03: *Software Fundamentals Matter More Than Ever* (Shared design concept; TDD; deep modules)
  - AE-06: *12-Factor Agents* (Stateless reducer; deterministic shell around model decisions; external state)
  - AE-07: *No, That's Not a Software Factory* (PR/build is intermediate artifact; outcome delivery)

---

## 1. Objective

Enable Mia to verify that a `Work` item's actual outcome satisfies its declared `objective` and `successCriteria` before advancing past the review and shipping gates.

Currently, `mia review` and `mia ship` check only repository compilation and testing exit codes (`typecheck`, `lint`, `knip`, `tests`, `build`). This specification introduces deterministic **Criterion-Level Verification Evidence** onto `Work.verification`, ensuring that:
1. `mia review` blocks transition to `ready_to_ship` if declared `successCriteria` lack verified evidence.
2. `mia ship` refuses to ship Work whose success criteria are not verified as passed.
3. The verification is deterministic, transparent, and compatible with both manual engineer workflows and autonomous agent runners.

---

## 2. Current Behavior vs. Desired Behavior

### Current Behavior
1. In [`core/skills/review/execute.ts`](file:///D:/donwload/project/Mia/core/skills/review/execute.ts), `mia review <workId>` loads Work, executes repository checks, appends evidence, and if checks pass, calls `completeVerification(work, { passed: true })` and `completeReview(work, { passed: true })`.
2. In [`core/work/ship.ts`](file:///D:/donwload/project/Mia/core/work/ship.ts), `shipWork(work)` verifies `work.state === 'ready_to_ship'`, that `work.verification.passed === true`, and human approval if required.
3. `work.successCriteria` is never inspected by either skill. An agent can delete a feature or modify unrelated code, pass `bun test`, and ship the item.

### Desired Behavior
1. **Contract Extension:** `WorkVerification` in [`core/work/types.ts`](file:///D:/donwload/project/Mia/core/work/types.ts) gains an optional `criteria?: CriterionEvidence[]` record mapping each criterion string to a status (`'passed' | 'failed'`) and an optional supporting reference (`evidenceRef`).
2. **Review Skill Enhancement:** `mia review <workId> [--criteria-pass]` or programmatic invocation allows passing criteria validation. If `work.successCriteria` has entries, `completeReview` verifies that every item in `work.successCriteria` has a corresponding `passed` entry in `criteria`.
3. **Ship Gate Enforcement:** `shipWork` in [`core/work/ship.ts`](file:///D:/donwload/project/Mia/core/work/ship.ts) explicitly asserts that if `work.successCriteria.length > 0`, `work.verification.criteria` exists, covers all items, and none have status `'failed'`.
4. **Backward Compatibility:** If `work.successCriteria` is empty (e.g. ad-hoc work), verification passes on repository checks alone.

---

## 3. Non-Goals

- **No LLM Judge inside the CLI:** We do not invoke LLMs inside `mia review` or `mia ship` to assess diffs. LLM judgment is nondeterministic and violates the deterministic harness principle (AE-06).
- **No Git Diff / AST parsing engine:** Criteria verification is contract-based and evidence-bound, not a whole static analysis framework.
- **No breaking changes to existing tests:** Existing tests creating Work without `successCriteria` continue to pass.

---

## 4. Design & Contracts

### 4.1 Data Contract (`core/work/types.ts`)

```typescript
export interface CriterionEvidence {
  criterion: string;
  status: 'passed' | 'failed';
  evidenceRef?: string;
  note?: string;
}

export interface WorkVerification {
  runId: string;
  passed: boolean;
  evidence: WorkEvidenceRef[];
  criteria?: CriterionEvidence[];
}
```

### 4.2 Lifecycle Verification Helper (`core/work/lifecycle.ts`)

Update `recordVerification`:
```typescript
interface VerificationRecordOutcome {
  runId: string;
  records: readonly EvidenceRecord[];
  passed: boolean;
  criteria?: readonly CriterionEvidence[];
}

export function recordVerification(work: Work, outcome: VerificationRecordOutcome): Work {
  // Existing validation...
  return {
    ...work,
    verification: {
      runId: outcome.runId,
      passed: outcome.passed,
      evidence: outcome.records.map((r) => ({ runId: r.runId, name: r.name, status: r.status })),
      criteria: outcome.criteria ? [...outcome.criteria] : undefined,
    },
    updatedAt: new Date().toISOString(),
  };
}
```

Update `completeReview`:
```typescript
export function completeReview(work: Work, outcome: ReviewOutcome): Work {
  if (outcome.passed && work.successCriteria.length > 0) {
    const verifiedCriteria = work.verification?.criteria || [];
    const allPassed = work.successCriteria.every((criterion) =>
      verifiedCriteria.some((c) => c.criterion === criterion && c.status === 'passed')
    );
    if (!allPassed) {
      throw new Error('Cannot complete review: declared success criteria are not verified as passed');
    }
  }
  return transitionWork(work, outcome.passed ? 'ready_to_ship' : 'in_progress');
}
```

### 4.3 Shipping Gate Enforcement (`core/work/ship.ts`)

In `shipWork(work: Work)`:
```typescript
if (work.successCriteria.length > 0) {
  const verifiedCriteria = work.verification.criteria || [];
  const unverified = work.successCriteria.filter(
    (sc) => !verifiedCriteria.some((c) => c.criterion === sc && c.status === 'passed')
  );
  if (unverified.length > 0) {
    throw new Error(`Work success criteria not verified: ${unverified.join(', ')}`);
  }
}
```

### 4.4 Review Skill Arguments (`core/skills/review/execute.ts`)

Support specifying criteria status:
- `mia review <workId>`: Runs repository checks. If `work.successCriteria` exists and `--attest-criteria` or criteria options are passed, records them.
- If `work.successCriteria` exists but no criteria verification was provided, reports:
  `BLOCKED: Success criteria require verification evidence before ready_to_ship.`
  Returns status `blocked` and returns Work to `in_progress`.

---

## 5. Repository Impact

- **Files Modified:**
  - `core/work/types.ts`: Add `CriterionEvidence` interface, update `WorkVerification`.
  - `core/work/lifecycle.ts`: Validate criteria completeness in `completeReview`.
  - `core/work/ship.ts`: Validate criteria completeness in `shipWork`.
  - `core/skills/review/execute.ts`: Parse criteria attestation flag/args and pass to `recordVerification`.
- **Tests Added/Updated:**
  - `core/test/work-lifecycle.test.ts`: Test that `completeReview` blocks unverified criteria and passes verified criteria.
  - `core/test/work-shipping.test.ts`: Test that `shipWork` blocks unverified criteria.
  - `core/test/review-workflow.test.ts`: Test `mia review` CLI behavior with and without criteria.
  - `core/test/intent-to-verified-work.e2e.test.ts`: Confirm full journey with criteria passes end-to-end.
- **Documentation Updated:**
  - `docs/reference/evidence.md`: Document criterion-level evidence semantics.
  - `docs/skills/review.md`: Document criteria verification requirements.

---

## 6. Acceptance Criteria

1. **AC-1 (Type Safety):** `CriterionEvidence` is exported from `core/work/types.ts` and included optionally on `WorkVerification`.
2. **AC-2 (Review Rejection):** `completeReview(work, { passed: true })` throws an error if `work.successCriteria` has items that are not marked `'passed'` in `work.verification.criteria`.
3. **AC-3 (Review Acceptance):** `completeReview(work, { passed: true })` transitions to `ready_to_ship` when all `work.successCriteria` have matching `passed` entries.
4. **AC-4 (Ship Gate Rejection):** `shipWork(work)` throws an error if `work.successCriteria` has items not verified in `work.verification.criteria`.
5. **AC-5 (Backward Compatibility):** Work with `successCriteria: []` continues to review and ship without requiring `criteria` records.
6. **AC-6 (CLI Integration):** `mia review <workId> --attest-all` or explicit criterion verification allows valid transition from CLI and outputs clear pass/fail criteria lines in terminal output.
7. **AC-7 (Verification Suite Cleanliness):** `bun test`, `bun run typecheck`, `bun run lint:check`, `bun run knip` all pass with 0 errors.

---

## 7. Risks & Rollback

- **Risk:** Agents might pass `--attest-all` indiscriminately.
  - *Mitigation:* The criteria are printed in the review gate report and saved permanently to `events.jsonl` timeline and evidence, ensuring full auditability. Human approval gate (`requiresHumanApproval`) still applies before shipping.
- **Rollback:** Fully backward compatible. If reverted, removing the check restores the previous exit-code-only behavior without data loss.
