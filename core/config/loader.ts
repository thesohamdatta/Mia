import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { type Config, ConfigSchema, createDefaultConfig } from './schema.js';

const CONFIG_FILE_NAME = 'config.json';

export class ConfigLoader {
  private config: Config | null = null;
  private configPath: string;

  constructor(builtinSkillsPath: string, customConfigPath?: string) {
    const miaDir = customConfigPath ? dirname(customConfigPath) : join(homedir(), '.mia');
    this.configPath = join(miaDir, CONFIG_FILE_NAME);
    this.config = this.load(builtinSkillsPath);
  }

  private load(builtinSkillsPath: string): Config {
    // Start with defaults
    let config = createDefaultConfig(builtinSkillsPath);

    // Overlay with file config if exists
    if (existsSync(this.configPath)) {
      try {
        const fileConfig = JSON.parse(readFileSync(this.configPath, 'utf-8'));
        config = this.merge(config, fileConfig);
      } catch (e) {
        console.warn(`Failed to parse config at ${this.configPath}:`, e);
      }
    }

    // Overlay with environment variables
    config = this.applyEnv(config);

    // Validate final config
    return ConfigSchema.parse(config);
  }

  private merge(base: Config, override: Partial<Config>): Config {
    const result: Config = {
      daemon: { ...base.daemon },
      paths: { ...base.paths },
      skills: { ...base.skills },
      features: { ...base.features },
    } as Config;

    for (const key of Object.keys(override) as Array<keyof Config>) {
      const overrideValue = override[key];
      if (overrideValue !== undefined) {
        if (
          typeof overrideValue === 'object' &&
          overrideValue !== null &&
          !Array.isArray(overrideValue)
        ) {
          const baseValue = base[key];
          if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
            result[key] = { ...baseValue, ...overrideValue } as Config[keyof Config];
          } else {
            result[key] = overrideValue as Config[keyof Config];
          }
        } else {
          result[key] = overrideValue as Config[keyof Config];
        }
      }
    }
    return result;
  }

  private applyEnv(config: Config): Config {
    const result = { ...config };

    // Daemon settings from env
    if (process.env.MIA_DAEMON_PORT) {
      result.daemon = { ...result.daemon };
      result.daemon.portRange = { ...result.daemon.portRange };
      result.daemon.portRange.min = Number.parseInt(process.env.MIA_DAEMON_PORT, 10);
      result.daemon.portRange.max = result.daemon.portRange.min;
    }
    if (process.env.MIA_IDLE_TIMEOUT_MS) {
      result.daemon = { ...result.daemon };
      result.daemon.idleTimeoutMs = Number.parseInt(process.env.MIA_IDLE_TIMEOUT_MS, 10);
    }
    if (process.env.MIA_TOKEN_LENGTH) {
      result.daemon = { ...result.daemon };
      result.daemon.tokenLength = Number.parseInt(process.env.MIA_TOKEN_LENGTH, 10);
    }

    // Paths from env
    if (process.env.MIA_DIR) {
      const miaDir = process.env.MIA_DIR;
      result.paths = { ...result.paths };
      result.paths.miaDir = miaDir;
      result.paths.skillsDir = join(miaDir, 'skills');
      result.paths.projectsDir = join(miaDir, 'projects');
      result.paths.stateFile = join(miaDir, 'state.json');
      result.paths.memoryFile = join(miaDir, 'memory.md');
      result.paths.sessionsDir = join(miaDir, 'sessions');
    }
    if (process.env.MIA_SKILLS_DIR) {
      result.paths = { ...result.paths };
      result.paths.skillsDir = process.env.MIA_SKILLS_DIR;
    }
    if (process.env.MIA_PROJECTS_DIR) {
      result.paths = { ...result.paths };
      result.paths.projectsDir = process.env.MIA_PROJECTS_DIR;
    }
    if (process.env.MIA_STATE_FILE) {
      result.paths = { ...result.paths };
      result.paths.stateFile = process.env.MIA_STATE_FILE;
    }
    if (process.env.MIA_MEMORY_FILE) {
      result.paths = { ...result.paths };
      result.paths.memoryFile = process.env.MIA_MEMORY_FILE;
    }

    // Feature flags
    if (process.env.MIA_TELEMETRY === 'true') {
      result.features = { ...result.features };
      result.features.telemetry = true;
    }
    if (process.env.MIA_AUTO_RESTART === 'false') {
      result.features = { ...result.features };
      result.features.autoRestart = false;
    }
    if (process.env.MIA_HOT_RELOAD === 'true') {
      result.features = { ...result.features };
      result.features.hotReload = true;
    }

    return result;
  }

  get(): Config {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config;
  }

  getPath(key: keyof Config['paths']): string {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.paths[key];
  }

  save(): void {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    mkdirSync(dirname(this.configPath), { recursive: true });
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    this.config = { ...this.config, [key]: value };
    this.save();
  }
}

export function createConfigLoader(
  builtinSkillsPath: string,
  customConfigPath?: string
): ConfigLoader {
  return new ConfigLoader(builtinSkillsPath, customConfigPath);
}
