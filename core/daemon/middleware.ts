// Bun types are global, no import needed

export function verifyToken(req: Request, expectedToken: string): boolean {
  const auth = req.headers.get('Authorization');
  return auth === `Bearer ${expectedToken}`;
}

export function createAuthMiddleware(token: string) {
  return async (req: Request): Promise<Response | null> => {
    if (!verifyToken(req, token)) {
      return Response.json(
        { ok: false, error: 'Unauthorized: invalid or missing Bearer token' },
        { status: 401 }
      );
    }
    return null;
  };
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  return async (req: Request): Promise<Response | null> => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = requests.get(ip) || [];
    const recentRequests = userRequests.filter((ts) => ts > windowStart);

    if (recentRequests.length >= maxRequests) {
      return Response.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    return null;
  };
}

export function sanitizeOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output.replace(/[\uD800-\uDFFF]/g, (match, offset) => {
      const code = match.charCodeAt(0);
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = offset + 1 < output.length ? output.charCodeAt(offset + 1) : -1;
        if (next >= 0xdc00 && next <= 0xdfff) return match;
      }
      if (code >= 0xdc00 && code <= 0xdfff) {
        const prev = offset - 1 >= 0 ? output.charCodeAt(offset - 1) : -1;
        if (prev >= 0xd800 && prev <= 0xdbff) return match;
      }
      return '�';
    });
  }
  return String(output);
}
