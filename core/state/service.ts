import { execSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { getMemoryFile, getProjectsDir, getSessionsDir } from '../config/paths.js';
import { appendJsonl, readJsonl } from './jsonl-store.js';
import type {
  CheckpointStore,
  LearningStore,
  MemoryStore,
  SessionStore,
  StateService,
  TimelineStore,
} from './store.js';
import type { Checkpoint, Learning, TimelineEvent } from './types.js';

function projectDir(slug: string): string {
  return join(getProjectsDir(), slug);
}

function learningsPath(slug: string): string {
  return join(projectDir(slug), 'learnings.jsonl');
}

function timelinePath(slug: string): string {
  return join(projectDir(slug), 'timeline.jsonl');
}

function checkpointsDir(slug: string): string {
  return join(projectDir(slug), 'checkpoints');
}

function checkpointFile(slug: string, ts: string): string {
  const filename = `${ts.replace(/[:.]/g, '-')}.md`;
  return join(checkpointsDir(slug), filename);
}

function sessionsDir(): string {
  return getSessionsDir();
}

function sessionFile(sessionId: string): string {
  return join(sessionsDir(), sessionId);
}

function ensureProjectDir(slug: string): string {
  const dir = projectDir(slug);
  mkdirSync(dir, { recursive: true });
  mkdirSync(checkpointsDir(slug), { recursive: true });
  return dir;
}

export function getSlug(cwd?: string): string {
  const targetCwd = cwd || process.cwd();
  try {
    const toplevel = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      cwd: targetCwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const name = toplevel.split(/[\\/]/).pop();
    return name || 'default';
  } catch {
    return 'default';
  }
}

export async function ensureProject(slug: string): Promise<string> {
  ensureProjectDir(slug);
  return projectDir(slug);
}

// Learning Store Implementation
export class JsonlLearningStore implements LearningStore {
  async append(slug: string, learning: Learning): Promise<void> {
    ensureProjectDir(slug);
    appendJsonl(learningsPath(slug), learning);
  }

  async list(slug: string, limit = 50): Promise<Learning[]> {
    const path = learningsPath(slug);
    if (!existsSync(path)) return [];
    const all = readJsonl<Learning>(path);
    return all.slice(-limit).reverse();
  }

  async search(slug: string, query: string): Promise<Learning[]> {
    const path = learningsPath(slug);
    if (!existsSync(path)) return [];
    const all = readJsonl<Learning>(path);
    const lowerQuery = query.toLowerCase();
    return all
      .filter(
        (l) =>
          l.insight.toLowerCase().includes(lowerQuery) ||
          l.key.toLowerCase().includes(lowerQuery) ||
          l.files?.some((f) => f.toLowerCase().includes(lowerQuery))
      )
      .reverse();
  }
}

// Timeline Store Implementation
export class JsonlTimelineStore implements TimelineStore {
  async append(slug: string, event: TimelineEvent): Promise<void> {
    ensureProjectDir(slug);
    appendJsonl(timelinePath(slug), event);
  }

  async list(slug: string, limit = 30): Promise<TimelineEvent[]> {
    const path = timelinePath(slug);
    if (!existsSync(path)) return [];
    const all = readJsonl<TimelineEvent>(path);
    return all.slice(-limit).reverse();
  }
}

// Checkpoint Store Implementation
export class JsonlCheckpointStore implements CheckpointStore {
  async save(slug: string, cp: Checkpoint): Promise<void> {
    ensureProjectDir(slug);
    const path = checkpointFile(slug, cp.ts);
    const content = `---\nts: ${cp.ts}\nbranch: ${cp.branch}\nphase: ${cp.phase}\n---\n\n## Summary\n${cp.summary}\n\n## Remaining\n${cp.remaining.map((r) => `- [ ] ${r}`).join('\n')}\n\n## Files\n${cp.files.map((f) => `- ${f}`).join('\n')}\n`;
    writeFileSync(path, content, 'utf-8');
  }

  async list(slug: string): Promise<Checkpoint[]> {
    const dir = checkpointsDir(slug);
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse();
    return files.map((f) => {
      const path = join(dir, f);
      const content = readFileSync(path, 'utf-8');
      const tsMatch = content.match(/^ts:\s*(.+)$/m);
      const branchMatch = content.match(/^branch:\s*(.+)$/m);
      const phaseMatch = content.match(/^phase:\s*(.+)$/m);
      const summaryMatch = content.match(/## Summary\n([\s\S]*?)\n##/);
      const remainingMatch = content.match(/## Remaining\n([\s\S]*?)\n##/);
      const filesMatch = content.match(/## Files\n([\s\S]*)$/);

      return {
        ts: tsMatch?.[1] || '',
        branch: branchMatch?.[1] || '',
        phase: phaseMatch?.[1] || '',
        summary: summaryMatch?.[1]?.trim() || '',
        remaining:
          remainingMatch?.[1]
            ?.split('\n')
            .filter((l) => l.trim())
            .map((l) => l.replace(/^-\s*\[?\s*\]?\s*/, '')) || [],
        files:
          filesMatch?.[1]
            ?.split('\n')
            .filter((l) => l.trim())
            .map((l) => l.replace(/^-\s*/, '')) || [],
      };
    });
  }

  async load(slug: string, name: string): Promise<Checkpoint | null> {
    const path = join(checkpointsDir(slug), name);
    if (!existsSync(path)) return null;
    const content = readFileSync(path, 'utf-8');
    const tsMatch = content.match(/^ts:\s*(.+)$/m);
    const branchMatch = content.match(/^branch:\s*(.+)$/m);
    const phaseMatch = content.match(/^phase:\s*(.+)$/m);
    const summaryMatch = content.match(/## Summary\n([\s\S]*?)\n##/);
    const remainingMatch = content.match(/## Remaining\n([\s\S]*?)\n##/);
    const filesMatch = content.match(/## Files\n([\s\S]*)$/);

    return {
      ts: tsMatch?.[1] || '',
      branch: branchMatch?.[1] || '',
      phase: phaseMatch?.[1] || '',
      summary: summaryMatch?.[1]?.trim() || '',
      remaining:
        remainingMatch?.[1]
          ?.split('\n')
          .filter((l) => l.trim())
          .map((l) => l.replace(/^-\s*\[?\s*\]?\s*/, '')) || [],
      files:
        filesMatch?.[1]
          ?.split('\n')
          .filter((l) => l.trim())
          .map((l) => l.replace(/^-\s*/, '')) || [],
    };
  }
}

// Memory Store Implementation
export class JsonlMemoryStore implements MemoryStore {
  async read(): Promise<string> {
    const path = getMemoryFile();
    if (!existsSync(path)) {
      return '# MIA Long-Term Memory\n\n_Curated wisdom, distilled from daily notes._\n';
    }
    return readFileSync(path, 'utf-8');
  }

  async append(section: string): Promise<void> {
    const path = getMemoryFile();
    mkdirSync(dirname(path), { recursive: true });
    const timestamp = new Date().toISOString();
    appendFileSync(path, `\n## ${timestamp}\n\n${section}\n`, 'utf-8');
  }
}

// Session Store Implementation
export class JsonlSessionStore implements SessionStore {
  async touch(sessionId: string): Promise<void> {
    mkdirSync(sessionsDir(), { recursive: true });
    writeFileSync(sessionFile(sessionId), new Date().toISOString(), 'utf-8');
  }

  async listActive(maxAgeMs: number): Promise<string[]> {
    const dir = sessionsDir();
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir);
    const now = Date.now();
    return files.filter((f) => {
      try {
        const content = readFileSync(sessionFile(f), 'utf-8');
        const ts = new Date(content.trim()).getTime();
        return now - ts < maxAgeMs;
      } catch {
        return false;
      }
    });
  }

  async cleanup(maxAgeMs: number): Promise<void> {
    const dir = sessionsDir();
    if (!existsSync(dir)) return;
    const files = readdirSync(dir);
    const now = Date.now();
    for (const f of files) {
      try {
        const content = readFileSync(sessionFile(f), 'utf-8');
        const ts = new Date(content.trim()).getTime();
        if (now - ts >= maxAgeMs) {
          // Could delete here, but leaving for manual cleanup
        }
      } catch {
        // Ignore
      }
    }
  }
}

// State Service Composition
export function createStateService(): StateService {
  return {
    learnings: new JsonlLearningStore(),
    timeline: new JsonlTimelineStore(),
    checkpoints: new JsonlCheckpointStore(),
    memory: new JsonlMemoryStore(),
    sessions: new JsonlSessionStore(),
    getSlug,
    ensureProject,
  };
}
