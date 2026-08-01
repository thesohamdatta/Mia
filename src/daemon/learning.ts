// MIA Learning Layer - State persistence for sessions, learnings, and timeline
// Part of the daemon (miad) - manages ~/.mia/projects/{slug}/

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();
const MIA_DIR = join(HOME, '.mia');
const PROJECTS_DIR = join(MIA_DIR, 'projects');

// ─── Types ───────────────────────────────────────────────────────────────

export interface Learning {
  ts: string; // ISO timestamp
  skill: string; // which skill produced this
  type: 'pattern' | 'pitfall' | 'preference' | 'architecture' | 'tool';
  key: string; // unique key for dedup (e.g. "n-plus-one-query")
  insight: string; // the lesson, one sentence
  confidence: number; // 1-10, decays 1pt/30d
  source: 'observed' | 'user-stated' | 'inferred';
  files?: string[]; // relevant file paths
}

export interface TimelineEvent {
  ts: string;
  skill: string;
  event: 'started' | 'completed' | 'failed' | 'decision';
  branch?: string;
  outcome?: string;
}

export interface Checkpoint {
  ts: string;
  branch: string;
  phase: string; // what phase of work
  summary: string; // what was done so far
  remaining: string[]; // what's left to do
  files: string[]; // files touched
}

// ─── Path helpers ────────────────────────────────────────────────────────

export function projectDir(slug: string): string {
  return join(PROJECTS_DIR, slug);
}

export function learningsPath(slug: string): string {
  return join(projectDir(slug), 'learnings.jsonl');
}

export function timelinePath(slug: string): string {
  return join(projectDir(slug), 'timeline.jsonl');
}

export function checkpointsPath(slug: string): string {
  return join(projectDir(slug), 'checkpoints');
}

// ─── Slug ────────────────────────────────────────────────────────────────

export function getSlug(): string {
  // Try git toplevel, fall back to "default"
  try {
    const { execSync } = require('node:child_process');
    const toplevel = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
    const name = toplevel.split(/[\\/]/).pop();
    return name || 'default';
  } catch {
    return 'default';
  }
}

// ─── Ensure directories ──────────────────────────────────────────────────

export function ensureProject(slug: string): string {
  const dir = projectDir(slug);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, 'checkpoints'), { recursive: true });
  }
  return dir;
}

// ─── Append (write) ───────────────────────────────────────────────────────

export function appendLearning(slug: string, learning: Learning): void {
  ensureProject(slug);
  appendFileSync(learningsPath(slug), `${JSON.stringify(learning)}\n`, 'utf-8');
}

export function appendTimeline(slug: string, event: TimelineEvent): void {
  ensureProject(slug);
  appendFileSync(timelinePath(slug), `${JSON.stringify(event)}\n`, 'utf-8');
}

export function saveCheckpoint(slug: string, cp: Checkpoint): void {
  ensureProject(slug);
  const filename = `${cp.ts.replace(/[:.]/g, '-')}.md`;
  const path = join(checkpointsPath(slug), filename);
  const content = `---
ts: ${cp.ts}
branch: ${cp.branch}
phase: ${cp.phase}
---

## Summary
${cp.summary}

## Remaining
${cp.remaining.map((r) => `- [ ] ${r}`).join('\n')}

## Files
${cp.files.map((f) => `- ${f}`).join('\n')}
`;
  writeFileSync(path, content, 'utf-8');
}

// ─── Read (query) ────────────────────────────────────────────────────────

export function readLearnings(slug: string, limit = 50): Learning[] {
  const path = learningsPath(slug);
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean);
  const all = lines.map((l) => JSON.parse(l) as Learning);
  // Sort by confidence (decayed), return top N
  return all.slice(-limit).reverse();
}

export function readTimeline(slug: string, limit = 30): TimelineEvent[] {
  const path = timelinePath(slug);
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean);
  return lines
    .slice(-limit)
    .map((l) => JSON.parse(l) as TimelineEvent)
    .reverse();
}

export function listCheckpoints(slug: string): string[] {
  const dir = checkpointsPath(slug);
  if (!existsSync(dir)) return [];
  const { readdirSync } = require('node:fs');
  return readdirSync(dir)
    .filter((f: string) => f.endsWith('.md'))
    .sort()
    .reverse();
}

// ─── Confidence decay ────────────────────────────────────────────────────

export function decayedConfidence(learning: Learning): number {
  const ageDays = (Date.now() - new Date(learning.ts).getTime()) / (1000 * 60 * 60 * 24);
  const decay = Math.floor(ageDays / 30); // 1pt per 30 days
  return Math.max(1, learning.confidence - decay);
}

// ─── Memory (global, like OpenClaw's MEMORY.md) ──────────────────────────

export function memoryPath(): string {
  return join(MIA_DIR, 'memory.md');
}

export function ensureMemory(): void {
  if (!existsSync(memoryPath())) {
    writeFileSync(
      memoryPath(),
      '# MIA Long-Term Memory\n\n_Curated wisdom, distilled from daily notes._\n',
      'utf-8'
    );
  }
}

export function readMemory(): string {
  ensureMemory();
  return readFileSync(memoryPath(), 'utf-8');
}

export function appendMemory(section: string): void {
  ensureMemory();
  const timestamp = new Date().toISOString();
  appendFileSync(memoryPath(), `\n## ${timestamp}\n\n${section}\n`, 'utf-8');
}
