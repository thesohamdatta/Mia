import { describe, expect, it } from 'bun:test';
import { formatHelp } from '../cli/help.js';
import { listSkills } from '../skills/index.js';

describe('CLI help', () => {
  it('lists every registered skill', () => {
    const help = formatHelp();

    for (const skill of listSkills()) {
      expect(help).toContain(`  ${skill}`);
    }
  });
});
