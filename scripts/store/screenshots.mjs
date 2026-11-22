// Takes the store screenshots by playing the real game in Chrome.
//
//   node scripts/store/screenshots.mjs --url http://localhost:8100/ \
//        --width 440 --height 956 --scale 3 --out product/store/iphone-6.9
//
// 440 x 956 at 3x is 1320 x 2868, the 6.9-inch iPhone size. For the 13-inch
// iPad use --width 1032 --height 1376 --scale 2 (2064 x 2752).
//
// As in the film, the first sum is fixed at 7 x 8 and the spoken answer comes
// from film/answer.wav through the game's own microphone request, so the
// "heard" screenshot is the real recogniser at work.
//
// Needs the dev server running (`npm run dev`) and Google Chrome.
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const url = arg('url', 'http://localhost:8100/');
const out = path.resolve(arg('out', 'product/store/iphone-6.9'));
const width = Number(arg('width', 440));
const height = Number(arg('height', 956));
const scale = Number(arg('scale', 3));
const language = arg('language', 'en');
const answer = path.resolve(arg('answer', 'film/answer.wav'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });

function answerOf(text) {
  const m = text.match(/(\d+)\s*(\D)\s*(\d+)/);
  const a = Number(m[1]);
  const b = Number(m[3]);
  if (m[2] === '+') return a + b;
  if (m[2] === '×') return a * b;
  if (m[2] === '÷') return a / b;
  return a - b;
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--enable-gpu', '--use-angle=metal']
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: scale, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[page error]', String(e).slice(0, 200)));

await page.setRequestInterception(true);
page.on('request', (request) => {
  if (/\/__film\/answer\.wav$/.test(request.url())) {
    return request.respond({ status: 200, contentType: 'audio/wav', body: readFileSync(answer) });
  }
  return request.continue();
});

await page.evaluateOnNewDocument((language) => {
  try {
    localStorage.seenIntro = '1';
    localStorage.botView = 'full';
    localStorage.setItem('olivermath_language', language);
  } catch (e) { /* private mode */ }

  // 7 x 8 first; the rest are whatever the game picks.
  const queue = [0.45, 0.55];
  const random = Math.random;
  Math.random = function () {
    if (queue.length && /helpers\.js/.test(new Error().stack || '')) return queue.shift();
    return random();
  };

  // The microphone is the answer recording (see scripts/film/record.mjs).
  const audio = new AudioContext();
  let sound = null;
  navigator.mediaDevices.getUserMedia = async function () {
    if (!sound) sound = await audio.decodeAudioData(await (await fetch('/__film/answer.wav')).arrayBuffer());
    await audio.resume();
    const line = audio.createMediaStreamDestination();
    const source = audio.createBufferSource();
    source.buffer = sound;
    source.connect(line);
    source.start();
    return line.stream;
  };
}, language);

let count = 0;
const shot = async (number, name) => {
  const file = `${String(number).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(out, file) });
  count += 1;
  console.log('saved', file);
};
const pressKey = async (digit) => {
  for (const key of await page.$$('.pad-sheet .pad-key')) {
    if ((await key.evaluate((e) => e.textContent.trim())) === String(digit)) return key.click();
  }
};
const closeBubble = async () => {
  const close = await page.$('.bot-container button[aria-label]');
  if (close) await close.click().catch(() => {});
};

await page.goto(url, { waitUntil: 'networkidle2' });
await sleep(4500);

// 1. The home screen, as a returning player sees it.
await shot(1, 'home');

// 2. A spoken answer: the robot has asked 7 x 8 and heard "56".
await page.click('.round-btn.play');
await page.waitForSelector('.sum-answer b:not(.empty)', { timeout: 40000 });
await sleep(250);
await shot(2, 'answer-heard');

await page.waitForSelector('.reward-panel', { timeout: 20000 });
await sleep(5200);

// 4. The number pad, part-way through an answer - and 3. the reward for a
//    third right answer in a row, which is when the confetti comes.
for (let round = 0; round < 3; round++) {
  await page.click('.round-btn.play');
  await page.waitForSelector('.round-btn.pad', { timeout: 30000 });
  await sleep(500);
  await page.click('.round-btn.pad');
  await sleep(700);
  const digits = String(answerOf(await page.$eval('.pad-sum span', (e) => e.textContent)));
  for (const d of digits.slice(0, -1)) {
    await pressKey(d);
    await sleep(120);
  }
  if (round === 0) {
    if (digits.length === 1) await pressKey(digits);
    await sleep(300);
    await shot(4, 'number-pad');
    if (digits.length > 1) await pressKey(digits.slice(-1));
  } else {
    await pressKey(digits.slice(-1));
  }
  await sleep(150);
  await page.click('.pad-key.ok');
  if (round === 1) {
    await page.waitForSelector('.reward-panel', { timeout: 20000 });
    if (arg('burst', '')) {
      // Several moments after the reward appears, to choose the best one.
      for (const ms of [150, 300, 450, 600, 800, 1000]) {
        await sleep(150);
        await page.screenshot({ path: path.join(out, `burst-${ms}.jpg`), type: 'jpeg', quality: 70 });
      }
      await browser.close();
      process.exit(0);
    }
    await sleep(Number(arg('reward-delay', 800)));
    await shot(3, 'stars-earned');
  }
  await sleep(5200);
}

// 5. Choosing the kind of sum.
await closeBubble();
// The chip steps aside while the robot is talking; wait for it to come back.
// It can go again at any moment if the robot speaks, so try until a tap lands.
for (let attempt = 0; attempt < 8; attempt++) {
  try {
    await page.waitForSelector('.sum-chip', { timeout: 30000 });
    await page.click('.sum-chip');
    await page.waitForSelector('.pick-sheet', { timeout: 3000 });
    break;
  } catch (error) {
    if (attempt === 7) throw error;
  }
}
await sleep(900);
await shot(5, 'choose-sums');
await page.click('.sheet-close');
await sleep(500);

// 6. The stars page.
await page.click('.hud-stars');
await page.waitForSelector('.star-hero', { timeout: 10000 });
await sleep(1200);
await shot(6, 'stars-page');

await browser.close();
console.log(`${count} screenshots at ${width * scale} x ${height * scale} in ${path.relative(process.cwd(), out)}`);
