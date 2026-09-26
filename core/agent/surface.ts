import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSkill } from '../skills/index.js';
import type { SkillDefinition } from '../skills/types.js';

export const AGENT_SKILLS = ['plan', 'review', 'ship'] as const;

export type AgentSkillName = (typeof AGENT_SKILLS)[number];

export interface AgentSurfaceResult {
  generated: string[];
  skipped: string[];
}

const MANAGED_MARKER = '<!-- MIA-MANAGED-SKILL -->';

function commandForSkill(name: string): string {
  if (name === 'plan') return 'mia plan create "<objective>"';
  return `mia ${name}`;
}

function renderSkill(definition: SkillDefinition): string {
  const { manifest } = definition;

  return `---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
managed-by: mia
name: ${manifest.name}
description: "${manifest.description.replace(/"/g, '\\"')}"
version: ${manifest.version}
invocation: model
phase: ${manifest.phase}
side-effects: ${manifest.sideEffects}
---

# ${manifest.name}

Use MIA's **${manifest.name}** workflow for the current engineering task.

## Instructions

- Treat the user's current objective as the input.
- Use the existing MIA ${manifest.name} workflow; do not invent a parallel engineering process.
- Invoke the command shown below with the relevant objective or context.
- Preserve upstream decisions and artifacts when continuing an existing workflow.

## Command

\`${commandForSkill(manifest.name)}\`
- Report what was actually verified. Do not claim completion without evidence.

## Runtime authority

The executable definition in \`core/skills/index.ts\` is authoritative. This file is a generated agent-facing adapter.

## Contract

- Phase: ${manifest.phase}
- Side effects: ${manifest.sideEffects}
- Verification: ${manifest.verification.length > 0 ? manifest.verification.join(', ') : 'none'}
`;
}

export async function generateAgentSkillSurface(
  destination: string,
  skillNames: readonly string[] = AGENT_SKILLS
): Promise<AgentSurfaceResult> {
  const generated: string[] = [];
  const skipped: string[] = [];

  for (const skillName of skillNames) {
    const definition = getSkill(skillName);
    if (!definition) {
      throw new Error(`Unknown MIA skill: ${skillName}`);
    }

    const skillDir = join(destination, skillName);
    const skillPath = join(skillDir, 'SKILL.md');

    let existing: string | null = null;
    try {
      existing = await readFile(skillPath, 'utf8');
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
        throw error;
      }

      try {
        await stat(skillDir);
        skipped.push(skillName);
        continue;
      } catch (directoryError) {
        if (
          !(directoryError instanceof Error) ||
          !('code' in directoryError) ||
          directoryError.code !== 'ENOENT'
        ) {
          throw directoryError;
        }
      }
    }

    if (existing !== null && !existing.includes(MANAGED_MARKER)) {
      skipped.push(skillName);
      continue;
    }

    await mkdir(skillDir, { recursive: true });
    await writeFile(skillPath, renderSkill(definition), 'utf8');
    generated.push(skillName);
  }

  return { generated, skipped };
}
