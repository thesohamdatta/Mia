import type { ExecutionContext, SkillManifest, SkillResult } from '../skills/types.js';
import type { HostAdapter, HostConfig } from './types.js';

export abstract class BaseHostAdapter implements HostAdapter {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;
  readonly supportsStreaming: boolean = false;

  protected config: HostConfig = {};

  async initialize(config: HostConfig): Promise<void> {
    this.config = config;
    await this.onInitialize();
  }

  protected abstract onInitialize(): Promise<void>;

  async execute(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): Promise<SkillResult> {
    return this.executeImpl(skill, context, input);
  }

  protected abstract executeImpl(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): Promise<SkillResult>;

  async executeStreaming?(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): AsyncIterable<string>;

  async healthCheck(): Promise<{ ok: boolean; details?: string }> {
    return this.healthCheckImpl();
  }

  protected abstract healthCheckImpl(): Promise<{ ok: boolean; details?: string }>;

  async shutdown(): Promise<void> {
    // Override if needed
  }
}
