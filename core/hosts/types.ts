import type { ExecutionContext, SkillManifest, SkillResult } from '../skills/types.js';

export type { ExecutionContext, SkillManifest, SkillResult };

export interface HostAdapter {
  name: string;
  version: string;
  description: string;
  supportsStreaming: boolean;
  initialize(config: HostConfig): Promise<void>;
  execute(skill: SkillManifest, context: ExecutionContext, input: string): Promise<SkillResult>;
  executeStreaming?(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): AsyncIterable<string>;
  healthCheck(): Promise<{ ok: boolean; details?: string }>;
  shutdown(): Promise<void>;
}

export interface HostConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  organizationId?: string;
  authToken?: string;
  extra?: Record<string, unknown>;
}

export interface HostRegistry {
  register(name: string, adapter: HostAdapter): void;
  get(name: string): HostAdapter | undefined;
  list(): HostAdapter[];
  getDefault(): HostAdapter | undefined;
  setDefault(name: string): boolean;
}
