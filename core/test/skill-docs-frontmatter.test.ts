import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { listSkillDefinitions } from '../skills/index.js';

const ROOT = join(import.meta.dir, '..', '..');

interface SkillDocFrontmatter {
  name?: string;
  version?: string;
  phase?: string;
  'side-effects'?: string;
  invocation?: string;
}

describe('generated skill docs frontmatter', () => {
  it('keeps the contract frontmatter aligned with the executable registry', () => {
    for (const { manifest } of listSkillDefinitions()) {
      const source = readFileSync(join(ROOT, 'docs', 'skills', `${manifest.name}.md`), 'utf8');
      const { data } = matter(source) as unknown as { data: SkillDocFrontmatter };

      expect(data.name).toBe(manifest.name);
      expect(data.version).toBe(manifest.version);
      expect(data.phase).toBe(manifest.phase);
      expect(data['side-effects']).toBe(manifest.sideEffects);
      expect(data.invocation).toBe(manifest.invocation ?? 'user');
    }
  });
});
