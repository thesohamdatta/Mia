import { ConfigLoader } from './loader.js';

let configLoaderInstance: ConfigLoader | null = null;

export function initializeConfig(
  builtinSkillsPath: string,
  customConfigPath?: string
): ConfigLoader {
  configLoaderInstance = new ConfigLoader(builtinSkillsPath, customConfigPath);
  return configLoaderInstance;
}

export function getConfig(): ReturnType<ConfigLoader['get']> {
  if (!configLoaderInstance) {
    throw new Error('Config not initialized. Call initializeConfig() first.');
  }
  return configLoaderInstance.get();
}

export function getPath(key: Parameters<ConfigLoader['getPath']>[0]): string {
  if (!configLoaderInstance) {
    throw new Error('Config not initialized. Call initializeConfig() first.');
  }
  return configLoaderInstance.getPath(key);
}

export function getMiaDir(): string {
  return getPath('miaDir');
}

export function getSkillsDir(): string {
  return getPath('skillsDir');
}

export function getProjectsDir(): string {
  return getPath('projectsDir');
}

export function getStateFile(): string {
  return getPath('stateFile');
}

export function getMemoryFile(): string {
  return getPath('memoryFile');
}

export function getSessionsDir(): string {
  return getPath('sessionsDir');
}

export function getBuiltinSkillsPath(): string {
  return getConfig().skills.builtinPath;
}

export function getUserSkillsPath(): string {
  return getConfig().skills.userPath;
}

export function getDaemonPortRange(): ReturnType<ConfigLoader['get']>['daemon']['portRange'] {
  return getConfig().daemon.portRange;
}

export function getIdleTimeoutMs(): number {
  return getConfig().daemon.idleTimeoutMs;
}

export function getTokenLength(): number {
  return getConfig().daemon.tokenLength;
}

export function isTelemetryEnabled(): boolean {
  return getConfig().features.telemetry;
}

export function isAutoRestartEnabled(): boolean {
  return getConfig().features.autoRestart;
}

export function isHotReloadEnabled(): boolean {
  return getConfig().features.hotReload;
}
