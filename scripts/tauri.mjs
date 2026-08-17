import { spawn } from 'node:child_process';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const shimDir = join(dirname(fileURLToPath(import.meta.url)), 'bin');
process.env.PATH = `${shimDir}${delimiter}${process.env.PATH ?? ''}`;

const bin = process.platform === 'win32' ? 'tauri.cmd' : 'tauri';
const child = spawn(bin, process.argv.slice(2), {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig));
}

child.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
