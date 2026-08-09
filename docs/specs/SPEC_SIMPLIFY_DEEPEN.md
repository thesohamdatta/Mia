# Spec: Simplify + Deepen MIA Core

> Triage label: `ready-for-agent`
> Parent spec for the structural simplification of MIA's `core/` tree. Behavior-preserving by construction; the additive inbound-plugin build-out is a separate follow-on spec (see Out of Scope).

---

## Problem Statement

MIA's documented architecture describes one source tree, a deep `StateService` module, a thin daemon that delegates to it, and MIA appearing to hosts as inbound commands. The code does not match that picture, and the mismatches cost real engineering attention:

- The codebase carries a **second, dead source tree**. Every tool pointer — the package manifest's entrypoint, the TypeScript project's include set, and the knip `entry`/`project` globs — points at it, so quality tooling analyzes a tree the build never runs. Knip reports against code that isn't shipped.
- A **683-LOC host-adapter subsystem** exists with four provider adapters but **zero call sites**. It models MIA as owning an agentic loop with providers plugged in as the brain (outbound), which contradicts the chosen direction: MIA appearing inside Claude Code as `/mia:*` commands calling the daemon (**inbound**). The dead runtime sits exactly where the inbound seam should be.
- The daemon's entry module **bootstraps itself at module top level** — it runs the moment it's imported — and dispatches requests through a **seven-branch `if`-chain** with the bearer-token auth check copy-pasted into nearly every branch. There is no `start(deps)` to call and no pure router to test, so the daemon can be neither composed nor tested without executing it.
- The state service was designed as a deep module (a `StateService` interface over JSONL stores) but **exports its concrete store classes**, reaches for the filesystem and `git rev-parse` directly inside its functions, and **duplicates its checkpoint parse logic** between `list()` and `load()`. Callers can and do reach past the interface to the concrete classes, so the seam leaks.

The user — the engineer maintaining MIA — is left with a codebase that is harder to understand and extend than its own constitution says it should be.

## Solution

Collapse the codebase to one source tree and bring its structure in line with the documented architecture, **all behavior-preserving**:

- **Retire the dead source tree** and realign the package manifest, TypeScript project, and knip `entry`/`project` to the live tree, so tooling analyzes the code that actually ships.
- **Delete the dead outbound host-adapter runtime**, clearing the seam for the inbound plugin (a separate, additive follow-on spec).
- **Restructure the daemon** into a composition root (`start(deps)`) plus a pure extracted router (`createRouter`) with bearer-token auth applied **once** at the boundary, and remove the single dead middleware that nothing uses.
- **Make the state service a true deep module**: keep the existing `StateService` interface as the stable contract, stop exporting the concrete store classes, inject `StateService` from the single composition root, and de-duplicate the checkpoint parser.

The user gets a codebase that matches its architecture, passes its own verification gates against real code, and can be extended — and eventually wrapped as the inbound plugin — without surgery.

## User Stories

