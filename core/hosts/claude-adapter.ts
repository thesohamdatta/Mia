import { BaseHostAdapter } from './base-adapter.js';
import type { ExecutionContext, HostConfig, SkillManifest, SkillResult } from './types.js';

export interface ClaudeConfig extends HostConfig {
  apiKey: string;
  anthropicVersion?: string;
}

export class ClaudeAdapter extends BaseHostAdapter {
  readonly name = 'claude';
  readonly version = '1.0.0';
  readonly description = 'Anthropic Claude API adapter (Messages API)';
  readonly supportsStreaming = true;

  private client: ReturnType<typeof this.createClient> | null = null;

  private createClient(config: HostConfig) {
    return {
      baseUrl: config.baseUrl || 'https://api.anthropic.com',
      apiKey: config.apiKey,
      anthropicVersion: config.anthropicVersion || '2023-06-01',
      timeout: config.timeout || 60000,
    };
  }

  protected async onInitialize(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Claude adapter requires apiKey in config');
    }
    this.client = this.createClient(this.config);
  }

  protected async executeImpl(
    skill: SkillManifest,
    _context: ExecutionContext,
    input: string
  ): Promise<SkillResult> {
    if (!this.client) {
      return { ok: false, error: 'Client not initialized' };
    }

    const systemPrompt = this.buildSystemPrompt(skill);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ];

    try {
      const response = await this.sendRequest(messages, false);
      return { ok: true, output: response };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async *executeStreaming(
    skill: SkillManifest,
    _context: ExecutionContext,
    input: string
  ): AsyncIterable<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const systemPrompt = this.buildSystemPrompt(skill);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ];

    const stream = await this.sendRequestStream(messages);
    for await (const chunk of stream) {
      yield chunk;
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

  private async sendRequest(
    messages: Array<{ role: string; content: string }>,
    stream: boolean
  ): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');

    const response = await fetch(`${this.client.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.client.apiKey!,
        'anthropic-version': this.client.anthropicVersion,
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        messages,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature ?? 0.3,
        stream,
      }),
      signal: AbortSignal.timeout(this.client.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} ${error}`);
    }

    if (stream) {
      return response.body; // Handled by streaming method
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content?.[0]?.text || '';
  }

  private async *sendRequestStream(
    messages: Array<{ role: string; content: string }>
  ): AsyncIterable<string> {
    if (!this.client) throw new Error('Client not initialized');

    const response = await fetch(`${this.client.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.client.apiKey!,
        'anthropic-version': this.client.anthropicVersion,
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        messages,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature ?? 0.3,
        stream: true,
      }),
      signal: AbortSignal.timeout(this.client.timeout),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield parsed.delta.text;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  protected async healthCheckImpl(): Promise<{ ok: boolean; details?: string }> {
    if (!this.client) {
      return { ok: false, details: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.client.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.client.apiKey!,
          'anthropic-version': this.client.anthropicVersion,
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10,
        }),
        signal: AbortSignal.timeout(5000),
      });

      return { ok: response.ok, details: response.ok ? 'Connected' : `HTTP ${response.status}` };
    } catch (error) {
      return { ok: false, details: error instanceof Error ? error.message : String(error) };
    }
  }
}
