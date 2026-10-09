import {
  appendFileSync,
  closeSync,
  existsSync,
  fstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
} from 'node:fs';
import { dirname } from 'node:path';

export const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions|context|rules)/i,
  /you\s+are\s+now\s+/i,
  /always\s+output\s+no\s+findings/i,
  /skip\s+(all\s+)?(security|review|checks)/i,
  /override(?:\s|:)/i,
  /\b(?:system|assistant|user|human)\s*:/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /from\s+now\s+on\b/i,
  /do\s+not\s+(report|flag|mention)/i,
  /approve\s+(all|every|this)/i,
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
 * Reads recent JSONL records from the end of a file in bounded chunks.
 * Newlines are located at the byte level before UTF-8 decoding.
 */
export function readJsonlTail<T = unknown>(
  path: string,
  limit: number,
  filter?: (item: T) => boolean
): T[] {
  if (!existsSync(path) || limit <= 0) return [];

  let fd: number;
  try {
    fd = openSync(path, 'r');
  } catch {
    return [];
  }

  const out: T[] = [];
  const chunkSize = 64 * 1024;
  let position = 0;
  let remainder = Buffer.alloc(0);

  try {
    position = fstatSync(fd).size;
    while (position > 0 && out.length < limit) {
      const length = Math.min(chunkSize, position);
      position -= length;

      const chunk = Buffer.allocUnsafe(length);
      const bytesRead = readSync(fd, chunk, 0, length, position);
      const data = bytesRead === length ? chunk : chunk.subarray(0, bytesRead);
      const combined =
        remainder.length > 0
          ? Buffer.concat([data, remainder], data.length + remainder.length)
          : data;

      let lineEnd = combined.length;
      for (let i = combined.length - 1; i >= 0 && out.length < limit; i--) {
        if (combined[i] !== 0x0a) continue;
        parseLine(combined.subarray(i + 1, lineEnd));
        lineEnd = i;
      }

      remainder = Buffer.from(combined.subarray(0, lineEnd));
    }

    if (out.length < limit && remainder.length > 0) {
      parseLine(remainder);
    }
  } catch {
    return out;
  } finally {
    closeSync(fd);
  }

  return out;

  function parseLine(bytes: Buffer): void {
    const trimmed = bytes.toString('utf-8').trim();
    if (!trimmed) return;

    try {
      const parsed = JSON.parse(trimmed) as T;
      if (!filter || filter(parsed)) out.push(parsed);
    } catch {
      // Skip malformed records and continue looking for older entries.
    }
  }
}