1. As the MIA maintainer, I want a single source tree that the build runs, so that the code I read is the code that ships.
2. As the MIA maintainer, I want the package manifest entrypoint to point at the live CLI module, so that package metadata describes the real binary.
3. As the MIA maintainer, I want the TypeScript project's include set to cover only the live tree, so that `tsc --noEmit` type-checks what ships.
4. As the MIA maintainer, I want knip's `entry` and `project` globs pointed at the live tree, so that dead-code analysis reports against real code, not a retired tree.
5. As the MIA maintainer, I want the dead source tree removed from the repository, so that there is no second copy to drift or confuse readers.
6. As the MIA maintainer, I want the outbound host-adapter runtime deleted, so that the seam for the inbound plugin is clear and unburdened by 683 LOC of unused code.
7. As the MIA maintainer, I want no provider-adapter or host-registry symbols left referenced after deletion, so that the build does not dangle on removed exports.
8. As the MIA maintainer, I want a single composition root that constructs the `StateService` and starts the daemon, so that dependency wiring lives in one place, not spread across module side effects.
9. As the MIA maintainer, I want the `StateService` interface to remain the stable contract, so that callers depend on the deep module, not its concrete store classes.
10. As the MIA maintainer, I want the concrete JSONL store classes hidden (not exported), so that no caller can reach past the `StateService` seam.
11. As the MIA maintainer, I want `StateService` injected into the daemon and routes rather than fetched via a service locator, so that the dependency is visible and testable.
12. As the MIA maintainer, I want filesystem access and `git rev-parse` confined behind the state service, so that the daemon and routes stay thin and free of I/O.
13. As the MIA maintainer, I want a single checkpoint parser used by both `list` and `load`, so that the two paths cannot diverge on format.
14. As the MIA maintainer, I want the daemon to expose a `start(deps)` entry rather than self-bootstrapping at import, so that the server can be composed and shut down under control.
15. As the MIA maintainer, I want authentication applied once at the routing boundary rather than duplicated per branch, so that the auth contract cannot be missed on a new route.
16. As the MIA maintainer, I want the dead rate-limiter middleware removed, so that knip stops flagging it and readers are not misled into thinking rate limiting is active.
17. As the MIA maintainer, I want the daemon's HTTP contract preserved through all of this, so that the compiled CLI and existing integration tests keep passing unchanged.
18. As the MIA maintainer, I want untracked scratch artifacts (large binary test stubs, stray temp files) removed from the working tree, so that they don't bloat the repo or mislead tooling.
19. As the MIA maintainer, I want `bun run validate` (lint + typecheck + knip) green against the real tree, so that the health gate reflects genuine code, not a retired one.
20. As the MIA maintainer, I want MIA to remain ready to be wrapped as the inbound `/mia:*` plugin after this work, so that the next spec can build the plugin against a clean seam.

## Implementation Decisions

- **Single source tree.** Retire the second tree; repoint the package manifest entrypoint, the tsconfig `include`, and the knip `entry`/`project` globs at the live tree. The build scripts already compile the live tree — only the metadata pointers were stale.
- **Delete the outbound host-adapter subsystem and its registry.** No caller depends on it (verified: zero import sites across CLI/daemon/skills). After deletion, a repository-wide search must show no dangling references to the removed exports. The host types module goes with the runtime — the subsystem leaves nothing callers need.
- **Daemon composition.** Extract a pure `createRouter(routeTable)` that maps path + method → handler, with bearer-token auth enforced **once** for protected routes at the boundary. Add a `start(deps)` that owns startup (config init, port/token generation, state-file write, `server.listen`, signal handlers) and removes top-level side effects. `/health` and `GET /skills` stay auth-free (read-only); every state-mutating route goes through the single auth boundary. This reinforces the constitutional hard constraint — "token auth required for all daemon state mutations" — by enforcing it **structurally, once**, instead of per branch.
- **Remove the dead rate-limiter** from middleware. Nothing imports it; deletion closes the knip flag and stops implying rate limiting is in effect.
- **State as a deep module.** The existing `StateService` interface is the **preserved, stable contract** — it already has the eight members callers need. The decision is to **stop exporting the concrete `Jsonl*Store` classes**, construct them privately inside `createStateService`, and inject the resulting `StateService` from the composition root into the daemon and routes. Callers stop reaching for concrete classes.

  ```ts
  // Existing contract — preserved unchanged. The decision: this IS the seam;
  // concrete store classes stop being exported and are built only inside createStateService.
  interface StateService {
    learnings: LearningStore;
    timeline: TimelineStore;
    checkpoints: CheckpointStore;
    memory: MemoryStore;
    sessions: SessionStore;
    getSlug(cwd?: string): string;
    ensureProject(slug: string): Promise<string>;
  }
  ```
  *(Not from a prototype — this is the existing `StateService` contract, reprised here because it is the precise decision: keep this surface stable, hide everything behind it.)*

