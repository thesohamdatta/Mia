import { spawn } from 'node:child_process';

// Test running actual tools from compiled binary
const tools = ['tsc --version', 'biome --version', 'knip --version'];

for (const tool of tools) {
  console.log(`\n--- Testing: ${tool} ---`);
  const [cmd, ...args] = tool.split(' ');
  const proc = spawn(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
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
