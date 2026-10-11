import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Review standard (docs/reference/review-standards.md): "Keep CLI, context,
// middleware, skills, state, config, and host adapters separated." A skill may
// depend on shared infrastructure (state, work, verification, root, agent) but
// not on a sibling skill's module — otherwise the two skills become one coupled
// unit and a change to one silently breaks the other.
//
// `../types.js` and `../executor.js` (shared within the skills package) are
// fine; `../<skill>/...` is not. Imports of shared infrastructure use `../../`
// and are not matched.
const CROSS_SKILL_IMPORT = /from\s+['"]\.\.\/([a-z0-9-]+)\//g;
const SKILLS_DIR = join(import.meta.dir, '..', 'skills');

describe('skill boundary', () => {
  it('does not import a sibling skill module from inside a skill', () => {
    const violations: string[] = [];

    for (const skill of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;

      for (const file of readdirSync(join(SKILLS_DIR, skill.name))) {
        if (!file.endsWith('.ts')) continue;

        const source = readFileSync(join(SKILLS_DIR, skill.name, file), 'utf8');
        for (const match of source.matchAll(CROSS_SKILL_IMPORT)) {
          if (match[1] !== skill.name) {
            violations.push(`${skill.name}/${file} imports ${match[1]}/`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
