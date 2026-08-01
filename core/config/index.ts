export {
  ConfigSchema,
  type Config,
  createDefaultConfig,
} from './schema.js';

export {
  ConfigLoader,
  createConfigLoader,
} from './loader.js';

export {
  initializeConfig,
  getConfig,
  getPath,
  getMiaDir,
  getSkillsDir,
  getProjectsDir,
  getStateFile,
  getMemoryFile,
  getSessionsDir,
  getBuiltinSkillsPath,
  getUserSkillsPath,
  getDaemonPortRange,
  getIdleTimeoutMs,
  getTokenLength,
  isTelemetryEnabled,
  isAutoRestartEnabled,
  isHotReloadEnabled,
} from './paths.js';
