---
type: reference
scope: project
status: active
owner: verification
canonical: true
audience: agent
load: on-demand
---

# Evidence and Verification

MIA separates what an agent says from what the repository demonstrates.

## Terms

| Term | Meaning |
| :--- | :--- |
| **Claim** | A statement about code, documentation, configuration, or observed behaviour. |
| **Evidence** | An inspectable artifact supporting a claim. |
| **Verification** | The action that produced or inspected the evidence. |
| **Observed** | Directly established by a command, test, source inspection, CI result, or runtime observation. |
| **Inferred** | A reasoned conclusion that is not directly demonstrated. |
| **Unknown** | Not established by the available evidence. |
| **Partial** | Some required conditions passed while others remain unresolved. |
| **Blocked** | Work cannot proceed without a missing prerequisite, decision, or passing gate. |
| **Stale** | Evidence or documentation no longer describes the current repository state. |

## Completion rule

Use the narrowest evidence that actually proves the claim.

Examples:

- file edit → inspect the resulting diff and relevant diagnostics
- typecheck → successful typecheck command
- test behaviour → passing focused test
- build → successful build command
- documentation contract → Markdown/frontmatter/link checks
- CI status → current GitHub Actions result for the exact commit

A green check proves the scope of that check, not the entire system.

## Documentation claims

Important claims may reference the source, test, command, CI run, generated artifact, or runtime observation that supports them. Do not fabricate proof links or use prose confidence as evidence.


## Work projections

Work keeps only the state needed to resume and enforce lifecycle gates:

- verification status, run identity, and lightweight evidence references
- criterion-level evidence records (`criteria: CriterionEvidence[]`) mapping declared `successCriteria` to `'passed' | 'failed'` status
- the latest approval identity, action, and status when an approval exists

The full verification output remains an Evidence event in UnifiedStore. The full Approval remains an Approval event in UnifiedStore. Work references these outcomes without becoming a second evidence or approval store.

## Criterion-level outcome verification

Repository verification checks (`tests`, `typecheck`, `lint`, `knip`, `build`) prove that the repository compiles and passes existing regression tests. They do not prove that a task satisfied its specific objective.

When a `Work` item declares `successCriteria`:

1. `mia review <workId> --attest-all` (or `--criterion <name>`) records criterion-level evidence on `Work.verification.criteria`.
2. `completeReview` blocks advancing to `ready_to_ship` if any declared criterion is missing or unverified.
3. `shipWork` enforces that all declared `successCriteria` are verified as passed before transitioning to `shipped`.
4. Work items with empty `successCriteria` pass verification based on repository checks alone, preserving backward compatibility.
