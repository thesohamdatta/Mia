import { createStateService } from '../state/service.js';
import type { ExecutionContext, SkillResult } from './types.js';

const stateService = createStateService();

export interface SkillPreamble {
  checkUpdates(): Promise<string | null>;
  trackSession(sessionId: string): Promise<void>;
  loadLearnings(slug: string): Promise<void>;
  formatOutput(output: string): string;
}

export async function runPreamble(tier: 1 | 2 | 3, context: ExecutionContext): Promise<void> {
  if (tier >= 1) {
    // Tier 1: Always run - update check, session tracking
    await stateService.sessions.touch(context.token);
  }

  if (tier >= 2) {
    // Tier 2: Load learnings for the project
    await stateService.learnings.list(context.slug, 5);
  }

  // Auto-log timeline event
  await stateService.timeline.append(context.slug, {
    ts: new Date().toISOString(),
    skill: 'unknown', // Will be overridden by caller
    event: 'started',
  });
}

export async function logSkillComplete(
  slug: string,
  skillName: string,
  result: SkillResult
): Promise<void> {
  await stateService.timeline.append(slug, {
    ts: new Date().toISOString(),
    skill: skillName,
    event: 'completed',
    outcome: result.ok ? 'success' : 'failed',
  });
}

export async function logLearning(
  slug: string,
  learning: Omit<import('../state/types.js').Learning, 'ts'>
): Promise<void> {
  await stateService.learnings.append(slug, {
    ...learning,
    ts: new Date().toISOString(),
  });
}

export function formatSkillOutput(result: SkillResult): string {
  if (!result.ok) {
    return `❌ ${result.error}`;
  }
  return result.output || '✅ Done';
}
