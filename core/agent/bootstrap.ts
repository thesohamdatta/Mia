import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { skills } from '../skills/index.js';
import type { SkillDefinition } from '../skills/types.js';

export const AGENT_SKILLS = ['plan', 'review', 'ship'] as const;

export interface AgentSkillSurfaceOptions {
  skills?: readonly string[];
}

function renderSkill(definition: SkillDefinition): string {
  const m = definition.manifest;
  return [
    '---',
    'type: skill',
    'scope: project',
    'status: active',
    'owner: runtime',
    'canonical: false',
    'audience: agent',
    'load: on-demand',
    `name: ${m.name}`,
    `version: ${m.version}`,
    `invocation: ${m.invocation ?? 'user'}`,
    `phase: ${m.phase}`,
    `side-effects: ${m.sideEffects}`,
    '---',
    '',
    `# ${m.name}`,
    '',
    m.description,
    '',
    '## Runtime authority',
    '',
    'The executable definition in `core/skills/index.ts` is authoritative.',
    'This file is a generated agent-facing adapter.',
    '',
    '## Contract',
    '',
    `- Phase: ${m.phase}`,
    `- Invocation: ${m.invocation ?? 'user'}`,
    `- Side effects: ${m.sideEffects}`,
    `- Verification: ${m.verification.length ? m.verification.join(', ') : 'none'}`,
    '',
  ].join('\\n');
}

export function generateAgentSkillSurface(
  destination: string,
  options: AgentSkillSurfaceOptions = {}
): void {
  mkdirSync(destination, { recursive: true });
  const selected = options.skills ?? AGENT_SKILLS;

  for (const name of selected) {
    const definition = skills[name];
    if (!definition) throw new Error(`Unknown public agent skill: ${name}`);

    const dir = join(destination, name);
    const target = join(dir, 'SKILL.md');
    if (existsSync(target)) {
      const existing = readFileSync(target, 'utf8');
      if (!existing.includes('generated agent-facing adapter')) continue;
    }

    mkdirSync(dir, { recursive: true });
    writeFileSync(target, renderSkill(definition), 'utf8');
  }
}
