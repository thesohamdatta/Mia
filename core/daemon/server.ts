// Bun globals are available without import
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { initializeSkills } from '@core/skills/registry.js';
import { verifyToken } from './middleware.js';
import { checkpointsRoute } from './routes/checkpoints.js';
import { commandRoute } from './routes/command.js';
import { healthRoute } from './routes/health.js';
import { learningsRoute } from './routes/learnings.js';
import { memoryRoute } from './routes/memory.js';
import { skillsRoute } from './routes/skills.js';
import { timelineRoute } from './routes/timeline.js';

function getStateFilePath(): string {
  // Lazy access to config
  const { getStateFile } = require('@core/config/paths.js');
  return getStateFile();
}

function generateToken(): string {
  return randomUUID();
}

function randomPort(): number {
  // Lazy config access - called after initializeConfig
  const { getConfig } = require('@core/config/index.js');
  const config = getConfig();
  return (
    Math.floor(Math.random() * (config.daemon.portRange.max - config.daemon.portRange.min)) +
    config.daemon.portRange.min
  );
}

function saveState(port: number, token: string, version: string) {
  const state = {
    pid: process.pid,
    port,
    token,
    startedAt: new Date().toISOString(),
    version,
  };
  writeFileSync(getStateFilePath(), JSON.stringify(state, null, 2), { mode: 0o600 });
}

async function initialize(): Promise<{ port: number; token: string; version: string }> {
  // Initialize config
  const { initializeConfig } = await import('@core/config/index.js');
  const { getConfig } = await import('@core/config/index.js');

  const builtinSkillsPath = join(__dirname, '..', '..', '..', 'skills');
  initializeConfig(builtinSkillsPath);

  const config = getConfig();

  // Ensure state directory exists
  mkdirSync(dirname(getStateFilePath()), { recursive: true });

  // Initialize skills
  await initializeSkills();

  // Pick port and generate token
  const port = randomPort();
  const token = generateToken();
  const version = config.version || '0.2.0';

  saveState(port, token, version);

  console.log('🚀 MIA Daemon (miad) starting...');
  console.log(`   Port: ${port}`);
  console.log(`   Token: ${token}`);
  console.log(`   State: ${getStateFilePath()}`);
  console.log(`   PID: ${process.pid}`);
  console.log('   Ready for commands. ~ maximum value per line ~');

  return { port, token, version };
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const state = loadState();
  const currentToken = state?.token;

  try {
    // Health check - no auth required
    if (url.pathname === '/health') {
      return healthRoute(req);
    }

    // Skills list - no auth required (read-only)
    if (url.pathname === '/skills' && req.method === 'GET') {
      return skillsRoute(req);
    }

    // RPC endpoint for CLI commands
    if (url.pathname === '/command' && req.method === 'POST') {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json(
          { ok: false, error: 'Unauthorized: invalid or missing Bearer token' },
          { status: 401 }
        );
      }
      return commandRoute(req, currentToken || '');
    }

    // Learning API
    if (url.pathname === '/learn') {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      return learningsRoute(req, currentToken || '');
    }

    // Timeline API
    if (url.pathname === '/timeline') {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      return timelineRoute(req, currentToken || '');
    }

    // Memory API
    if (url.pathname === '/memory') {
      return memoryRoute(req, currentToken || '');
    }

    // Checkpoints API
    if (url.pathname === '/checkpoints') {
      if (currentToken && !verifyToken(req, currentToken)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      return checkpointsRoute(req, currentToken || '');
    }

    return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Request error:', error);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

function loadState(): { port: number; token: string } | null {
  try {
    if (existsSync(getStateFilePath())) {
      const data = JSON.parse(readFileSync(getStateFilePath(), 'utf-8'));
      return { port: data.port, token: data.token };
    }
  } catch {}
  return null;
}

// Initialize and start server
const init = await initialize();
const port = init.port;
const _token = init.token;
const _version = init.version;

const server = Bun.serve({
  port,
  fetch: handleRequest,
});

console.log(`   Server listening on http://127.0.0.1:${port}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down miad gracefully...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.stop();
  process.exit(0);
});

// Keep alive
setInterval(() => {}, 1000 * 60 * 60);
