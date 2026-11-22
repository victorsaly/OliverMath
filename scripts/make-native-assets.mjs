// Renders the source pictures that `@capacitor/assets` turns into every app
// icon and splash size for iOS and Android. They are drawn from the same SVGs
// the web app uses, so the store icon cannot drift from the site's.
//
//   node scripts/make-native-assets.mjs     (needs Google Chrome installed)
//   npx @capacitor/assets generate --ios --android
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets');
mkdirSync(outDir, { recursive: true });

const icon = readFileSync(path.join(root, 'public/assets/icon/icon.svg'), 'utf8');
const maskable = readFileSync(path.join(root, 'public/assets/icon/icon-maskable.svg'), 'utf8');

const TILE = /<rect width="512" height="512"[^>]*\/>/;
const tileRect = maskable.match(TILE)[0];
const defs = maskable.slice(maskable.indexOf('<defs>'), maskable.indexOf('</defs>') + 7);
const art = maskable.slice(maskable.indexOf('</defs>') + 7).replace(TILE, '').replace('</svg>', '');
const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${inner}</svg>`;

const pictures = [
  // iOS wants a full square with no transparency; the system rounds it.
  { name: 'icon-only.png', size: 1024, svg: icon.replace('rx="112"', 'rx="0"') },
  // Android adaptive icon: a background layer and the artwork inside the safe zone.
  { name: 'icon-background.png', size: 1024, svg: svg(defs + tileRect) },
  { name: 'icon-foreground.png', size: 1024, svg: svg(defs + art), transparent: true },
  // Splash: the brand tile filling the screen with the artwork small in the
  // middle, so launch reads as the icon opening rather than a blank flash.
  {
    name: 'splash.png',
    size: 2732,
    svg: svg(defs + tileRect + `<g transform="translate(256,256) scale(0.58) translate(-256,-256)">${art}</g>`)
  }
];
pictures.push({ ...pictures[3], name: 'splash-dark.png' });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new'
});
const page = await browser.newPage();
for (const picture of pictures) {
  await page.setViewport({ width: picture.size, height: picture.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${picture.size}px;height:${picture.size}px}</style>${picture.svg}`
  );
  await page.screenshot({ path: path.join(outDir, picture.name), omitBackground: !!picture.transparent });
  console.log('wrote assets/' + picture.name);
}
await browser.close();
