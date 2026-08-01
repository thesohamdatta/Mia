import { BaseHostAdapter } from './base-adapter.js';
import type { ExecutionContext, HostConfig, SkillManifest, SkillResult } from './types.js';

export interface HermesConfig extends HostConfig {
  baseUrl: string;
  authToken?: string;
}

export class HermesAdapter extends BaseHostAdapter {
  readonly name = 'hermes';
  readonly version = '1.0.0';
  readonly description = 'Hermes Agent local adapter (HTTP API)';
  readonly supportsStreaming = false;

  private client: ReturnType<typeof this.createClient> | null = null;

  private createClient(config: HostConfig) {
    return {
      baseUrl: config.baseUrl || 'http://localhost:8080',
      authToken: config.authToken,
      timeout: config.timeout || 30000,
    };
  }

  protected async onInitialize(): Promise<void> {
    if (!this.config.baseUrl) {
      throw new Error('Hermes adapter requires baseUrl in config');
    }
    this.client = this.createClient(this.config);
  }

  protected async executeImpl(
    skill: SkillManifest,
    context: ExecutionContext,
    input: string
  ): Promise<SkillResult> {
    if (!this.client) {
      return { ok: false, error: 'Client not initialized' };
    }

    const systemPrompt = this.buildSystemPrompt(skill);

    try {
      const response = await fetch(`${this.client.baseUrl}/api/v1/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.client.authToken ? { Authorization: `Bearer ${this.client.authToken}` } : {}),
        },
        body: JSON.stringify({
          skill: skill.name,
          systemPrompt,
          userInput: input,
          context: {
            cwd: context.cwd,
            slug: context.slug,
          },
        }),
        signal: AbortSignal.timeout(this.client.timeout),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hermes API error: ${response.status} ${error}`);
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
Allowed tools: ${skill.allowedTools.join(', ')}

Execute this skill faithfully according to its workflow. Return only the skill's output.`;
  }

  protected async healthCheckImpl(): Promise<{ ok: boolean; details?: string }> {
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
