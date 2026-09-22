import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skills } from '../skills/index.js';
import type { SkillDefinition } from '../skills/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(ROOT, 'docs', 'skills');

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function render(data: Record<string, unknown>): string {
  const template = `---
type: skill
scope: project
status: active
owner: runtime
canonical: false
audience: agent
load: on-demand
name: {{SKILL_NAME}}
version: {{VERSION}}
invocation: {{INVOCATION}}
phase: {{PHASE}}
side-effects: {{SIDE_EFFECTS}}
---

# {{SKILL_NAME}}

{{DESCRIPTION}}

## Invocation

{{WHEN_TO_INVOKE}}

## Contract

- Phase: {{PHASE}}
- Invocation: {{INVOCATION}}
- Side effects: {{SIDE_EFFECTS}}
- Verification: {{VERIFICATION}}

## Runtime authority

The executable definition in \`core/skills/index.ts\` is authoritative. This page is generated documentation.

## Workflow

{{WORKFLOW}}

---

*Generated from the executable skill registry.*`;
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, Array.isArray(value) ? value.join('\n') : String(value));
  }


  return result;
}

function skillData([name, definition]: [string, SkillDefinition]): Record<string, unknown> {
  const manifest = definition.manifest;
  return {
    SKILL_NAME: manifest.name,
    VERSION: manifest.version,
    DESCRIPTION: manifest.description,
    ALLOWED_TOOLS: manifest.allowedTools,
    SIDE_EFFECTS: manifest.sideEffects,
    VERIFICATION: manifest.verification,
    PHASE: manifest.phase,
    INVOCATION: manifest.invocation ?? 'user',
    PREAMBLE: '',
    WHEN_TO_INVOKE: manifest.invocation === 'model' || manifest.invocation === 'both'
      ? 'Available to model-triggered workflows when the task matches this skill.'
      : 'Explicitly invoked by the user through the MIA CLI.',
    WORKFLOW: `Phase: ${manifest.phase}`,
  };
}

function main(): void {
  ensureDir(OUTPUT_DIR);

  for (const entry of Object.entries(skills)) {
    const data = skillData(entry);
    const output = render(data);
    const outPath = join(OUTPUT_DIR, `${data.SKILL_NAME}.md`);
    writeFileSync(outPath, output, 'utf8');
    console.log(`Generated: ${outPath}`);
  }

  console.log(`\\nDone. Generated ${Object.keys(skills).length} skill docs from core/skills/index.ts.`);
}

main();
