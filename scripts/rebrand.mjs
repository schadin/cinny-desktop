import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const patchPath = join(rootDir, '0002-rebrand-harrier.patch');
// Каталог подмодуля cinny: по умолчанию <rootDir>/cinny, переопределяется
// через REBRAND_CINNY_DIR (абсолютный путь; используется в CI pages-deploy,
// где скрипт запускается из клона harrier-desktop, а cinny — отдельный checkout)
const cinnyDir = process.env.REBRAND_CINNY_DIR || join(rootDir, 'cinny');

// Новые файлы — при revert удаляются
const newAssets = [
  ['assets/harrier.svg', 'public/res/svg/harrier.svg'],
  ['assets/harrier-unread.svg', 'public/res/svg/harrier-unread.svg'],
  ['assets/harrier-highlight.svg', 'public/res/svg/harrier-highlight.svg'],
  ['assets/favicon-48.png', 'public/res/favicon-48x48.png'],
];

// Существующие upstream-файлы — при apply перезаписываются, при revert восстанавливаются из git
const overwriteAssets = [
  ['assets/favicon.ico', 'public/favicon.ico'],
];

const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 167, 180];
const androidSizes = [36, 48, 72, 96, 144, 192, 256, 384, 512];
for (const s of appleSizes) {
  overwriteAssets.push([`assets/apple/apple-touch-icon-${s}x${s}.png`, `public/res/apple/apple-touch-icon-${s}x${s}.png`]);
}
for (const s of androidSizes) {
  overwriteAssets.push([`assets/android/android-chrome-${s}x${s}.png`, `public/res/android/android-chrome-${s}x${s}.png`]);
}

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
  for (const [from, to] of [...newAssets, ...overwriteAssets]) {
    copyFileSync(join(rootDir, from), join(cinnyDir, to));
  }
  console.log('Rebrand applied: Harrier branding is active in cinny/');
}

function revert() {
  if (applied()) {
    execSync(`git apply -R "${patchPath}"`, { cwd: cinnyDir, stdio: 'inherit' });
  }
  for (const [, to] of newAssets) {
    const dst = join(cinnyDir, to);
    if (existsSync(dst)) rmSync(dst);
  }
  const tracked = overwriteAssets.map(([, to]) => to);
  execSync(`git checkout -- ${tracked.map((p) => `"${p}"`).join(' ')}`, { cwd: cinnyDir });
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
