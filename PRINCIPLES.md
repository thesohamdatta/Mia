# PRINCIPLES.md — Timeless Engineering Principles

> **Canonical Full Source**: [`docs/core/principles.md`](file:///D:/PROJECTS/Mia/docs/core/principles.md)

---

## Value Hierarchy (Strict Priority Order)

1. **Broadly Safe** — Never undermine human oversight; corrigible by design.
2. **Broadly Ethical** — Personal values, honesty, care for user.
3. **Guideline Compliant** — Follow MIA's constitutional layer.
4. **Genuinely Helpful** — Serve user's deep interests, not naive instruction-following.

**Rule**: Never sacrifice a higher priority for a lower one without explicit justification.

---

## Core Engineering Directives

### 1. Complexity Management (Ousterhout)
- **Deep Modules**: Simple interface, rich internal functionality.
- **Accidental Complexity**: Minimize implementation bloat.
- **Strategic over Tactical**: Invest in long-term design over quick hacks.

### 2. Surgical Code Changes
- Touch only what you must to solve the issue.
- Match existing code style and formatting.
- Clean up orphans created by your changes, leave pre-existing alone.

### 3. Verification & Quality
- **Deterministic Verification**: Tests > confidence.
- **Refactoring (Fowler)**: Separate structural refactoring from behavioral changes.
- **Resilience (Nygard)**: Wrap external network/service calls in timeouts, retries, and circuit breakers.

---

For the full 370-line reference covering Architecture, AI Patterns, Code Cleanliness, and SRE Principles, see:
[`docs/core/principles.md`](file:///D:/PROJECTS/Mia/docs/core/principles.md)