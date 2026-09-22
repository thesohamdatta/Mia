# Failures

## F1 - CI contract drift

Stage: Verify / Ship

Evidence: The original CI workflow referenced commands and build targets that no longer existed in the supported package script surface. The workflow has since been consolidated and corrected.

Impact: RESOLVED. Pull-request validation now runs only supported repository checks on the current `master` integration branch.

Verification: GitHub Actions CI run #20 passed lint, typecheck, Knip, documentation validation, markdown lint, tests, build, and PR-title validation.

## F2 - End-to-end benchmark not yet runtime-proven

Stage: Execute / Verify / Review

Reason: Repository inspection alone cannot measure live model behavior, iterative reasoning, latency, or human intervention.

Status: BLOCKED / NOT RUN for those runtime dimensions under the current laptop-free environment.
