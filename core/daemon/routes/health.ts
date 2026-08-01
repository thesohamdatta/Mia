// Bun types are global, no import needed
import { getIdleTimeoutMs } from '@core/config/paths.js';

export async function healthRoute(_req: Request): Promise<Response> {
  // Lazy config access
  const { getConfig } = await import('@core/config/index.js');
  const config = getConfig();
  return Response.json({
    ok: true,
    service: 'miad',
    version: config.version || '0.2.0',
    uptime: process.uptime(),
    idleTimeoutMs: getIdleTimeoutMs(),
  });
}
