// Bun types are global, no import needed
import { createStateService } from '@core/state/service.js';
import { verifyToken } from '../middleware.js';

const stateService = createStateService();

export async function memoryRoute(req: Request, token: string): Promise<Response> {
  if (req.method === 'POST') {
    if (!verifyToken(req, token)) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body: { text?: string } = await req.json();
      if (!body.text) {
        return Response.json({ ok: false, error: 'Text field required' }, { status: 400 });
      }
      await stateService.memory.append(body.text);
      return Response.json({ ok: true, message: 'Memory updated' });
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    }
  }

  // GET
  const memory = await stateService.memory.read();
  return Response.json({ ok: true, memory });
}
