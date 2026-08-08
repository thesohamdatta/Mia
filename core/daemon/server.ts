// Bun globals are available without import
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { initializeConfig } from '@core/config/index.js';
import { initializeSkills } from '@core/skills/registry.js';
import { createStateService } from '@core/state/service.js';
import { createRouter } from './router.js';
import type { StateService } from './router.js';
import {
  checkpointsHandler,
  commandHandler,
  healthHandler,
  learningsHandler,
  memoryHandler,
  skillsHandler,
  timelineHandler,
} from './routes/index.js';

interface DaemonDeps {
  stateService: StateService;
  port: number;
  token: string;
  version: string;
}

function getStateFilePath(): string {
  const { getStateFile } = require('@core/config/paths.js');
  return getStateFile();
}

function generateToken(): string {
  return randomUUID();
}

function randomPort(): number {
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

async function initializeDaemon(builtinSkillsPath: string): Promise<{
  port: number;
  token: string;
  version: string;
}> {
  // Initialize config
  initializeConfig(builtinSkillsPath);

  const { getConfig } = await import('@core/config/index.js');
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

function createRouteTable(_token: string) {
  return [
    { path: '/health', method: 'GET', handler: healthHandler, authRequired: false },
    { path: '/skills', method: 'GET', handler: skillsHandler, authRequired: false },
    { path: '/command', method: 'POST', handler: commandHandler, authRequired: true },
    { path: '/learn', method: 'GET', handler: learningsHandler, authRequired: true },
    { path: '/learn', method: 'POST', handler: learningsHandler, authRequired: true },
    { path: '/timeline', method: 'GET', handler: timelineHandler, authRequired: true },
    { path: '/memory', method: 'GET', handler: memoryHandler, authRequired: false },
    { path: '/memory', method: 'POST', handler: memoryHandler, authRequired: true },
    { path: '/checkpoints', method: 'GET', handler: checkpointsHandler, authRequired: true },
  ];
}

export async function start(deps: DaemonDeps): Promise<Bun.Server<unknown>> {
  const { stateService, port, token, version } = deps;

  const routeTable = createRouteTable(token);
  const handleRequest = createRouter(routeTable, token, stateService);

  const server = Bun.serve({
    port,
    fetch: handleRequest,
  });

  console.log(`   Server listening on http://127.0.0.1:${port}`);
  console.log(`   Version: ${version}`);

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

  return server;
}

// CLI entry point - only runs when executed directly
if (import.meta.main) {
  const builtinSkillsPath = join(__dirname, '..', '..', '..', 'skills');
  const init = await initializeDaemon(builtinSkillsPath);

  const stateService = createStateService();

  await start({
    stateService,
    port: init.port,
    token: init.token,
    version: init.version,
  });
}

export { getStateFilePath, generateToken, randomPort, saveState, initializeDaemon };
