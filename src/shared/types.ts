// Shared types and constants for MIA CLI and daemon

export interface DaemonState {
  pid: number;
  port: number;
  token: string;
  startedAt: string;
  version: string;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  triggers: string[];
  allowedTools: string[];
  preambleTier: number;
}

export interface CommandRequest {
  skill: string;
  args: string[];
  context?: Record<string, unknown>;
}

export interface CommandResponse {
  ok: boolean;
  output?: string;
  error?: string;
}

export const STATE_FILE = 'state.json';
export const DEFAULT_PORT_RANGE = { min: 10000, max: 60000 };
export const HEALTH_CHECK_INTERVAL = 30_000; // 30 seconds
export const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes