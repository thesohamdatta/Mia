import { executeSkill } from '@core/skills/executor.js';
import { runPreamble } from '@core/skills/preamble.js';
// Bun types are global, no import needed
import { getSkillRegistry } from '@core/skills/registry.js';
import { getSlug } from '@core/state/service.js';
import { sanitizeOutput, verifyToken } from '../middleware.js';

export async function commandRoute(req: Request, token: string): Promise<Response> {
  // Lazy config access
  const { getConfig } = await import('@core/config/index.js');
  // Verify auth
  if (!verifyToken(req, token)) {
    return Response.json(
      { ok: false, error: 'Unauthorized: invalid or missing Bearer token' },
      { status: 401 }
    );
  }

  // Parse body
  let body: { skill: string; args?: string[] };
  try {
    body = (await req.json()) as { skill: string; args?: string[] };
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { skill: skillName, args = [] } = body;

  if (!skillName) {
    return Response.json({ ok: false, error: 'Skill name required' }, { status: 400 });
  }

  // Get skill from registry
  const registry = getSkillRegistry();
  const skill = registry.get(skillName);

  if (!skill) {
    return Response.json(
      { ok: false, error: `Unknown skill: ${skillName}. Run 'mia help' for available commands.` },
      { status: 404 }
    );
  }

  // Build execution context
  const slug = getSlug();

  const context = {
    token,
    cwd: process.cwd(),
    slug,
    config: getConfig(),
  };

  // Run preamble
  await runPreamble(skill.manifest.preambleTier, context);

  // Execute skill
  const result = await executeSkill(skill.executor, args, context, skillName);

  // Sanitize output
  const sanitizedOutput = sanitizeOutput(result.output);

  return Response.json({
    ok: result.ok,
    output: sanitizedOutput,
    error: result.error,
  });
}
