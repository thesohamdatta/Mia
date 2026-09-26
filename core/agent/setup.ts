import { join } from 'node:path';
import { AGENT_SKILLS, generateAgentSkillSurface, type AgentSurfaceResult } from './surface.js';

export const AGENT_HOSTS = {
  claude: { skillRoot: join('.claude', 'skills') },
  codex: { skillRoot: join('.agents', 'skills') },
} as const;

export type AgentHost = keyof typeof AGENT_HOSTS;

export type AgentSetupResult = Record<AgentHost, AgentSurfaceResult>;

export async function setupAgentSkills(
  projectRoot: string,
  hosts: readonly AgentHost[] = ['claude', 'codex']
): Promise<AgentSetupResult> {
  const result = {} as AgentSetupResult;

  for (const host of hosts) {
    const config = AGENT_HOSTS[host];
    if (!config) {
      throw new Error(`Unknown MIA agent host: ${host}`);
    }

    result[host] = await generateAgentSkillSurface(
      join(projectRoot, config.skillRoot),
      AGENT_SKILLS
    );
  }

  return result;
}
