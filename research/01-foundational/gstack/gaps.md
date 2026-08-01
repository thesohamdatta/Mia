# gstack Landscape Survey — Gaps & Missing Pieces

> **Source:** Primary code inspection of MIA codebase (derived from gstack)
> **Method:** Systematic gap analysis against requirements for a production personal AI OS

---

## Functional Gaps

### 1. Skill System
| Gap | Description | Impact | Effort |
|-----|-------------|--------|--------|
| **No hot-reload** | Skills loaded once at startup; daemon restart required for changes | Dev velocity, iteration speed | MEDIUM |
| **No skill dependencies** | Skills can't declare `dependsOn`; load order undefined | Complex skill compositions | MEDIUM |
| **No skill versioning** | Manifest has version but no compatibility/migration | Ecosystem stability | HIGH |
| **No skill sandboxing** | Skills run in same process as daemon; crash = daemon crash | Reliability, security | HIGH |
| **No skill marketplace** | No discovery, install, update, uninstall commands | Extensibility | HIGH |
| **No skill signing/verification** | Arbitrary code execution via skills | Security | HIGH |
| **Preamble tiers not enforced** | Field exists but not used for context budgeting | Context management | LOW |

### 2. Daemon & Runtime
| Gap | Description | Impact | Effort |
|-----|-------------|--------|--------|
| **Single-threaded event loop** | One request at a time; blocking skills block all | Throughput, responsiveness | MEDIUM |
| **No request queuing** | Burst requests rejected or OOM | Reliability under load | MEDIUM |
| **No backpressure** | No flow control for slow clients | Resource exhaustion | MEDIUM |
| **No graceful degradation** | Skill error = full request failure | Partial functionality | LOW |
| **No health check depth** | `/health` only returns uptime | Operational visibility | LOW |
| **No structured logging** | Only `console.log` at startup | Debugging, observability | MEDIUM |
| **No metrics/tracing** | No Prometheus, OpenTelemetry, custom | Production debugging | HIGH |
| **No config file** | All config hardcoded as constants | Operability, deployment | MEDIUM |
| **No signal handling beyond SIGINT/TERM** | No SIGHUP for reload, SIGUSR for stats | Operations | LOW |

### 3. State & Persistence
| Gap | Description | Impact | Effort |
|-----|-------------|--------|--------|
| **No SQLite** (contrary to design) | JSONL files only; no queries, indexing, concurrent writes | Query power, concurrency | HIGH |
| **No schema migration** | State format changes break existing data | Upgrades | HIGH |
| **No backup/restore** | No tooling for state backup | Data safety | MEDIUM |
| **No state encryption** | Tokens, memory in plaintext | Security | MEDIUM |
| **Single global memory.md** | No per-project memory isolation | Cross-project leakage | MEDIUM |
| **No checkpoint automation** | Manual only; no periodic snapshots | Recovery | LOW |

### 4. Auth & Security
| Gap | Description | Impact | Effort |
|-----|-------------|--------|--------|
| **Single token per daemon run** | No multi-session, no token rotation | Multi-user, long-running | HIGH |
| **No permission model** | All skills = full access | Least privilege | HIGH |
| **No audit logging** | No record of who did what | Compliance, debugging | MEDIUM |
| **No rate limiting** | Unlimited RPC calls | DoS resilience | LOW |
| **Token in state.json (0o600)** | File permissions only protection | Local security | LOW |

### 5. CLI & UX
| Gap | Description | Impact | Effort |
|-----|-------------|--------|--------|
| **No daemon auto-start** | User must manually run `miad` | Onboarding friction | MEDIUM |
| **No daemon status command** | Can't check if daemon healthy | Operations | LOW |
| **No skill help integration** | `mia <skill> --help` not implemented | Discoverability | LOW |
| **No tab completion** | No shell completions | DX | LOW |
| **No output formatting options** | Raw text only | Scripting, parsing | LOW |

---

## Architectural Gaps (vs Stated Design)

| Stated Design | Current Reality | Gap |
|---------------|-----------------|-----|
| SQLite state | JSONL files | **Major** — core design not implemented |
| Handlebars skill templates | No template engine | **Major** — skill scaffolding missing |
| Host adapters (Claude/Hermes/OpenClaw) | Stub executors only | **Major** — multi-agent not functional |
| EKB/MIA separation | Single repo, mixed concerns | **Architectural** — needs split |
| Compiled binary distribution | Works but not automated | **Process** — needs CI/CD |

---

## Operational Gaps

| Area | Missing |
|------|---------|
| **Installation** | No installer, no PATH setup, no shell integration |
| **Updates** | No auto-update, no version check, no migration |
| **Uninstall** | No clean removal |
| **Diagnostics** | No `mia doctor`, no health report, no debug bundle |
| **Telemetry** | No opt-in usage stats, no crash reporting |
| **Documentation** | No man pages, no `--help` for skills, no guides |

---

## Testing Gaps

| Type | Status |
|------|--------|
| Unit tests | None visible |
| Integration tests | One CLI test only |
| Contract tests | None (skill interface) |
| Load tests | None |
| Chaos tests | None |
| Skill test harness | None |

---

## Documentation Gaps

| Missing | Needed For |
|---------|------------|
| Architecture decision records (ADRs) | Onboarding, reasoning |
| Skill development guide | External contributors |
| Daemon operations guide | Production use |
| API reference (RPC, endpoints) | Tool builders |
| Migration guide | Upgrades |
| Security model doc | Auditors, users |

---

## Priority Matrix

| Priority | Gaps |
|----------|------|
| **P0 (Blocker)** | SQLite migration, skill sandboxing, multi-session auth, config system |
| **P1 (High)** | Hot-reload, skill versioning, structured logging, metrics, backup/restore |
| **P2 (Medium)** | Skill dependencies, marketplace, health checks, daemon auto-start |
| **P3 (Low)** | Tab completion, output formats, uninstall, telemetry |

---

*Generated: 2026-08-01 | Researcher: MIA Research Agent | Source: Primary code inspection*