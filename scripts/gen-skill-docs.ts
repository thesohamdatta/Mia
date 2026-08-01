// MIA Skill Documentation Generator
// Reads skill manifests and templates, outputs SKILL.md files
// Run: bun run scripts/gen-skill-docs.ts

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const TEMPLATE_PATH = join(ROOT, 'templates', 'skill.tmpl');
const SKILLS_DIR = join(ROOT, 'skills');
const OUTPUT_DIR = join(ROOT, 'docs', 'skills');

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readTemplate(): string {
  return readFileSync(TEMPLATE_PATH, 'utf-8');
}

function render(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Handle {{VAR}} replacements
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, Array.isArray(value) ? value.join('\n') : String(value));
  }

  // Handle {{#each}} blocks (simple implementation)
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  result = result.replace(eachRegex, (_match, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return '';
    return arr
      .map((item) => {
        let rendered = block;
        if (typeof item === 'object' && item !== null) {
          for (const [k, v] of Object.entries(item)) {
            rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
          }
        } else {
          rendered = rendered.replace(/\{\{this\}\}/g, String(item));
        }
        return rendered;
      })
      .join('\n');
  });

  return result;
}

interface SkillManifest {
  name: string;
  version: string;
  description: string;
  preambleTier: number;
  allowedTools: string[];
  triggers: string[];
  whenToInvoke: string;
  workflow: string;
}

function loadManifests(): SkillManifest[] {
  const manifests: SkillManifest[] = [];

  for (const category of readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const catDir = join(SKILLS_DIR, category);
    for (const skillDir of readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const manifestPath = join(catDir, skillDir, 'manifest.json');
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SkillManifest;
        manifests.push(manifest);
      }
    }
  }

  return manifests;
}

function generatePreamble(_skill: SkillManifest): string {
  return `## Preamble (run first)

\`\`\`bash
# MIA preamble - update check, session tracking, learnings
_UPD=(\$(command -v mia-update-check >/dev/null 2>&1 && mia-update-check) || true)
[ -n "\$_UPD" ] && echo "\$_UPD" || true

# Session tracking
mkdir -p ~/.mia/sessions
touch ~/.mia/sessions/\$\$
SESSIONS=\$(find ~/.mia/sessions -mmin -120 -type f 2>/dev/null | wc -l)
echo "Active sessions: \$SESSIONS"

# Load project learnings
SLUG=\$(git rev-parse --show-toplevel 2>/dev/null | xargs basename 2>/dev/null || echo "default")
LEARN_FILE=~/.mia/projects/\$SLUG/learnings.jsonl
if [ -f "\$LEARN_FILE" ]; then
  COUNT=\$(wc -l < "\$LEARN_FILE")
  echo "LEARNINGS: \$COUNT entries"
  if [ "\$COUNT" -gt 5 ]; then
    tail -3 "\$LEARN_FILE" | jq -r '"  [\(.type)] \(.key) — \(.insight)"' 2>/dev/null || true
  fi
fi
\`\`\``;
}

function main() {
  const template = readTemplate();
  const manifests = loadManifests();

  ensureDir(OUTPUT_DIR);

  for (const skill of manifests) {
    const data = {
      SKILL_NAME: skill.name,
      PREAMBLE_TIER: skill.preambleTier,
      VERSION: skill.version,
      DESCRIPTION: skill.description,
      ALLOWED_TOOLS: skill.allowedTools,
      TRIGGERS: skill.triggers,
      PREAMBLE: generatePreamble(skill),
      WHEN_TO_INVOKE: skill.whenToInvoke,
      WORKFLOW: skill.workflow,
    };

    const output = render(template, data);
    const outPath = join(OUTPUT_DIR, `${skill.name}.md`);
    writeFileSync(outPath, output, 'utf-8');
    console.log(`Generated: ${outPath}`);
  }

  console.log(`\nDone. Generated ${manifests.length} skill docs.`);
}

main();
