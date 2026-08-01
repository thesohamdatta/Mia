// Bun types are global, no import needed
import { getSkillRegistry } from '@core/skills/registry.js';

export async function skillsRoute(_req: Request): Promise<Response> {
  const registry = getSkillRegistry();
  const skills = registry.list().map((s) => ({
    name: s.manifest.name,
    description: s.manifest.description,
    triggers: s.manifest.triggers,
    preambleTier: s.manifest.preambleTier,
    allowedTools: s.manifest.allowedTools,
  }));

  return Response.json({ ok: true, skills });
}
