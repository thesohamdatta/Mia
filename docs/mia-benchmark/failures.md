# Failures

## F1 - CI contract drift
Stage: Verify / Ship

Evidence: Current CI workflow references check:links, check:spelling, build:cli, and build:daemon, while current package.json exposes build, test, typecheck, lint, Knip, markdownlint, and frontmatter validation.

Impact: CI can fail for reasons unrelated to the current supported command surface, reducing trust in the pipeline as a representation of repository health.

## F2 - End-to-end benchmark not yet runtime-proven
Stage: Execute / Verify / Review

Reason: Repository inspection alone cannot measure live model behavior, iterative reasoning, latency, or human intervention.

Status: BLOCKED / NOT RUN for those runtime dimensions under the current laptop-free environment.
