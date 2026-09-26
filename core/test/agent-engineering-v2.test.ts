import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

describe('Agent engineering contract', () => {
  it('keeps the v2 guide discoverable from the agent entrypoint', () => {
    expect(existsSync(join(ROOT, 'docs/core/agent-engineering-v2.md'))).toBe(true);
    expect(read('AGENTS.md')).toContain('docs/core/agent-engineering-v2.md');
  });

  it('keeps the guide centered on executable engineering constraints', () => {
    const guide = read('docs/core/agent-engineering-v2.md');
    for (const phrase of [
      'executable constraints',
      'acceptance signals',
      'bounded change surfaces',
      'observable outcomes',
      'continuous garbage collection',
      'autonomy earned',
    ]) {
      expect(guide).toContain(phrase);
    }
  });
});
