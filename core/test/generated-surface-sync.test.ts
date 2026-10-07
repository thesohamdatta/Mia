import { describe, expect, it } from 'bun:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AGENT_SKILLS, generateAgentSkillSurface } from '../agent/surface.js';

const ROOT = join(import.meta.dir, '..', '..');
const read = (path: string) => readFile(join(ROOT, path), 'utf8');

describe('generated agent surfaces match the executable registry', () => {
  it('keeps checked-in Claude and Codex adapters in sync with the generator', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-surface-sync-'));

    await generateAgentSkillSurface(destination, AGENT_SKILLS);

    for (const skill of AGENT_SKILLS) {
      const generated = await readFile(join(destination, skill, 'SKILL.md'), 'utf8');

      expect(await read(join('.agents', 'skills', skill, 'SKILL.md'))).toBe(generated);
      expect(await read(join('.claude', 'skills', skill, 'SKILL.md'))).toBe(generated);
    }
  });
});
