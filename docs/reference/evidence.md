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
