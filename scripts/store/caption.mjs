// Puts a caption above each store screenshot.
//
//   node scripts/store/caption.mjs --in product/store/iphone-6.9 --out product/store/iphone-6.9-captioned
//
// Each picture keeps the size of the screenshot it was made from, which is the
// size the store asks for. The screenshot is shown whole, smaller, on the
// game's own blue, with one line above it.
//
// Needs Google Chrome.
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const input = path.resolve(arg('in', 'product/store/iphone-6.9'));
const output = path.resolve(arg('out', input + '-captioned'));
mkdirSync(output, { recursive: true });

// One line per screen, by the name the screenshot script gives it.
const CAPTIONS = {
  home: 'Practise maths by talking to a robot',
  'answer-heard': 'Say the answer out loud',
  'stars-earned': 'Right answers earn stars',
  'number-pad': 'Noisy room? Tap the answer',
  'choose-sums': 'Times, plus, minus or divide',
  'stars-page': 'Badges to earn, a best run to beat'
};

const files = readdirSync(input).filter((f) => /^\d\d-.*\.png$/.test(f)).sort();
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new'
});
const page = await browser.newPage();

for (const file of files) {
  const name = file.replace(/^\d\d-/, '').replace(/\.png$/, '');
  const caption = CAPTIONS[name];
  if (!caption) {
    console.warn('no caption for', file);
    continue;
  }
  const bytes = readFileSync(path.join(input, file));
  // Width and height are in the PNG header.
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const tall = height / width > 1.6; // a phone; otherwise a tablet

  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`
    <style>
      html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
      body {
        display: flex; flex-direction: column; align-items: center;
        background: radial-gradient(120% 70% at 50% 0%, #2f7bff, #1b57bc 45%, #101b3d);
        font-family: ui-rounded, 'SF Pro Rounded', system-ui, sans-serif; color: #fff;
      }
      h1 {
        margin: 0; padding: 0 ${width * 0.07}px; height: ${height * (tall ? 0.17 : 0.15)}px; box-sizing: border-box;
        display: flex; align-items: center; text-align: center; text-wrap: balance;
        font-size: ${width * (tall ? 0.074 : 0.052)}px; line-height: 1.12; font-weight: 900;
      }
      .screen {
        height: ${height * (tall ? 0.8 : 0.82)}px; aspect-ratio: ${width} / ${height};
        border-radius: ${width * 0.045}px; border: ${width * 0.012}px solid #060b1c;
        overflow: hidden; box-shadow: 0 ${width * 0.02}px ${width * 0.06}px rgba(6, 11, 28, 0.45);
        background: #060b1c; box-sizing: border-box;
      }
      .screen img { display: block; width: 100%; height: 100%; }
    </style>
    <h1>${caption}</h1>
    <div class="screen"><img src="data:image/png;base64,${bytes.toString('base64')}"></div>`, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(output, file) });
  console.log('captioned', file, `${width} x ${height}`);
}
await browser.close();
