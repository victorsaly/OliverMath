// Records the film by driving the real game in Chrome.
//
// Nothing on screen is faked: the game runs as it does for a visitor, the sum
// is asked by the robot, and the answer is heard by the real speech
// recogniser. Three things are arranged so the take is repeatable:
//
//   - the sum is fixed at 7 x 8 (by steering the game's random numbers);
//   - the "microphone" is a sound file, film/answer.wav. When the game asks
//     for the microphone it is given that recording instead of the room;
//   - a ring is drawn where the screen is tapped, since a recording has no finger.
//
// The robot's voice is the same Azure voice the web version plays. Chrome
// cannot record a page's sound when it runs unseen, so each line is saved as
// it is played and laid back in at the same moment by cut.mjs.
//
//   node scripts/film/record.mjs --url http://localhost:8100/ --out film/take
//
// Needs the dev server running (`npm run dev`) and Google Chrome.
//
// The answer recording: any clear recording of a child saying "fifty-six".
// Give it about a second and a half of quiet before the words, so the answer
// comes a moment after "Your turn!", and a few seconds after:
//
//   ffmpeg -i child.m4a -af "adelay=1400:all=1,apad=pad_dur=5" -ar 48000 -ac 1 film/answer.wav
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const url = arg('url', 'http://localhost:8100/');
const out = path.resolve(arg('out', 'film/take'));
const answer = path.resolve(arg('answer', 'film/answer.wav'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, 'frames'), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio',
    '--enable-gpu',
    '--use-angle=metal'
  ]
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const marks = [];
let t0 = 0;
const mark = (label, extra = {}) => {
  const at = (Date.now() - t0) / 1000;
  marks.push({ label, at, ...extra });
  console.log(at.toFixed(2).padStart(6), label, extra.file || '');
};

// The robot's voice. The page asks the game's own service for each line; the
// request is answered from here so that the sound can be kept for the cut.
let spoken = 0;
await page.setRequestInterception(true);
page.on('request', async (request) => {
  if (/\/__film\/answer\.wav$/.test(request.url())) {
    return request.respond({ status: 200, contentType: 'audio/wav', body: readFileSync(answer) });
  }
  if (!/\/api\/speak$/.test(request.url())) return request.continue();
  if (request.method() === 'OPTIONS') {
    return request.respond({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }
  try {
    const reply = await fetch(request.url(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: request.postData() });
    const body = await reply.text();
    const file = `voice-${String(++spoken).padStart(2, '0')}.mp3`;
    writeFileSync(path.join(out, file), Buffer.from(JSON.parse(body).audio, 'base64'));
    page.__lastVoice = { file, text: JSON.parse(request.postData()).text };
    request.respond({ status: reply.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body });
  } catch (error) {
    console.warn('voice request failed:', error.message);
    request.abort();
  }
});

await page.exposeFunction('__filmMark', (label) => {
  if (label === 'voice' && page.__lastVoice) mark('voice', page.__lastVoice);
  else mark(label);
});

await page.evaluateOnNewDocument(() => {
  // A returning player: no first-run pictures, the whole robot in view.
  try {
    localStorage.seenIntro = '1';
    localStorage.botView = 'full';
  } catch (e) { /* private mode */ }

  // 7 x 8. The game picks each number with getRandomInt(3, 12) at this level;
  // only those two calls are steered, everything else stays random.
  const queue = [0.45, 0.55];
  const random = Math.random;
  Math.random = function () {
    if (queue.length && /helpers\.js/.test(new Error().stack || '')) return queue.shift();
    return random();
  };

  // The microphone. Chrome's own option for playing a file as the microphone
  // delivered silence, so the game's request is answered here instead: every
  // time it opens the microphone it gets the recording, from the start.
  const filmAudio = new AudioContext();
  let answerSound = null;
  navigator.mediaDevices.getUserMedia = async function () {
    if (!answerSound) {
      const bytes = await (await fetch('/__film/answer.wav')).arrayBuffer();
      answerSound = await filmAudio.decodeAudioData(bytes);
    }
    await filmAudio.resume();
    const line = filmAudio.createMediaStreamDestination();
    const source = filmAudio.createBufferSource();
    source.buffer = answerSound;
    source.connect(line);
    source.start();
    window.__filmMark('mic-open');
    return line.stream;
  };

  // Note the moment each line of the robot's voice starts.
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (String(this.src).startsWith('data:audio')) window.__filmMark('voice');
    return play.apply(this, arguments);
  };
});

async function tap(selector) {
  const box = await (await page.waitForSelector(selector)).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate((x, y) => {
    const ring = document.createElement('div');
    ring.style.cssText = `position:fixed;left:${x - 34}px;top:${y - 34}px;width:68px;height:68px;border-radius:50%;` +
      'border:5px solid rgba(255,255,255,.95);background:rgba(255,255,255,.28);z-index:9999;pointer-events:none;' +
      'transition:transform .45s ease-out,opacity .45s ease-out;transform:scale(.55);opacity:1';
    document.body.appendChild(ring);
    requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.transform = 'scale(1.25)'; ring.style.opacity = '0'; }));
    setTimeout(() => ring.remove(), 600);
  }, x, y);
  await sleep(260);
  await page.mouse.click(x, y);
}

await page.goto(url, { waitUntil: 'networkidle2' });
await sleep(4000); // let the robot and the sky settle before the camera rolls

// Camera on.
const cdp = await page.createCDPSession();
let frameCount = 0;
const frames = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  const file = `frames/f${String(++frameCount).padStart(5, '0')}.jpg`;
  writeFileSync(path.join(out, file), Buffer.from(data, 'base64'));
  frames.push({ file, at: metadata.timestamp });
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
t0 = Date.now();
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
mark('start');

await sleep(2200);
mark('tap-play');
await tap('.round-btn.play');

await page.waitForSelector('.sum-card', { timeout: 20000 });
mark('sum-shown', { text: await page.$eval('.sum-card', (e) => e.innerText.replace(/\s+/g, ' ')) });

await page.waitForSelector('.round-btn.pad', { timeout: 25000 });
mark('listening');

// What the recogniser hears appears under "Your turn!" as it arrives.
const heard = await page
  .waitForFunction(() => {
    const el = document.querySelector('.listen-heard, .sum-answer b:not(.empty)');
    return el && el.textContent.trim();
  }, { timeout: 12000 })
  .then((h) => h.jsonValue())
  .catch(() => null);
mark('heard', { text: heard || '(nothing)' });

await page.waitForSelector('.reward-panel', { timeout: 30000 });
mark('reward', { text: await page.$eval('.reward-panel', (e) => e.innerText.replace(/\s+/g, ' ')) });
await sleep(4200);

mark('tap-stars');
await tap('.hud-stars');
await page.waitForSelector('.star-hero', { timeout: 10000 });
mark('stars');
await sleep(4200);
mark('end');

await cdp.send('Page.stopScreencast');
await sleep(300);
writeFileSync(path.join(out, 'take.json'), JSON.stringify({ marks, frames, wallStart: t0 }, null, 2));
const span = frames.length > 1 ? frames[frames.length - 1].at - frames[0].at : 0;
console.log(`${frames.length} frames over ${span.toFixed(1)}s (${(frames.length / Math.max(span, 0.1)).toFixed(1)} per second)`);
await browser.close();
