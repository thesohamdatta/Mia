// Route handlers adapted for the pure router (auth handled at boundary)

import { getConfig } from '@core/config/index.js';
import { executeSkill } from '@core/skills/executor.js';
import { runPreamble } from '@core/skills/preamble.js';
import { getSkillRegistry } from '@core/skills/registry.js';
import { sanitizeOutput } from '../middleware.js';
import type { StateService } from '../router.js';

export async function commandHandler(
  req: Request,
  _token: string,
  state: StateService
): Promise<Response> {
  const registry = getSkillRegistry();
  const config = getConfig();

  let body: { skill: string; args?: string[] };
  try {
    body = (await req.json()) as { skill: string; args?: string[] };
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { skill: skillName, args = [] } = body;

  if (!skillName) {
    return new Response(JSON.stringify({ ok: false, error: 'Skill name required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const skill = registry.get(skillName);

  if (!skill) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: `Unknown skill: ${skillName}. Run 'mia help' for available commands.`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const slug = state.getSlug();

  const context = {
    token: _token,
    cwd: process.cwd(),
    slug,
    config,
  };

  await runPreamble(skill.manifest.preambleTier, context);

  const result = await executeSkill(skill.executor, args, context, skillName);

  const sanitizedOutput = sanitizeOutput(result.output);

  return new Response(
    JSON.stringify({
      ok: result.ok,
      output: sanitizedOutput,
      error: result.error,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function healthHandler(
  _req: Request,
  _token: string,
  _state: StateService
): Promise<Response> {
  const { getIdleTimeoutMs } = await import('@core/config/paths.js');
  const config = getConfig();
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'miad',
      version: config.version || '0.2.0',
      uptime: process.uptime(),
      idleTimeoutMs: getIdleTimeoutMs(),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function skillsHandler(
  _req: Request,
  _token: string,
  _state: StateService
): Promise<Response> {
  const registry = getSkillRegistry();
  const skills = registry.list().map((s) => ({
    name: s.manifest.name,
    description: s.manifest.description,
    triggers: s.manifest.triggers,
    preambleTier: s.manifest.preambleTier,
    allowedTools: s.manifest.allowedTools,
  }));

  return new Response(JSON.stringify({ ok: true, skills }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function learningsHandler(
  req: Request,
  _token: string,
  state: StateService
): Promise<Response> {
  const slug = state.getSlug();

  if (req.method === 'POST') {
    try {
      const learning = await req.json();
      await state.learnings.append(slug, learning);
      return new Response(JSON.stringify({ ok: true, message: 'Learning saved' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10);
  const learnings = await state.learnings.list(slug, limit);

  return new Response(JSON.stringify({ ok: true, learnings }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function timelineHandler(
  req: Request,
  _token: string,
  state: StateService
): Promise<Response> {
  const slug = state.getSlug();

  if (req.method === 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Use POST /command for timeline events' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get('limit') || '30', 10);
  const events = await state.timeline.list(slug, limit);

  return new Response(JSON.stringify({ ok: true, events }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function memoryHandler(
  req: Request,
  _token: string,
  state: StateService
): Promise<Response> {
  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as { text?: string };
      if (!body.text) {
        return new Response(JSON.stringify({ ok: false, error: 'Text field required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await state.memory.append(body.text);
      return new Response(JSON.stringify({ ok: true, message: 'Memory updated' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const memory = await state.memory.read();
  return new Response(JSON.stringify({ ok: true, memory }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function checkpointsHandler(
  req: Request,
  _token: string,
  state: StateService
): Promise<Response> {
  const slug = state.getSlug();

  if (req.method === 'GET') {
    const checkpoints = await state.checkpoints.list(slug);
    return new Response(JSON.stringify({ ok: true, checkpoints }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
