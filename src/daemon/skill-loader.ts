// MIA Skill Loader - Loads skills from filesystem (gstack pattern)
// Skills live in ~/.mia/skills/{category}/{skill-name}/manifest.json

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const HOME = homedir();
const SKILLS_DIR = join(HOME, '.mia', 'skills');
const BUILTIN_SKILLS_DIR = join(dirname(import.meta.path), '..', '..', 'skills'); // repo source

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  preambleTier: number;
  allowedTools: string[];
  triggers: string[];
  whenToInvoke: string;
  workflow: string;
}

export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  manifest: SkillManifest;
  execute: (
    args: string[],
    token: string
  ) => Promise<{ ok: boolean; output?: string; error?: string }>;
}

function readManifest(path: string): SkillManifest | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as SkillManifest;
  } catch {
    return null;
  }
}

function createBuiltinExecutor(skillName: string) {
  return async (_args: string[], _token: string) => {
    return { ok: true, output: `[${skillName}] Not yet implemented. Coming soon! please` };
  };
}

async function loadSkillFromDir(skillDir: string): Promise<Skill | null> {
  const manifestPath = join(skillDir, 'manifest.json');
  const manifest = readManifest(manifestPath);
  if (!manifest) return null;

  // Look for executor
  const execPath = join(skillDir, 'execute.ts');
  const execJsPath = join(skillDir, 'execute.js');

  let executor: (
    args: string[],
    token: string
  ) => Promise<{ ok: boolean; output?: string; error?: string }>;

  if (existsSync(execPath)) {
    const mod = await import(execPath);
    executor = mod.execute;
  } else if (existsSync(execJsPath)) {
    const mod = await import(execJsPath);
    executor = mod.default || mod.execute;
  } else {
    executor = createBuiltinExecutor(manifest.name);
  }

  return {
    name: manifest.name,
    description: manifest.description,
    triggers: manifest.triggers,
    manifest,
    execute: executor,
  };
}

export async function loadAllSkills(): Promise<Map<string, Skill>> {
  const skills = new Map<string, Skill>();

  // Load from user's ~/.mia/skills/ (takes precedence)
  if (existsSync(SKILLS_DIR)) {
    for (const category of readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const catDir = join(SKILLS_DIR, category);
      for (const skillDir of readdirSync(catDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)) {
        const skill = await loadSkillFromDir(join(catDir, skillDir));
        if (skill) {
          skills.set(skill.name, skill);
        }
      }
    }
  }

  // Load built-in skills from repo as fallback
  if (existsSync(BUILTIN_SKILLS_DIR)) {
    for (const category of readdirSync(BUILTIN_SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const catDir = join(BUILTIN_SKILLS_DIR, category);
      for (const skillDir of readdirSync(catDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)) {
        if (!skills.has(skillDir)) {
          const skill = await loadSkillFromDir(join(catDir, skillDir));
          if (skill) {
            skills.set(skill.name, skill);
          }
        }
      }
    }
  }

  return skills;
}

export function getSkillPaths(): string[] {
  const paths: string[] = [];

  if (existsSync(SKILLS_DIR)) {
    for (const category of readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const catDir = join(SKILLS_DIR, category);
      for (const skillDir of readdirSync(catDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)) {
        paths.push(join(catDir, skillDir));
      }
    }
  }

  return paths;
}
