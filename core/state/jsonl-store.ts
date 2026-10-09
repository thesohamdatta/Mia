import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Patterns describe an injection *intent* (a verb plus its target), not a
// single keyword. Storing a note like "override the default port" must not be
// treated as an attack, so a lone "override"/"system:"/"approve this" is not
// enough on its own.
export const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|earlier|preceding)\s+(?:instructions|context|rules|prompts?|messages?)/i,
  /you\s+are\s+now\s+/i,
  /always\s+output\s+no\s+findings/i,
  /skip\s+(?:all\s+|any\s+|the\s+)?(?:security|review|checks|tests|verification)\b/i,
  /\boverride\b\s*:?\s*(?:all\s+|every\s+|any\s+|the\s+)?(?:instructions|prompts?|rules|checks?|safety|verification|review|ignore|disregard|approve|skip)/i,
  /\b(?:system|developer|assistant|human|user)\s*:\s*(?:ignore|disregard|approve|override|you\s+are|do\s+not|skip)/i,
  /disregard\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|earlier|preceding)\b/i,
  /from\s+now\s+on\s+(?:you|ignore|always|approve|skip|disregard)/i,
  /do\s+not\s+(?:report|flag|mention|include)\b/i,
  /approve\s+(?:all|every|any)\s+(?:changes?|requests?|prs?|pull)/i,
  /approve\s+(?:this|the)\s+(?:without|automatically|now|immediately|anyway)/i,
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
  let end = raw.length;

  // Optimize: Iterate backwards using lastIndexOf to slice lines on demand.
  // This avoids raw.split('\n') which allocates an O(N) array of all line strings in memory,
  // reducing memory allocations from O(N) to O(K) where K is the number of inspected tail entries.
  while (end > 0 && out.length < limit) {
    const start = raw.lastIndexOf('\n', end - 1);
    const line = start === -1 ? raw.slice(0, end) : raw.slice(start + 1, end);
    end = start;

    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const parsed = JSON.parse(trimmed) as T;
      if (!filter || filter(parsed)) {
        out.push(parsed);
      }
    } catch {
      // Skip malformed lines
    }
  }

  return out;
}
