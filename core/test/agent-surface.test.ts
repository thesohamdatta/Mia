import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import {
  AGENT_SKILLS,
  generateAgentSkillSurface,
} from '../agent/surface.js';

describe('gstack-style agent skill surface', () => {
  it('exposes only the small public MIA skill set by default', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-agent-surface-'));

    const result = await generateAgentSkillSurface(destination);

    expect(result.generated).toEqual([...AGENT_SKILLS]);
    expect(result.skipped).toEqual([]);

    for (const skill of AGENT_SKILLS) {
      const content = await readFile(join(destination, skill, 'SKILL.md'), 'utf8');
      expect(content).toContain('managed-by: mia');
      expect(content).toContain(`name: ${skill}`);
      expect(content).toContain('core/skills/index.ts');
      expect(content).toContain(`mia ${skill}`);
    }
  });

  it('does not expose internal skills such as memory', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-agent-surface-'));

    const result = await generateAgentSkillSurface(destination);

    expect(result.generated).not.toContain('memory');
    expect(result.generated).not.toContain('checkpoint');
    expect(result.generated).not.toContain('vc');
  });

  it('preserves an unmanaged existing skill instead of overwriting it', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-agent-surface-'));
    const planPath = join(destination, 'plan', 'SKILL.md');
    await writeFile(
      planPath,
      '---\nname: plan\ndescription: foreign skill\n---\n\nforeign content\n',
      'utf8'
    );

    const result = await generateAgentSkillSurface(destination);

    expect(result.skipped).toEqual(['plan']);
    expect(result.generated).toEqual(['review', 'ship']);
    expect(await readFile(planPath, 'utf8')).toContain('foreign content');
  });

  it('updates a previously managed skill when the canonical definition changes', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-agent-surface-'));

    await generateAgentSkillSurface(destination);
    const planPath = join(destination, 'plan', 'SKILL.md');

    const first = await readFile(planPath, 'utf8');
    expect(first).toContain('name: plan');

    const result = await generateAgentSkillSurface(destination, ['plan']);
    expect(result.generated).toEqual(['plan']);
    expect(result.skipped).toEqual([]);

    expect(await readFile(planPath, 'utf8')).toBe(first);
  });

  it('rejects an unknown skill name instead of generating an invalid adapter', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'mia-agent-surface-'));

    await expect(
      generateAgentSkillSurface(destination, ['does-not-exist'])
    ).rejects.toThrow(/Unknown MIA skill: does-not-exist/);
  });
});
