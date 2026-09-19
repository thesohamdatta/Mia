import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions|context|rules)/i,
  /you\s+are\s+now\s+/i,
  /always\s+output\s+no\s+findings/i,
  /skip\s+(all\s+)?(security|review|checks)/i,
  /override[:\\s]/i,
  /\\bsystem\\s*:/i,
  /\\bassistant\\s*:/i,
  /\\buser\\s*:/i,
  /\\bhuman\\s*:/i,
  /disregard\\s+(all\\s+)?(previous|above|prior)/i,
  /from\\s+now\\s+on\\b/i,
  /do\\s+not\\s+(report|flag|mention)/i,
  /approve\\s+(all|every|this)/i,
];

export function hasInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

export function firstInjectionMatch(text: string): RegExp | null {
  return INJECTION_PATTERNS.find((p) => p.test(text)) ?? null;
}

export function sanitizeForStorage(text: string): string {
  const match = firstInjectionMatch(text);
  if (match) {
    return `[INJECTION REJECTED: ${match.source}]`;
  }
  return text;
}

export function appendJsonl<T>(path: string, obj: T): void {
  mkdirSync(dirname(path), { recursive: true });

  const sanitized = sanitizeObject(obj);
  const line = JSON.stringify(sanitized);

  if (line.includes('\n')) {
    throw new Error('jsonl-store: record serialized to multiple lines (embedded newline)');
  }

  appendFileSync(path, `${line}\n`, { encoding: 'utf-8' });
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeForStorage(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result;
  }
  return obj;
}

export function readJsonl<T = unknown>(path: string): T[] {
  if (!existsSync(path)) return [];

  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch {
    return [];
  }

  const out: T[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as T);
    } catch {
      // Skip malformed lines
    }
  }
  return out;
}

/**
 * Reads the tail (most recent entries) from a JSONL file by iterating backwards from the end.
 * Lazy JSON parsing and early termination reduce time complexity from O(N) full file parse to O(K)
 * where K is the requested limit of matching records.
 */
export function readJsonlTail<T = unknown>(
  path: string,
  limit: number,
  filter?: (item: T) => boolean
): T[] {
  if (!existsSync(path) || limit <= 0) return [];

  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch {
    return [];
  }

  const out: T[] = [];
  const lines = raw.split('\n');
  // Iterate backwards from the end of the file to parse only the most recent entries
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as T;
      if (!filter || filter(parsed)) {
        out.push(parsed);
        if (out.length >= limit) break;
      }
    } catch {
      // Skip malformed lines
    }
  }
  return out;
}
