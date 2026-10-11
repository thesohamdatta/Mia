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

interface SkillDocData {
  SKILL_NAME: string;
  VERSION: string;
  DESCRIPTION: string;
  ALLOWED_TOOLS: readonly string[];
  SIDE_EFFECTS: string;
  VERIFICATION: readonly string[];
  PHASE: string;
  INVOCATION: string;
  PREAMBLE: string;
  WHEN_TO_INVOKE: string;
  WORKFLOW: string;
}

function render(data: SkillDocData): string {
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

function skillData([_name, definition]: [string, SkillDefinition]): SkillDocData {
  const manifest = definition.manifest;
  return {
    SKILL_NAME: manifest.name,
    VERSION: manifest.version,
    DESCRIPTION: manifest.description,
    ALLOWED_TOOLS: manifest.allowedTools,
    SIDE_EFFECTS: manifest.sideEffects,
    VERIFICATION: manifest.verification.length > 0 ? manifest.verification : ['none'],
    PHASE: manifest.phase,
    INVOCATION: manifest.invocation ?? 'user',
    PREAMBLE: '',
    WHEN_TO_INVOKE:
      manifest.invocation === 'model' || manifest.invocation === 'both'
        ? 'Available to model-triggered workflows when the task matches this skill.'
        : 'Explicitly invoked by the user through the MIA CLI.',
    WORKFLOW: WORKFLOWS[manifest.name] ?? `Phase: ${manifest.phase}`,
  };
}

// Skills with a meaningful procedure get an explicit workflow line; the rest
// fall back to the phase name so the generated page stays accurate.
const WORKFLOWS: Record<string, string> = {
  factory:
    '1. Assess readiness with `mia factory readiness` before handing more work to agents.\n2. Route each task to the cheapest tier with `mia factory route`.\n3. Read outcome metrics with `mia factory metrics`.\n4. Inspect phases, loops, and roles with `mia factory map`.',
  grill:
    '1. Start the interview with `mia grill start`.\n2. Answer each design branch with `mia grill answer <decision>`.\n3. Resolve every question before planning.',
  plan: '1. Resolve the grill interview first.\n2. Run `mia plan create "<objective>"`.\n3. Review the written plan and its success criteria.',
  spec: '1. Shape the intent with `mia spec`.\n2. Record the specification before implementation.',
  ship: '1. Verify with `mia ship <workId>`.\n2. Ship only when verification and approval are present.',
  approve:
    '1. Review the ready_to_ship work with `mia approve --status <workId>`.\n2. Record the decision with `mia approve <workId> [note]`, or reject with `mia approve --reject <workId> <reason>`.',
  review: '1. Run `mia review <workId>`.\n2. Inspect the recorded evidence before landing.',
  health: '1. Run `mia health`.\n2. Inspect each recorded evidence record.',
};

function main(): void {
  ensureDir(OUTPUT_DIR);

  for (const entry of Object.entries(skills)) {
    const data = skillData(entry);
    const output = render(data);
    const outPath = join(OUTPUT_DIR, `${data.SKILL_NAME}.md`);
    writeFileSync(outPath, output, 'utf8');
    console.log(`Generated: ${outPath}`);
  }

  console.log(
    `\\nDone. Generated ${Object.keys(skills).length} skill docs from core/skills/index.ts.`
  );
}

main();
