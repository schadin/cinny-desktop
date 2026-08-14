import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const patchPath = join(rootDir, '0002-rebrand-harrier.patch');
const cinnyDir = join(rootDir, 'cinny');
const logoSrc = join(rootDir, 'assets', 'harrier.svg');
const logoDst = join(cinnyDir, 'public', 'res', 'svg', 'harrier.svg');

function applied() {
  try {
    execSync(`git apply --check -R "${patchPath}"`, { cwd: cinnyDir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function apply() {
  if (!applied()) {
    execSync(`git apply "${patchPath}"`, { cwd: cinnyDir, stdio: 'inherit' });
  }
  copyFileSync(logoSrc, logoDst);
  console.log('Rebrand applied: Harrier branding is active in cinny/');
}

function revert() {
  if (applied()) {
    execSync(`git apply -R "${patchPath}"`, { cwd: cinnyDir, stdio: 'inherit' });
  }
  if (existsSync(logoDst)) rmSync(logoDst);
  console.log('Rebrand reverted: cinny/ is back to upstream state');
}

const command = process.argv[2];
if (command === 'apply') {
  apply();
} else if (command === 'revert') {
  revert();
} else {
  console.error('Usage: node scripts/rebrand.mjs <apply|revert>');
  process.exit(1);
}
