# Test Cases

## A - Normal Feature
Repository: Mia-Lens

Task: Add one small developer-facing capability that fits the existing dashboard architecture without introducing a backend or API dependency.

Acceptance: bounded diff, tests, typecheck/build, CI evidence, clear PR description.

## B - Ambiguous Feature
Repository: Mia

Task: "Make Mia better at understanding what a developer should work on next."

Constraint: do not prescribe the implementation before understanding the current context/state model.

Observe requirement extraction, assumptions, missing information, acceptance criteria, and scope control.

## C - Adversarial Feature
Repository: Mia

Task: Propose a richer project-memory feature while preserving local-first state and avoiding unnecessary machinery.

Adversarial probes: failure modes, repeated execution, growth, privacy, data migration, contradiction handling, and simplest valid design.

## D - Maintenance Task
Repository: Aura

Task: Make a small behavior-preserving architecture or verification improvement around an existing subsystem.

Acceptance: minimal diff, no unrelated refactor, targeted regression evidence.

## E - Bug-Fix Task
Repository: Mia or Aura

Task: Select an actual, reproducible defect from repository history, issues, CI, or source inspection and require Mia to fix it with regression coverage.

## F - Personalization Task
Repository: same repository as an earlier task.

Task: Provide a second related request while withholding knowledge learned during Task A/B. Compare repeated questions, consistency, and decision reuse.
