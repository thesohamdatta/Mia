import { describe, expect, it } from 'bun:test';
import pkg from '../../package.json' with { type: 'json' };
import { formatHelp } from '../cli/help.js';
import { listSkills } from '../skills/index.js';
import { MIA_VERSION } from '../version.js';

describe('CLI help', () => {
  it('lists every registered skill', () => {
    const help = formatHelp();

    for (const skill of listSkills()) {
      expect(help).toContain(`  ${skill}`);
    }
  });

  it('reports the package version, so a release cannot leave it stale', () => {
    expect(MIA_VERSION).toBe(pkg.version);
    expect(formatHelp()).toContain(`Version: ${pkg.version}`);
  });
});
