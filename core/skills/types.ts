import type { Config } from '../config/schema.js';

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  preambleTier: 1 | 2 | 3;
  allowedTools: string[];
  triggers: string[];
  whenToInvoke: string;
  workflow: string;
  constitutionalAlignment?: {
    primaryValue: 'safe' | 'ethical' | 'compliant' | 'helpful';
    hardConstraints: string[];
    reasoning: string;
  };
}

export interface SkillResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export interface ExecutionContext {
  token: string;
  cwd: string;
  slug: string;
  config: Config;
}

export interface SkillExecutor {
  execute(args: string[], context: ExecutionContext): Promise<SkillResult>;
}

export interface Skill {
  manifest: SkillManifest;
  executor: SkillExecutor;
}

export interface SkillRegistry {
  get(name: string): Skill | undefined;
  list(): Skill[];
  findByTrigger(trigger: string): Skill | undefined;
  reload(): Promise<void>;
}
