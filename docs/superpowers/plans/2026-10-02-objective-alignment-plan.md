# Objective & Task-Outcome Alignment Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Criterion-Level Verification Evidence on `Work` items so `mia review` and `mia ship` verify that declared `successCriteria` are satisfied with evidence before advancing to `ready_to_ship` or `shipped`.

**Architecture:** Extend `WorkVerification` with `criteria?: CriterionEvidence[]`. Enforce completeness in `completeReview` (`core/work/lifecycle.ts`) and `shipWork` (`core/work/ship.ts`). Upgrade `core/skills/review/execute.ts` to accept criteria attestation and format criteria evidence into review output. Preserve 100% backward compatibility for empty `successCriteria`.

**Tech Stack:** TypeScript, Bun Test, Mia UnifiedStore / JSONL.

## Global Constraints

- Runtime code is authoritative; keep modules deep with minimal public API changes.
- Preserve deterministic boundaries: no LLM calls inside review/ship gates.
- Work with empty `successCriteria` must remain completely backward compatible.
- Zero lint, typecheck, knip, or test regressions.

---

### Task 1: Extend Work Domain Types with CriterionEvidence

**Files:**
- Modify: `core/work/types.ts`
- Test: `core/test/work-lifecycle.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface CriterionEvidence {
    criterion: string;
    status: 'passed' | 'failed';
    evidenceRef?: string;
    note?: string;
  }
  // Added to WorkVerification:
  criteria?: CriterionEvidence[];
  ```

- [ ] **Step 1: Write the failing type contract test**

In `core/test/work-lifecycle.test.ts`, add a test asserting that `CriterionEvidence` can be defined and attached to a Work item's verification projection.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test core/test/work-lifecycle.test.ts`

- [ ] **Step 3: Implement minimal type definition**

In `core/work/types.ts`:
Define and export `CriterionEvidence`.
Add optional `criteria?: CriterionEvidence[];` to `WorkVerification`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test core/test/work-lifecycle.test.ts`

- [ ] **Step 5: Commit**

```bash
git add core/work/types.ts core/test/work-lifecycle.test.ts
git commit -m "feat(work): define CriterionEvidence contract on WorkVerification"
```

---

### Task 2: Enforce Criteria Evidence in Lifecycle Transitions

**Files:**
- Modify: `core/work/lifecycle.ts`
- Test: `core/test/work-lifecycle-operations.test.ts`

**Interfaces:**
- Consumes: `CriterionEvidence`, `WorkVerification` from `core/work/types.ts`
- Produces:
  - `recordVerification(work, { runId, records, passed, criteria? })` persists criteria.
  - `completeReview(work, { passed })` checks that if `work.successCriteria.length > 0`, every criterion has a matching `'passed'` entry in `work.verification.criteria`.

- [ ] **Step 1: Write failing tests for criteria recording and review gate enforcement**

In `core/test/work-lifecycle-operations.test.ts`:
- Add test: `completeReview` blocks `ready_to_ship` if `work.successCriteria` has items not verified in `criteria`.
- Add test: `completeReview` advances to `ready_to_ship` if all `work.successCriteria` have status `'passed'`.
- Add test: `completeReview` advances to `ready_to_ship` when `work.successCriteria` is empty (backward compatibility).

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test core/test/work-lifecycle-operations.test.ts`

- [ ] **Step 3: Implement lifecycle logic**

