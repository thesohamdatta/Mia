// Bun types are global, no import needed
import { verifyToken } from './middleware.js';

export type RouteHandler = (req: Request, token: string, state: StateService) => Promise<Response>;

export interface RouteDefinition {
  path: string;
  method: string;
  handler: RouteHandler;
  authRequired: boolean;
}

export interface StateService {
  learnings: LearningStore;
  timeline: TimelineStore;
  checkpoints: CheckpointStore;
  memory: MemoryStore;
  sessions: SessionStore;
  getSlug(cwd?: string): string;
  ensureProject(slug: string): Promise<string>;
}

interface LearningStore {
  append(slug: string, learning: unknown): Promise<void>;
  list(slug: string, limit: number): Promise<unknown[]>;
}

interface TimelineStore {
  append(slug: string, event: unknown): Promise<void>;
  list(slug: string, limit: number): Promise<unknown[]>;
}

interface CheckpointStore {
  save(slug: string, checkpoint: unknown): Promise<void>;
  list(slug: string): Promise<unknown[]>;
  load(slug: string, name: string): Promise<unknown | null>;
}

interface MemoryStore {
  read(): Promise<string>;
  append(section: string): Promise<void>;
}

interface SessionStore {
  touch(sessionId: string): Promise<void>;
  listActive(maxAgeMs: number): Promise<string[]>;
  cleanup(maxAgeMs: number): Promise<void>;
}

export function createRouter(
  routes: RouteDefinition[],
  token: string,
  stateService: StateService
): (req: Request) => Promise<Response> {
  const routeMap = new Map<string, RouteDefinition[]>();

  for (const route of routes) {
    const key = `${route.method}:${route.path}`;
    const methods = routeMap.get(key) || [];
    methods.push(route);
    routeMap.set(key, methods);
  }

  return async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const key = `${req.method}:${url.pathname}`;
    const matchedRoutes = routeMap.get(key);

    if (!matchedRoutes) {
      return new Response(JSON.stringify({ ok: false, error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const route of matchedRoutes) {
      // Apply auth once at the boundary
      if (route.authRequired) {
        if (!verifyToken(req, token)) {
          return new Response(
            JSON.stringify({ ok: false, error: 'Unauthorized: invalid or missing Bearer token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      try {
        return await route.handler(req, token, stateService);
      } catch (error) {
        console.error('Route handler error:', error);
        return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ ok: false, error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
