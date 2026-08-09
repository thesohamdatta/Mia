# ADR-0001: Eliminate Daemon — Direct Skill Execution

## Status
Accepted

## Context
The MIA architecture currently uses a CLI-daemon model:
- `mia` CLI reads `~/.mia/state.json` (port, token) → sends HTTP to `miad` daemon
- `miad` (Bun HTTP server) routes `/command` → skill registry → StateService → disk
- Two compiled binaries: `mia` (~98MB) + `miad` (~98MB)
- Daemon state: route map, rate limiter map, skill registry, config — all rebuilt on startup
- Business data (learnings, timeline, checkpoints, memory, sessions) already persisted to disk via JSONL/MD

**Research findings:**
- Zero external consumers of daemon API (only `core/cli/index.ts`)
- No CI, scripts, editors, webhooks call daemon
- Daemon serializes requests via single-threaded event loop (no parallelism benefit)
- All StateStore operations use synchronous `appendFileSync`/`readFileSync` — no in-memory caches
- Token auth provides no real security boundary (same user, same machine, token in readable state file)
- Cold-start: compiled `mia` ~10ms; daemon adds ~5ms HTTP overhead per command
- Reversibility: re-adding daemon is ~100 lines, zero migration (JSONL unchanged)

## Decision
**Eliminate the daemon.** Execute skills directly in the CLI process.

### Changes
1. **Inline `sendCommand()`** → call skill executor directly with `ExecutionContext`
2. **Move route handlers** (`commandRoute`, etc.) into skill executors (they already contain business logic)
3. **Remove**: `core/daemon/` (server, router, middleware, routes), `miad` build target, `state.json`
4. **Collapse skill registry** → direct imports via `skills/index.ts` map
5. **Unify 5 StateStores** → single `UnifiedStore` with typed `append(type, data)` / `query(type, filter)`
6. **Simplify config** → `MIA_DIR` env var + sensible defaults, no Zod schema
7. **Preamble** → composable middleware chain (not tiered)

## Consequences

### Positive
- **Single binary** (~98MB → ~50MB estimated, no daemon duplication)
- **Instant startup** — no "daemon not running" errors, no HTTP round-trip
- **Deep modules** — skill = use case class; state = single append/query interface
- **Testability** — skills importable directly, no HTTP mocking
- **Orthogonality** — removes coupling between CLI and process lifecycle
- **DRY** — eliminates duplicate config, manifest.json, category scanning

### Negative / Risks
- **Cross-process JSONL race**: Concurrent `mia` invocations could interleave lines (mitigation: single-line `appendFileSync` is fast; practical risk ~0 for human usage; add file locking later if needed)
- **No background execution**: All skills synchronous (current behavior anyway)
- **No hot reload**: Not used currently; can re-add via watcher if needed
- **Build change**: CI must drop `build:daemon` and `daemon` script

### Neutral
- JSONL format unchanged — zero migration
- Checkpoint .md format unchanged
- Memory.md format unchanged

## Implementation Order
1. Create `skills/index.ts` map + direct import pattern
2. Create `state/unified-store.ts` (append/query by type)
3. Create `context.ts` (ExecutionContext without daemon fields)
4. Modify `core/cli/index.ts` to execute skills directly
5. Move preamble to middleware chain
6. Delete `core/daemon/`, update `package.json`
7. Update tests to call skills directly
8. Verify `bun run build` produces single `bin/mia`

## References
- Clean Architecture: "Database, web framework, UI are plugins — daemon is unnecessary plugin"
- Refactoring: "Replace Delegation with Inheritance" — inline HTTP delegation
- Code Complete: "Information hiding — hide data representation behind interface"
- Pragmatic Programmer: "YAGNI — no evidence users need daemon features"
- The Pragmatic Programmer: "Two-way door — reversible if profiling shows need"