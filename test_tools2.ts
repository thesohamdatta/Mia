import { spawn } from 'node:child_process';
import { join } from 'node:path';

const binDir = join(process.cwd(), 'node_modules', '.bin');

const tools = [
  { name: 'tsc', args: ['--version'] },
  { name: 'biome', args: ['--version'] },
  { name: 'knip', args: ['--version'] },
];

for (const tool of tools) {
  console.log(`\n--- Testing: ${tool.name} ---`);
  const proc = spawn(join(binDir, `${tool.name}.exe`), tool.args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  proc.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  await new Promise((resolve) => proc.on('close', resolve));

  console.log(`Exit code: ${proc.exitCode}`);
  if (stdout) console.log(`STDOUT: ${stdout.trim()}`);
  if (stderr) console.log(`STDERR: ${stderr.trim()}`);
}
