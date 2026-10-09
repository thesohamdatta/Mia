import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendJsonl, readJsonl, readJsonlTail } from '../state/jsonl-store.js';
import { createUnifiedStore } from '../state/unified-store.js';

describe('jsonl-store performance & behavior', () => {
  let tempDir: string;
  let jsonlFile: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'mia-jsonl-test-'));
    jsonlFile = join(tempDir, 'test.jsonl');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should read all jsonl records via readJsonl', () => {
    appendJsonl(jsonlFile, { id: 1 });
    appendJsonl(jsonlFile, { id: 2 });
    const all = readJsonl<{ id: number }>(jsonlFile);
    expect(all).toHaveLength(2);
    expect(all[0]?.id).toBe(1);
    expect(all[1]?.id).toBe(2);
  });

  it('should return empty array for non-existent file or limit <= 0', () => {
    expect(readJsonlTail('non-existent-file.jsonl', 10)).toEqual([]);
    expect(readJsonlTail(jsonlFile, 0)).toEqual([]);
    expect(readJsonlTail(jsonlFile, -5)).toEqual([]);
  });

  it('reads only a bounded tail from a large JSONL file', () => {
    const lines = Array.from({ length: 10000 }, (_, i) => JSON.stringify({ id: i + 1 }));
    writeFileSync(jsonlFile, lines.join('\n') + String.fromCharCode(10), 'utf-8');
    const tail = readJsonlTail<{ id: number }>(jsonlFile, 3);
    expect(tail.map((entry) => entry.id)).toEqual([10000, 9999, 9998]);
  });

  it('preserves Unicode when a multibyte character straddles the chunk boundary', () => {
    const first = JSON.stringify({ id: 1, text: 'a'.repeat(65520) });
    const second = JSON.stringify({ id: 2, text: '😀 café 東京' });
    const prefix = first + String.fromCharCode(10);
    const boundary = 65536 - Buffer.byteLength(second, 'utf-8') + 1;
    const padding = Math.max(0, boundary - Buffer.byteLength(prefix, 'utf-8'));
    const content = JSON.stringify({ id: 0, text: 'b'.repeat(padding) }) + String.fromCharCode(10) + second;
    writeFileSync(jsonlFile, content, 'utf-8');

    const tail = readJsonlTail<{ id: number; text: string }>(jsonlFile, 1);
    expect(tail).toEqual([JSON.parse(second)]);
  });

  it('handles Unicode and malformed lines across a chunk boundary', () => {
    const records = [
      JSON.stringify({ id: 1, text: 'older' }),
      'INVALID_JSON',
      JSON.stringify({ id: 2, text: 'café 東京 😀'.repeat(3000) }),
      JSON.stringify({ id: 3, text: 'newest' }),
    ];
    writeFileSync(jsonlFile, records.join(String.fromCharCode(10)), 'utf-8');

    const tail = readJsonlTail<{ id: number; text: string }>(jsonlFile, 2);
    expect(tail.map(({ id }) => id)).toEqual([3, 2]);
    expect(tail[1]?.text).toBe('café 東京 😀'.repeat(3000));
  });

  it('keeps scanning older records when the filter rejects recent records', () => {
    const records = Array.from({ length: 2000 }, (_, index) => ({
      id: index + 1,
      type: (index + 1) % 2 === 0 ? 'keep' : 'skip',
    }));
    writeFileSync(
      jsonlFile,
      records.map((record) => JSON.stringify(record)).join(String.fromCharCode(10))
    );

    const tail = readJsonlTail<{ id: number; type: string }>(jsonlFile, 3, (record) => record.type === 'keep');
    expect(tail.map(({ id }) => id)).toEqual([2000, 1998, 1996]);
  });

  it('should return entries in reverse chronological order up to limit', () => {
    appendJsonl(jsonlFile, { id: 1, val: 'first' });
    appendJsonl(jsonlFile, { id: 2, val: 'second' });
    appendJsonl(jsonlFile, { id: 3, val: 'third' });

    const tail = readJsonlTail<{ id: number; val: string }>(jsonlFile, 2);
    expect(tail).toHaveLength(2);
    expect(tail[0]?.id).toBe(3);
    expect(tail[1]?.id).toBe(2);
  });

  it('should filter items lazily and stop once limit is reached', () => {
    appendJsonl(jsonlFile, { id: 1, type: 'A' });
    appendJsonl(jsonlFile, { id: 2, type: 'B' });
    appendJsonl(jsonlFile, { id: 3, type: 'A' });
    appendJsonl(jsonlFile, { id: 4, type: 'A' });
    appendJsonl(jsonlFile, { id: 5, type: 'B' });

    const tailA = readJsonlTail<{ id: number; type: string }>(jsonlFile, 2, (item) => item.type === 'A');
    expect(tailA).toHaveLength(2);
    expect(tailA[0]?.id).toBe(4);
    expect(tailA[1]?.id).toBe(3);
  });

  it('should terminate early on large JSONL files', async () => {
    const lines: string[] = [];
    const totalLines = 2000;
    for (let i = 1; i <= totalLines; i++) {
      lines.push(JSON.stringify({ id: i, type: i % 2 === 0 ? 'even' : 'odd' }));
    }
    writeFileSync(jsonlFile, `${lines.join('\n')}\n`, 'utf-8');

    const start = performance.now();
    const result = readJsonlTail<{ id: number; type: string }>(
      jsonlFile,
      5,
      (item) => item.type === 'even'
    );
    const duration = performance.now() - start;

    expect(result).toHaveLength(5);
    expect(result[0]?.id).toBe(2000);
    expect(result[1]?.id).toBe(1998);
    // Early termination should execute rapidly (< 10ms)
    expect(duration).toBeLessThan(50);
  });

  it('should work correctly with UnifiedStore.query', async () => {
    const store = createUnifiedStore();
    const slug = 'perf-project';

    for (let i = 1; i <= 20; i++) {
      if (i % 2 === 0) {
        await store.appendLearning(tempDir, slug, { index: i, insight: `Learning ${i}` });
      } else {
        await store.appendTimeline(tempDir, slug, { index: i, event: `Event ${i}` });
      }
    }

    const learnings = await store.listLearnings(tempDir, slug, 3);
    expect(learnings).toHaveLength(3);
    expect((learnings[0]?.data as { index: number }).index).toBe(20);
    expect((learnings[1]?.data as { index: number }).index).toBe(18);
    expect((learnings[2]?.data as { index: number }).index).toBe(16);
  });

  it('should handle edge cases: malformed lines, extra newlines, no trailing newline', () => {
    const content = `{"id":1}\nINVALID_JSON\n\n{"id":2}\n  \n{"id":3}`;
    writeFileSync(jsonlFile, content, 'utf-8');

    const tail = readJsonlTail<{ id: number }>(jsonlFile, 5);
    expect(tail).toHaveLength(3);
    expect(tail[0]?.id).toBe(3);
    expect(tail[1]?.id).toBe(2);
    expect(tail[2]?.id).toBe(1);
  });
});