In `core/work/lifecycle.ts`:
Update `VerificationRecordOutcome` interface to accept optional `criteria?: readonly CriterionEvidence[]`.
Update `recordVerification` to copy `criteria`.
In `completeReview`, if `outcome.passed && work.successCriteria.length > 0`, verify that every item in `work.successCriteria` exists in `work.verification?.criteria` with `status === 'passed'`. If not, throw an Error.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test core/test/work-lifecycle-operations.test.ts`

- [ ] **Step 5: Commit**

```bash
git add core/work/lifecycle.ts core/test/work-lifecycle-operations.test.ts
git commit -m "feat(work): enforce success criteria completeness in completeReview"
```

---

### Task 3: Enforce Criteria Verification in Ship Gate

**Files:**
- Modify: `core/work/ship.ts`
- Test: `core/test/work-shipping.test.ts`

**Interfaces:**
- Consumes: `CriterionEvidence`, `Work` from `core/work/types.ts`
- Produces: `shipWork(work: Work): Work` asserting criteria completeness.

- [ ] **Step 1: Write failing test in work-shipping.test.ts**

Add tests:
- `shipWork` throws if `work.successCriteria` has entries but `work.verification.criteria` is missing or has unpassed entries.
- `shipWork` succeeds if `work.successCriteria` has entries and all are verified `'passed'`.
- `shipWork` succeeds without criteria if `work.successCriteria` is empty.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test core/test/work-shipping.test.ts`

- [ ] **Step 3: Implement validation in shipWork**

In `core/work/ship.ts`:
Check if `work.successCriteria.length > 0`. If so, verify `work.verification?.criteria` contains a `'passed'` record for every entry in `work.successCriteria`. If not, throw descriptive error.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test core/test/work-shipping.test.ts`

- [ ] **Step 5: Commit**

```bash
git add core/work/ship.ts core/test/work-shipping.test.ts
git commit -m "feat(work): enforce success criteria verification before shipping"
```

---

### Task 4: Enhance Review Skill CLI with Criteria Attestation

**Files:**
- Modify: `core/skills/review/execute.ts`
- Test: `core/test/review-workflow.test.ts`

**Interfaces:**
- CLI invocation: `mia review <workId> [--attest-all | --criterion <name>]`
- Passes criteria to `recordVerification` and displays formatted criteria status in `MIA review gate` output.

- [ ] **Step 1: Write failing tests in review-workflow.test.ts**

Add tests:
- `mia review <workId>` blocks when Work has `successCriteria` and no attestation is provided.
- `mia review <workId> --attest-all` marks all declared criteria passed, passes `completeReview`, and transitions to `ready_to_ship`.
- Output displays `CRITERIA:` checklist.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test core/test/review-workflow.test.ts`

- [ ] **Step 3: Implement CLI parsing and output formatting in review skill**

In `core/skills/review/execute.ts`:
Parse `--attest-all` or criterion arguments.
If Work has criteria and none were attested, set verification passed to false or block before `completeReview`.
Pass criteria to `recordVerification`.
Add criteria status list to `output` lines.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test core/test/review-workflow.test.ts`

- [ ] **Step 5: Commit**

```bash
git add core/skills/review/execute.ts core/test/review-workflow.test.ts
git commit -m "feat(skills): support criteria attestation and output in review skill"
```

---

### Task 5: End-to-End Journey Verification & Full Repository Gate

**Files:**
- Modify: `core/test/intent-to-verified-work.e2e.test.ts`
- Documentation: `docs/reference/evidence.md`, `docs/skills/review.md`

- [ ] **Step 1: Update E2E test to include declared success criteria**

In `core/test/intent-to-verified-work.e2e.test.ts`, declare explicit `successCriteria` on the planned Work and carry them through review attestation to shipping.

- [ ] **Step 2: Run E2E test**

Run: `bun test core/test/intent-to-verified-work.e2e.test.ts`
Verify: PASS

- [ ] **Step 3: Update documentation**

Document `CriterionEvidence` and criteria verification in `docs/reference/evidence.md` and `docs/skills/review.md`.

- [ ] **Step 4: Run full repository verification gate**

Run:
```bash
bun test
bun run typecheck
bun run lint:check
bun run knip
bun run build
```

- [ ] **Step 5: Commit**

```bash
git add core/test/intent-to-verified-work.e2e.test.ts docs/reference/evidence.md docs/skills/review.md
git commit -m "docs(evidence): document criterion-level outcome verification and update E2E test"
```
