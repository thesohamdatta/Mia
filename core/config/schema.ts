import { homedir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

const DaemonConfigSchema = z.object({
  portRange: z.object({ min: z.number().default(10000), max: z.number().default(60000) }),
  idleTimeoutMs: z.number().default(30 * 60 * 1000),
  tokenLength: z.number().default(32),
});

const PathsConfigSchema = z.object({
  miaDir: z.string().default(join(homedir(), '.mia')),
  skillsDir: z.string(),
  projectsDir: z.string(),
  stateFile: z.string(),
  memoryFile: z.string(),
  sessionsDir: z.string(),
});

const SkillsConfigSchema = z.object({
  builtinPath: z.string(),
  userPath: z.string(),
});

const FeaturesConfigSchema = z.object({
  telemetry: z.boolean().default(false),
  autoRestart: z.boolean().default(true),
  hotReload: z.boolean().default(false),
});

export const ConfigSchema = z.object({
  daemon: DaemonConfigSchema,
  paths: PathsConfigSchema,
  skills: SkillsConfigSchema,
  features: FeaturesConfigSchema,
  version: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type DaemonConfig = z.infer<typeof DaemonConfigSchema>;
export type PathsConfig = z.infer<typeof PathsConfigSchema>;
export type SkillsConfig = z.infer<typeof SkillsConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;

export function createDefaultConfig(builtinSkillsPath: string): Config {
  const miaDir = join(homedir(), '.mia');
  return {
    daemon: {
      portRange: { min: 10000, max: 60000 },
      idleTimeoutMs: 30 * 60 * 1000,
      tokenLength: 32,
    },
    paths: {
      miaDir,
      skillsDir: join(miaDir, 'skills'),
      projectsDir: join(miaDir, 'projects'),
      stateFile: join(miaDir, 'state.json'),
      memoryFile: join(miaDir, 'memory.md'),
      sessionsDir: join(miaDir, 'sessions'),
    },
    skills: {
      builtinPath: builtinSkillsPath,
      userPath: join(miaDir, 'skills'),
    },
    features: {
      telemetry: false,
      autoRestart: true,
      hotReload: false,
    },
  };
}
