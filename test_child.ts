import { spawn } from 'node:child_process';

// Test running a simple command from compiled binary
const proc = spawn('cmd.exe', ['/c', 'echo hello from child_process'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

proc.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data.toString().trim()}`);
});

proc.stderr.on('data', (data) => {
  console.error(`STDERR: ${data.toString().trim()}`);
});

proc.on('close', (code) => {
  console.log(`Exit code: ${code}`);
});
