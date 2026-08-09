# Code Review Standards

Quality gates and review processes for the EKB.

## Review Principles

1. **Read entire affected functions and dependencies** before approving — not just diffs
2. **Verify against ADR** — Implementation must match documented rationale
3. **Check for scope creep** — Implementation shouldn't implicitly make new decisions
4. **Validate success criteria** — Tests must measure what ADR defined as success
5. **Document deviations** — Any implementation-driven changes must update ADR

## Review Types

| Review Type | When | Reviewers | Depth |
|-------------|------|-----------|-------|
| **Pre-landing** | Before merge to main | Owner + 1 cross-reviewer | Full |
| **Security** | Auth, crypto, secrets, boundaries | Security-trained | Deep |
| **Architecture** | New services, data models, APIs | Architect + owner | Deep |
| **Performance** | Hot paths, database queries, caching | Perf-aware | Targeted |
| **Documentation** | User-facing changes, API changes | Writer + owner | Clarity-focused |

## Review Checklist

### Correctness
- [ ] Code does what it claims (trace through logic)
- [ ] Edge cases handled (null, empty, boundary, error states)
- [ ] No silent failures — errors are visible and actionable
- [ ] Concurrency safety (race conditions, deadlocks)

### Architecture
- [ ] Follows established patterns in ARCHITECTURE.md
- [ ] Respects module boundaries (no layer violations)
- [ ] Dependencies point inward (Clean Architecture)
- [ ] No new circular dependencies

### Maintainability
- [ ] Single responsibility per function/class/module
- [ ] Clear naming (self-documenting code)
- [ ] No magic numbers — use named constants
- [ ] Comments explain *why*, not *what*
- [ ] Complexity is justified (deep modules, not shallow)

### Testing
- [ ] Unit tests for pure logic (≥70% coverage target)
- [ ] Integration tests for external dependencies
- [ ] Contract tests for service boundaries
- [ ] Property-based tests for complex algorithms
- [ ] Tests are readable (Arrange-Act-Assert, descriptive names)

### Reliability
- [ ] Timeouts on all external calls
- [ ] Circuit breakers for unstable dependencies
- [ ] Idempotency for mutating operations
- [ ] Graceful degradation paths
- [ ] Observability: logs, metrics, traces

### Security
- [ ] No secrets in code or logs
- [ ] Input validation on all boundaries
- [ ] Authorization checks on all mutations
- [ ] No SQL injection / XSS / path traversal vectors
- [ ] Dependencies scanned for vulnerabilities

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching strategy
- [ ] Pagination for large datasets
- [ ] Async where beneficial, sync where simple

## Review Process

```
1. Author: Self-review (run linter, tests, read own diff)
2. Author: Create PR with context (link ADR, describe changes)
3. CI: Automated checks (lint, type, test, build)
4. Reviewer: Read ADR → Read diff → Verify against checklist
5. Reviewer: Comment with specific, actionable feedback
6. Author: Address feedback or discuss trade-offs
7. Reviewer: Approve when all concerns resolved
8. Merge: CI passes → Merge → Deploy pipeline
```

## Feedback Guidelines

**Good feedback:**
- Specific: "Line 42: variable `x` shadows outer scope, rename to `userId`"
- Actionable: "Extract this logic into `calculateTax()` for testability"
- Educational: "This pattern causes issues when X; prefer Y because..."

**Avoid:**
- Nitpicks on style (linter handles this)
- "Looks good" without reading
- Vague: "This could be better"
- Blocking on preferences without rationale

## Ownership

| Area | Primary Owner | Backup |
|------|---------------|--------|
| Core architecture | Architect | Senior engineer |
| Authentication | Security lead | Backend lead |
| Database | Data engineer | Backend lead |
| Frontend | UI lead | Frontend engineer |
| Infrastructure | DevOps lead | Platform engineer |

**Cross-review required** when changes touch another team's ownership area.

## Escalation

If reviewers disagree:
1. Discuss in PR comments (timeboxed: 24h)
2. Escalate to architect for technical decisions
3. Escalate to product for scope/UX decisions
4. Document decision in ADR regardless of outcome

## Metrics

Track and review monthly:
- PR cycle time (open → merge)
- Review depth (comments per PR)
- Defect escape rate (bugs found post-merge)
- Reviewer load balance