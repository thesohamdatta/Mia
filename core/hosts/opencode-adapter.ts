import { BaseHostAdapter } from './base-adapter.js';
import type { ExecutionContext, HostConfig, SkillManifest, SkillResult } from './types.js';

export interface OpenClawConfig extends HostConfig {
  baseUrl: string;
  apiKey?: string;
}

export class OpenClawAdapter extends BaseHostAdapter {
  readonly name = 'opencode';
  readonly version = '1.0.0';
  readonly description = 'OpenCode CLI adapter (local process execution)';
  override readonly supportsStreaming = false;

  private client: ReturnType<typeof this.createClient> | null = null;

  private createClient(config: HostConfig) {
    return {
      baseUrl: config.baseUrl || 'http://localhost:3000',
      apiKey: config.apiKey,
      timeout: config.timeout || 60000,
    };
  }

  protected override async onInitialize(): Promise<void> {
    if (!this.config.baseUrl) {
      throw new Error('OpenClaw adapter requires baseUrl in config');
    }
    this.client = this.createClient(this.config);
  }

  protected override async executeImpl(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): Promise<SkillResult> {
    if (!this.client) {
      return { ok: false, error: 'Client not initialized' };
    }

    const systemPrompt = this.buildSystemPrompt(skill);

    try {
      const response = await fetch(`${this.client.baseUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.client.apiKey ? { Authorization: `Bearer ${this.client.apiKey}` } : {}),
        },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\n${input}`,
          cwd: context.cwd,
        }),
        signal: AbortSignal.timeout(this.client.timeout),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenCode API error: ${response.status} ${error}`);
      }

      const data = (await response.json()) as { output?: string; error?: string; ok?: boolean };
      return { ok: data.ok ?? true, output: data.output, error: data.error };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private buildSystemPrompt(skill: SkillManifest): string {
    return `You are executing the "${skill.name}" skill.

${skill.description}

Workflow:
${skill.workflow}

When to invoke:
${skill.whenToInvoke}

Preamble tier: ${skill.preambleTier}
Allowed tools: ${(skill.allowedTools || []).join(', ')}

Execute this skill faithfully according to its workflow. Return only the skill's output.`;
  }

  protected override async healthCheckImpl(): Promise<{ ok: boolean; details?: string }> {
    if (!this.client) {
      return { ok: false, details: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.client.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return { ok: response.ok, details: response.ok ? 'Connected' : `HTTP ${response.status}` };
    } catch (error) {
      return { ok: false, details: error instanceof Error ? error.message : String(error) };
    }
  }
}
