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
    const result: Config = { ...base } as Config;

    for (const key of Object.keys(override) as Array<keyof Config>) {
      const overrideValue = override[key];
      if (overrideValue !== undefined) {
        result[key] = overrideValue as never;
      }
    }
    return result;
  }

  private applyEnv(config: Config): Config {
    const result = { ...config };
    const env = process.env as {
      MIA_DAEMON_PORT?: string;
      MIA_IDLE_TIMEOUT_MS?: string;
      MIA_TOKEN_LENGTH?: string;
      MIA_DIR?: string;
      MIA_SKILLS_DIR?: string;
      MIA_PROJECTS_DIR?: string;
      MIA_STATE_FILE?: string;
      MIA_MEMORY_FILE?: string;
      MIA_TELEMETRY?: string;
      MIA_AUTO_RESTART?: string;
      MIA_HOT_RELOAD?: string;
    };

    // Daemon settings from env
    const daemonPort = env.MIA_DAEMON_PORT;
    if (daemonPort) {
      result.daemon = { ...result.daemon };
      result.daemon.portRange = { ...result.daemon.portRange };
      result.daemon.portRange.min = Number.parseInt(daemonPort, 10);
      result.daemon.portRange.max = result.daemon.portRange.min;
    }
    const idleTimeout = env.MIA_IDLE_TIMEOUT_MS;
    if (idleTimeout) {
      result.daemon = { ...result.daemon };
      result.daemon.idleTimeoutMs = Number.parseInt(idleTimeout, 10);
    }
    const tokenLength = env.MIA_TOKEN_LENGTH;
    if (tokenLength) {
      result.daemon = { ...result.daemon };
      result.daemon.tokenLength = Number.parseInt(tokenLength, 10);
    }

    // Paths from env
    const miaDirEnv = env.MIA_DIR;
    if (miaDirEnv) {
      const miaDir = miaDirEnv;
      result.paths = { ...result.paths };
      result.paths.miaDir = miaDir;
      result.paths.skillsDir = join(miaDir, 'skills');
      result.paths.projectsDir = join(miaDir, 'projects');
      result.paths.stateFile = join(miaDir, 'state.json');
      result.paths.memoryFile = join(miaDir, 'memory.md');
      result.paths.sessionsDir = join(miaDir, 'sessions');
    }
    const skillsDir = env.MIA_SKILLS_DIR;
    if (skillsDir) {
      result.paths = { ...result.paths };
      result.paths.skillsDir = skillsDir;
    }
    const projectsDir = env.MIA_PROJECTS_DIR;
    if (projectsDir) {
      result.paths = { ...result.paths };
      result.paths.projectsDir = projectsDir;
    }
    const stateFile = env.MIA_STATE_FILE;
    if (stateFile) {
      result.paths = { ...result.paths };
      result.paths.stateFile = stateFile;
    }
    const memoryFile = env.MIA_MEMORY_FILE;
    if (memoryFile) {
      result.paths = { ...result.paths };
      result.paths.memoryFile = memoryFile;
    }

    // Feature flags
    if (env.MIA_TELEMETRY === 'true') {
      result.features = { ...result.features };
      result.features.telemetry = true;
    }
    if (env.MIA_AUTO_RESTART === 'false') {
      result.features = { ...result.features };
      result.features.autoRestart = false;
    }
    if (env.MIA_HOT_RELOAD === 'true') {
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
