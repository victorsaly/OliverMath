// Builds what GitHub Pages serves:
//
//   docs/            the product site (copied from site/)
//   docs/play/       the game (built by Vite)
//
// `npm run build` runs this. The store apps are built separately with
// `npm run build:native`.
import { execSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs');

rmSync(out, { recursive: true, force: true });
execSync('npx vite build --outDir docs/play', { cwd: root, stdio: 'inherit' });
cpSync(path.join(root, 'site'), out, { recursive: true });

// 404.html is served for addresses that have no file, so it cannot use
// relative links. It is told where the site lives here.
const siteBase = process.env.SITE_BASE || '/OliverMath/';
const notFound = path.join(out, '404.html');
writeFileSync(notFound, readFileSync(notFound, 'utf8').replaceAll('__SITE_BASE__', siteBase));
console.log('Site copied to docs/, game built to docs/play/');
