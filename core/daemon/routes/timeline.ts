// Bun types are global, no import needed
import { createStateService } from '@core/state/service.js';
import { getSlug } from '@core/state/service.js';

const stateService = createStateService();

export async function timelineRoute(req: Request, _token: string): Promise<Response> {
  const slug = getSlug();

  if (req.method === 'POST') {
    // POST handled by command route for auto-logging
    return Response.json(
      { ok: false, error: 'Use POST /command for timeline events' },
      { status: 405 }
    );
  }

  // GET
  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get('limit') || '30', 10);
  const events = await stateService.timeline.list(slug, limit);

  return Response.json({ ok: true, events });
}
