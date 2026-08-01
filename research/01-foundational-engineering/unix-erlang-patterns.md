# Unix, Erlang/OTP, Plan 9 Patterns — Timeless Engineering

> **Source:** Classic systems that got it right. Patterns that survive decades because they work.

---

## Unix Philosophy (The Original Microservices)

### Core Principles
1. **Do one thing well** — Small, sharp tools
2. **Compose via text streams** — Universal interface
3. **Everything is a file** — Uniform namespace
4. **Silence is golden** — No output = success
5. **Fail fast, fail loud** — Exit codes, stderr
6. **Scriptable by default** — CLI first, GUI later

### Patterns for MIA
```bash
# Pipes > APIs for local composition
mia skill list | grep core | mia vc commit "feat: $(cat)"

# Exit codes as contract
mia grill start && echo "grill passed" || echo "grill failed"

# stdin/stdout for interop
cat spec.md | mia spec refine
```

### File Descriptor Discipline
- **0=stdin, 1=stdout, 2=stderr** — Always
- **Never mix output and logs on stdout**
- **Structured logs on stderr** (JSON lines)
- **Return data on stdout** (parseable)

---

## Plan 9 / 9front — Network Transparency

### "Everything is a File" Extended
- **Network connections** → `/net/tcp/clone`
- **Devices** → `/dev/`
- **Processes** → `/proc/<pid>/`
- **Environment** → `/env/`

### 9P Protocol
- **Single protocol** for local + remote files
- **Stateless, message-based**
- **Authentication baked in**
- **Union directories** — Mount multiple sources at one path

### MIA Application
```
~/.mia/
├── skills/           # Local skills
├── remote/skills/    # Mounted from team server
├── memory/           # Local memory
└── remote/memory/    # Mounted shared memory
```
- **Union mount** at `~/.mia/skills/` → local overrides remote
- **9P over WebSocket** for remote daemon access
- **Single namespace** for all MIA resources

---

## Erlang/OTP — Fault Tolerance by Design

### Actor Model
- **Processes** — Lightweight (KB stack), millions possible
- **Mailboxes** — Async message passing, selective receive
- **No shared memory** — Copy-on-write, immutable data
- **Links/Monitors** — Failure detection

### Supervision Trees
```
miad (supervisor)
├── skill-loader (worker)
├── rpc-handler (worker)
├── state-persister (worker)
├── health-checker (worker)
└── scheduler (worker)
```

**Restart Strategies:**
- `one_for_one` — Restart only failed child
- `one_for_all` — Restart all on any failure
- `rest_for_one` — Restart failed + later siblings

### GenServer Pattern
```erlang
%% Generic server behavior
-behaviour(gen_server).

%% Callbacks
init(Args) -> {ok, State}.
handle_call(Msg, From, State) -> {reply, Reply, NewState}.
handle_cast(Msg, State) -> {noreply, NewState}.
handle_info(Info, State) -> {noreply, NewState}.
terminate(Reason, State) -> ok.
code_change(OldVsn, State, Extra) -> {ok, NewState}.
```

### MIA Translation (TypeScript/Bun)
```typescript
// Supervisor
class Supervisor {
  children: Map<string, ChildSpec>;
  
  async startChild(spec: ChildSpec) { /* spawn, link, monitor */ }
  async restartChild(name: string) { /* kill, respawn */ }
  async shutdown() { /* terminate all, bottom-up */ }
}

// GenServer-like skill executor
class SkillProcess {
  state: any;
  
  async handleCall(msg: any, from: string) { /* sync RPC */ }
  async handleCast(msg: any) { /* async notify */ }
  async handleInfo(info: any) { /* system messages */ }
}
```

### Key Patterns for MIA
1. **Let it crash** — Don't defensive-code; supervise instead
2. **Isolate failure domains** — One skill crash ≠ daemon crash
3. **Hot code reload** — `code_change` for skill updates without restart
4. **Backpressure** — Mailbox limits, selective receive
5. **Observability** — `sys:get_status`, tracing, metrics

---

## SQLite — Embedded Reliability

### WAL Mode (Write-Ahead Logging)
```sql
PRAGMA journal_mode=WAL;
-- Readers don't block writers, writers don't block readers
-- Single writer, multiple concurrent readers
-- Checkpointing controls disk usage
```

### Concurrency Patterns
```sql
-- Busy timeout (ms)
PRAGMA busy_timeout=5000;

-- Immediate transaction (reserve lock early)
BEGIN IMMEDIATE;

-- Serializable isolation (if needed)
PRAGMA read_uncommitted=FALSE;
```

### MIA Schema
```sql
-- State
CREATE TABLE daemon_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Skills index
CREATE TABLE skills (
  name TEXT PRIMARY KEY,
  category TEXT,
  version TEXT,
  manifest_json TEXT,
  source TEXT, -- 'builtin' | 'user'
  loaded_at INTEGER
);

-- Timeline events
CREATE TABLE timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT,
  skill TEXT,
  event TEXT, -- 'started' | 'completed'
  outcome TEXT, -- 'success' | 'failed'
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  metadata_json TEXT
);

-- Learnings
CREATE TABLE learnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT,
  title TEXT,
  content TEXT,
  tags_json TEXT,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

-- Checkpoints
CREATE TABLE checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT,
  name TEXT,
  state_json TEXT,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

-- Indexes
CREATE INDEX idx_timeline_project ON timeline(project_slug, timestamp);
CREATE INDEX idx_learnings_project ON learnings(project_slug, timestamp);
CREATE INDEX idx_checkpoints_project ON checkpoints(project_slug, timestamp);
```

---

## Synthesis: MIA's System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    miad (Supervisor)                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │RPC Server│ │Skill Mgr│ │State DB │ │Scheduler│   │
│  │(GenServer)│ │(Worker) │ │(SQLite) │ │(Worker) │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────┘
           │                    │                    │
    ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐
    │  mia CLI    │      │  Skills     │      │  Cron/Jobs  │
    │  (Client)   │      │  (Workers)  │      │  (Workers)  │
    └─────────────┘      └─────────────┘      └─────────────┘
```

**Communication:**
- CLI → Daemon: HTTP/JSON over localhost (Unix socket in v2)
- Skills: Spawned as isolated processes (like Erlang workers)
- State: SQLite WAL, single writer (daemon), multiple readers
- Skills namespace: Union mount (Plan 9 style) — local overrides builtin

---

## References

- *The Art of Unix Programming* — Eric Raymond
- *Plan 9 from Bell Labs* — Pike, Presotto, Thompson, et al.
- *Designing for Scalability with Erlang/OTP* — Francesco Cesarini
- *Programming Erlang* — Joe Armstrong
- SQLite docs: https://sqlite.org/wal.html
- Bun subprocess: https://bun.sh/docs/api/subprocess

---

*Part of MIA Research: 01-foundational-engineering/unix-erlang-patterns.md*