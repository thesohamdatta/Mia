import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skills } from '../skills/index.js';
import type { SkillDefinition } from '../skills/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');
const TEMPLATE_PATH = join(ROOT, 'templates', 'skill.tmpl');
const OUTPUT_DIR = join(ROOT, 'docs', 'skills');

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readTemplate(): string {
  return readFileSync(TEMPLATE_PATH, 'utf8');
}

function render(template: string, data: Record<string, unknown>): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\\\{\\\\{\\\\${key}\\\\}\\\\}`, 'g');
    result = result.replace(regex, Array.isArray(value) ? value.join('\\n') : String(value));
  }

  const eachRegex = /\\{\\{#each\\s+(\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/each\\}\\}/g;
  result = result.replace(eachRegex, (_match, key, block) => {
    const value = data[key];
    if (!Array.isArray(value)) return '';
    return value.map((item) => {
      let rendered = block;
      if (typeof item === 'object' && item !== null) {
        for (const [k, v] of Object.entries(item)) {
          rendered = rendered.replace(new RegExp(`\\\\{\\\\{${k}\\\\}\\\\}`, 'g'), String(v));
        }
      }
      return rendered.replace(/\\{\\{this\\}\\}/g, String(item));
    }).join('\\n');
  });

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
  const template = readTemplate();
  ensureDir(OUTPUT_DIR);

  for (const entry of Object.entries(skills)) {
    const data = skillData(entry);
    const output = render(template, data);
    const outPath = join(OUTPUT_DIR, `${data.SKILL_NAME}.md`);
    writeFileSync(outPath, output, 'utf8');
    console.log(`Generated: ${outPath}`);
  }

  console.log(`\\nDone. Generated ${Object.keys(skills).length} skill docs from core/skills/index.ts.`);
}

main();
