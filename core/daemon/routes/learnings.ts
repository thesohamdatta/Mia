// Bun types are global, no import needed
import { createStateService } from '@core/state/service.js';
import { getSlug } from '@core/state/service.js';
import type { Learning } from '@core/state/types.js';
import { verifyToken } from '../middleware.js';

const stateService = createStateService();

export async function learningsRoute(req: Request, token: string): Promise<Response> {
  const slug = getSlug();

  if (req.method === 'POST') {
    if (!verifyToken(req, token)) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const learning: Learning = await req.json();
      await stateService.learnings.append(slug, learning);
      return Response.json({ ok: true, message: 'Learning saved' });
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    }
  }

  // GET
  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10);
  const learnings = await stateService.learnings.list(slug, limit);

  return Response.json({ ok: true, learnings });
}
