export interface Learning {
  ts: string;
  skill: string;
  type: 'pattern' | 'pitfall' | 'preference' | 'architecture' | 'tool';
  key: string;
  insight: string;
  confidence: number;
  source: 'observed' | 'user-stated' | 'inferred';
  files?: string[];
  domain?: 'engineering' | 'startup' | 'social' | 'film' | 'health' | 'learning';
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
  phase: string;
  summary: string;
  remaining: string[];
  files: string[];
}

export interface MemoryEntry {
  ts: string;
  text: string;
}

export interface ProjectSlug {
  slug: string;
  cwd: string;
}
