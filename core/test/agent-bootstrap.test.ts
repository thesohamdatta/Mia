import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateAgentSkillSurface } from '../agent/bootstrap.js';

describe('agent bootstrap', () => {
  it('generates only the selected public skills into an agent skill root', () => {
    const root = mkdtempSync(join(tmpdir(), 'mia-agent-bootstrap-'));
    try {
      generateAgentSkillSurface(root, { skills: ['plan', 'review', 'ship'] });

      expect(existsSync(join(root, 'plan', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(root, 'review', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(root, 'ship', 'SKILL.md'))).toBe(true);
      expect(existsSync(join(root, 'memory', 'SKILL.md'))).toBe(false);

      const plan = readFileSync(join(root, 'plan', 'SKILL.md'), 'utf8');
      expect(plan).toContain('name: plan');
      expect(plan).toContain('core/skills/index.ts');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not overwrite a foreign skill', () => {
    const root = mkdtempSync(join(tmpdir(), 'mia-agent-bootstrap-'));
    try {
      const foreign = join(root, 'plan');
      require('node:fs').mkdirSync(foreign, { recursive: true });
      writeFileSync(join(foreign, 'SKILL.md'), '---\\nname: foreign-plan\\n---\\n');

      generateAgentSkillSurface(root, { skills: ['plan'] });

      expect(readFileSync(join(foreign, 'SKILL.md'), 'utf8')).toContain('foreign-plan');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
