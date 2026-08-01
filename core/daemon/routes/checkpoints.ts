// Bun types are global, no import needed
import { createStateService } from '@core/state/service.js';
import { getSlug } from '@core/state/service.js';

const stateService = createStateService();

export async function checkpointsRoute(req: Request, _token: string): Promise<Response> {
  const slug = getSlug();

  if (req.method === 'GET') {
    const checkpoints = await stateService.checkpoints.list(slug);
    return Response.json({ ok: true, checkpoints });
  }

  return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
