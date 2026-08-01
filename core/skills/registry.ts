import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBuiltinSkillsPath, getUserSkillsPath } from '../config/paths.js';
import type {
  ExecutionContext,
  Skill,
  SkillExecutor,
  SkillManifest,
  SkillRegistry,
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readManifest(path: string): SkillManifest | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as SkillManifest;
  } catch {
    return null;
  }
}

async function loadExecutor(skillDir: string, manifest: SkillManifest): Promise<SkillExecutor> {
  const execPath = join(skillDir, 'execute.ts');
  const execJsPath = join(skillDir, 'execute.js');

  if (existsSync(execPath)) {
    const mod = await import(execPath);
    return mod.execute;
  }
  if (existsSync(execJsPath)) {
    const mod = await import(execJsPath);
    return mod.execute || mod.default;
  }

  // Fallback stub
  return async (_args: string[], _context: ExecutionContext) => ({
    ok: true,
    output: `[${manifest.name}] Not yet implemented. Coming soon!`,
  });
}

async function loadSkillFromDir(skillDir: string): Promise<Skill | null> {
  const manifestPath = join(skillDir, 'manifest.json');
  const manifest = readManifest(manifestPath);
  if (!manifest) return null;

  const executor = await loadExecutor(skillDir, manifest);

  return {
    manifest,
    executor,
  };
}

function scanSkillsDir(skillsDir: string): Map<string, Skill> {
  const skills = new Map<string, Skill>();

  if (!existsSync(skillsDir)) return skills;

  for (const category of readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const catDir = join(skillsDir, category);

    for (const skillDir of readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const skillPath = join(catDir, skillDir);
      // Note: We'll load executors async later, for now just store manifest path
      const manifestPath = join(skillPath, 'manifest.json');
      const manifest = readManifest(manifestPath);

      if (manifest) {
        // Store skill with lazy executor loading - executor must be a function
        const skill: Skill = {
          manifest,
          executor: async (args, context) => {
            const loaded = await loadSkillFromDir(skillPath);
            if (!loaded) {
              return { ok: false, error: `Skill ${manifest.name} not found` };
            }
            return loaded.executor(args, context);
          },
        };

        skills.set(skill.manifest.name, skill);
      }
    }
  }

  return skills;
}

export class FileSkillRegistry implements SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load user skills first (take precedence)
    const userSkills = scanSkillsDir(getUserSkillsPath());
    for (const [name, skill] of userSkills) {
      this.skills.set(name, skill);
    }

    // Load builtin skills as fallback
    const builtinSkills = scanSkillsDir(getBuiltinSkillsPath());
    for (const [name, skill] of builtinSkills) {
      if (!this.skills.has(name)) {
        this.skills.set(name, skill);
      }
    }

    this.initialized = true;
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  list(): Skill[] {
    return Array.from(this.skills.values());
  }

  findByTrigger(trigger: string): Skill | undefined {
    const lowerTrigger = trigger.toLowerCase();
    for (const skill of this.skills.values()) {
      if (skill.manifest.triggers.some((t) => t.toLowerCase().includes(lowerTrigger))) {
        return skill;
      }
    }
    return undefined;
  }

  async reload(): Promise<void> {
    this.skills.clear();
    this.initialized = false;
    await this.initialize();
  }
}

let registryInstance: FileSkillRegistry | null = null;

export function createSkillRegistry(): FileSkillRegistry {
  registryInstance = new FileSkillRegistry();
  return registryInstance;
}

export function getSkillRegistry(): FileSkillRegistry {
  if (!registryInstance) {
    registryInstance = createSkillRegistry();
  }
  return registryInstance;
}

export async function initializeSkills(): Promise<FileSkillRegistry> {
  const registry = getSkillRegistry();
  await registry.initialize();
  return registry;
}