- **Confine I/O.** Filesystem access and the `git rev-parse` call (used only for `getSlug`) stay inside the state service. Routes receive `slug`/`context` rather than computing them or importing state internals.
- **De-duplicate the checkpoint parser.** Extract one parse function used by both `list()` and `load()`. The **on-disk Markdown-per-checkpoint format is preserved (unchanged)** in this spec — the format change is deferred (see Out of Scope) so that this spec stays behavior-preserving and covered by one existing seam.
- **One composition root.** A single place builds config → `StateService` → router → daemon and calls `start(deps)`. No module-level side effects remain in the daemon entry.
- **Scratch cleanup.** Remove untracked scratch binaries and the one 0-byte temp artifact from the working tree; `.gitignore` already excludes such paths, so this touches no tracked files.

## Testing Decisions

- **What makes a good test here.** A good test exercises external behavior through a stable boundary, not internal wiring. For this spec that boundary is **unchanged**: the compiled CLI invoking the daemon's HTTP API (`/command`, `/health`, `/skills`).
- **One seam — the existing one.** `tests/integration.test.ts` already drives the compiled `bin/mia.exe` × the daemon over HTTP. **No new seam is introduced.** Every refactor in this spec must keep that suite green — that is the regression net. The skill's ideal ("the fewer seams the better — ideal is one") is met by construction, because the work is behavior-preserving.
- **What is under test at that seam.** The daemon's request dispatch (now via the extracted router), the skill command path, and — through them — the state service's learning/timeline/memory behavior. We **deliberately do not** add unit tests for the new composition root or `createRouter` in isolation; testing them apart would pin implementation details. Behavior preserved = same HTTP responses.
- **No migration test needed.** The checkpoint format is deliberately unchanged, so existing on-disk checkpoints keep loading.
- **Static gates that become meaningful.** `bun run validate` (lint + typecheck + knip) must be green against the live tree; knip must report zero against real code (it currently analyzes the retired tree, masking results).
- **Prior art.** The existing integration suite is the pattern: it assumes a running daemon and asserts on HTTP responses plus CLI stdout.

## Out of Scope

- **Building the inbound `/mia:*` Claude Code plugin** — additive work, a separate follow-on spec. This spec only clears the seam (by deleting the outbound runtime) and keeps the daemon's HTTP contract stable for the plugin to call.
- **Changing the checkpoint on-disk format to JSONL** — deferred to the plugin spec, which would add the `/checkpoints` persistence test such a format change requires. This spec de-duplicates the parser but preserves the format.
- **Replacing the config service-locator (paths singletons) with full DI** — a later step; deferred until state injection and router extraction have shipped. No change to config in this spec.
- **Implementing real skill executor logic** (grill/health/plan) — covered by `SPEC_SKILL_EXECUTORS.md`; orthogonal to this structural refactor.
- **Any change to the daemon's HTTP API** — route paths, auth scheme, request/response bodies are explicitly preserved.
- **Streaming output, skill-to-host routing, adapter API keys, eval harness, self-improvement loop** — all known Next Steps; not structural simplification.

## Further Notes

- **Sequence (cleanup → deepen).** Scratch cleanup → retire the dead tree + repoint pointers → delete the host runtime → inject `StateService` + extract router + de-duplicate parser + remove dead middleware. Each step leaves the integration suite green; commit per step.
- **Why one seam suffices.** This spec is behavior-preserving by construction. The one item that *could* change behavior (checkpoint format) was intentionally deferred rather than bundled in, to keep the seam count at one and avoid shipping a format change without a covering test.
- **Reversibility.** Deletions are atomic and individually revertable via git. The composition-root/router restructuring is additive *before* the top-level side effect is removed, so a partial revert restores the old dispatch.
- **Why this split.** Separating the structural/behavior-preserving spec from the additive plugin spec honors two constitution rules at once: "one issue at a time" and "never mix a refactor with a feature." Overridable — if you want them in one spec, say so.
- **Health gate.** This spec is not "done" until `bun run validate` is green and the integration suite passes (health ≥ 7; verification over confidence).
- **`ready-for-agent`** triage label applied on publish.
