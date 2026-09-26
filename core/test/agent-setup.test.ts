import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AGENT_HOSTS, setupAgentSkills } from '../agent/setup.js';

describe('MIA agent setup', () => {
  it('installs the public skill surface for the supported hosts', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'mia-setup-'));

    const result = await setupAgentSkills(projectRoot);

    expect(result).toEqual({
      claude: { generated: ['plan', 'review', 'ship'], skipped: [] },
      codex: { generated: ['plan', 'review', 'ship'], skipped: [] },
    });

    for (const [hostName, host] of Object.entries(AGENT_HOSTS)) {
      for (const skill of ['plan', 'review', 'ship']) {
        const file = await readFile(join(projectRoot, host.skillRoot, skill, 'SKILL.md'), 'utf8');
        expect(file).toContain('managed-by: mia');
        expect(result[hostName as keyof typeof result].generated).toContain(skill);
      }
    }
  });

  it('reports unmanaged collisions without overwriting them', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'mia-setup-'));

    const collision = join(projectRoot, '.agents', 'skills', 'plan', 'SKILL.md');
    await mkdir(join(projectRoot, '.agents', 'skills', 'plan'), { recursive: true });
    await writeFile(collision, 'foreign skill', 'utf8');

    const result = await setupAgentSkills(projectRoot);

    expect(result.codex.skipped).toEqual(['plan']);
    expect(result.codex.generated).toEqual(['review', 'ship']);
    expect(result.claude.generated).toEqual(['plan', 'review', 'ship']);
    expect(await readFile(collision, 'utf8')).toBe('foreign skill');
  });
});
