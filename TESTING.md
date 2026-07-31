# Testing Strategy

Verification layers and testing practices for the EKB.

## Test Pyramid → Test Trophy

| Type | Proportion | Focus | Speed |
|------|------------|-------|-------|
| **Unit** | ~70% | Pure logic, fast, deterministic | <10ms |
| **Integration** | ~20% | Real dependencies, contract verification | <1s |
| **E2E** | ~10% | Critical user journeys | <30s |
| **Property-based** | — | Discover edge cases humans miss | Variable |
| **Contract** | — | Consumer-driven contracts for service boundaries | <500ms |

## Verification Layers (Gate Criteria)

```
Lint → Unit → Integration → Eval → Canary → Production
  ↓        ↓         ↓         ↓        ↓         ↓
Static   Deterministic  Contract  Semantic  Live    Real
Analysis  Logic       Verification  Quality  Traffic  Users
```

**Rule**: Each layer must pass before advancing. No skipping.

## Unit Testing

### Principles
- Test behavior, not implementation
- One concept per test
- Descriptive names: `should_return_404_when_user_not_found`
- Arrange-Act-Assert structure
- Test data builders over fixtures

### Coverage Targets
- Pure logic: ≥90%
- Overall: ≥70% (but prefer meaningful tests over coverage numbers)
- Critical paths: 100%

### Anti-Patterns
| Anti-Pattern | Fix |
|--------------|-----|
| Testing private methods | Test public behavior instead |
| Brittle mocks | Use real implementations or fakes |
| Duplicate setup | Test data builders |
| Flaky tests | Fix or delete — never ignore |

## Integration Testing

### Focus Areas
- Database interactions (real DB, test containers)
- External API contracts (contract tests)
- Message queue producers/consumers
- File system operations
- Authentication/authorization flows

### Patterns
- Test containers for infrastructure
- Consumer-driven contracts (Pact)
- Sandbox environments for external services
- Parallel test execution with isolated state

## E2E Testing

### Scope
- Critical user journeys only (login → checkout, onboarding → first value)
- Real browser (Playwright/Chromium)
- Real backend, real data (staging or dedicated test env)

### Best Practices
- Page Object Model for UI abstraction
- Deterministic test data (seed before, clean after)
- Retry only for genuine flakiness (network), not test bugs
- Parallel execution with isolated users/sessions

## Property-Based Testing

### When to Use
- Complex algorithms with mathematical properties
- Serialization/deserialization round-trips
- State machine transitions
- Invariant checking (e.g., "balance never negative")

### Tools
- fast-check (TypeScript)
- Hypothesis (Python)
- jqwik (Java)

## Contract Testing

### Consumer-Driven Contracts
1. Consumer defines expectations (Pact file)
2. Provider verifies against expectations
3. CI gates on both sides
4. Independent deployment enabled

### API Contracts
- OpenAPI/Swagger specs as source of truth
- Generated clients from spec
- Breaking change detection in CI

## Evaluation Testing (AI-Specific)

### Static Evaluation (Layer 1)
- Frontmatter quality, trigger phrases
- Progressive disclosure structure
- Token efficiency, anti-patterns
- Harness portability

### LLM Judge (Layer 2)
- Triggering accuracy (F1 on synthetic prompts)
- Orchestration fitness (worker vs orchestrator)
- Output quality (simulated task evaluation)
- Scope calibration

### Monte Carlo (Layer 3)
- Activation rate (Wilson CI)
- Output consistency (Bootstrap CI)
- Failure rate (Clopper-Pearson CI)
- Token efficiency (median, IQR, outliers)

## Test Organization

```
tests/
├── unit/              # Pure logic, fast
│   ├── utils/
│   ├── domain/
│   └── helpers/
├── integration/       # Real dependencies
│   ├── database/
│   ├── api/
│   └── messaging/
├── e2e/               # Critical journeys
│   ├── onboarding.test.ts
│   └── checkout.test.ts
├── contract/          # Consumer-driven
│   ├── consumer/
│   └── provider/
├── property/          # Property-based
│   └── algorithms.test.ts
└── eval/              # AI evaluation
    ├── static/
    ├── judge/
    └── monte-carlo/
```

## CI Pipeline

```yaml
# Fast feedback (<2min)
lint:       # eslint, prettier, typecheck
unit:       # vitest/jest, coverage gate

# Medium feedback (<10min)  
integration: # testcontainers, contract tests
eval:static:  # plugin-eval static layer

# Slow feedback (<30min)
e2e:        # playwright, critical paths
eval:deep:  # plugin-eval full (on schedule)
```

## Quality Gates

| Gate | Criteria | Blocking |
|------|----------|----------|
| Pre-commit | Lint, typecheck, unit tests | Yes |
| PR | All above + integration, contract | Yes |
| Merge | All above + E2E (critical paths) | Yes |
| Deploy | Canary health, error budget | Yes |
| Periodic | Full eval (deep), benchmark | No (alert only) |

## Test Data Management

- **Builders** over fixtures for flexibility
- **Factories** for complex object graphs
- **Seeded databases** for integration tests
- **Anonymized production snapshots** for E2E (with PII removed)
- **Deterministic randomness** (seeded RNG) for property tests

## Debugging Failed Tests

1. **Reproduce locally** — Same command, same environment
2. **Isolate** — Run single test, then single file
3. **Inspect state** — Logs, screenshots (E2E), database state
4. **Check flakiness** — Re-run 3x, check for timing/race issues
5. **Fix root cause** — Not the symptom, not the test

## Metrics to Track

| Metric | Target | Action if Missed |
|--------|--------|------------------|
| Unit test coverage (logic) | ≥90% | Add tests for untested branches |
| Integration coverage (contracts) | 100% of public APIs | Add contract tests |
| E2E coverage (journeys) | 100% of critical paths | Add journey tests |
| Flaky test rate | <1% | Fix or quarantine |
| Test execution time (unit) | <30s | Parallelize, optimize |
| Test execution time (full) | <20min | Selective test execution |