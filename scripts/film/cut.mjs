// Cuts the take recorded by record.mjs into the film.
//
//   picture  the recorded frames at their real timing, then a closing card
//   sound    the robot's lines and the spoken answer, each laid in at the
//            moment it happened in the take
//
//   node scripts/film/cut.mjs --take film/take --out film/oliver-math.mp4
//
// Needs ffmpeg, Google Chrome and puppeteer-core.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const take = path.resolve(arg('take', 'film/take'));
const out = path.resolve(arg('out', 'film/oliver-math.mp4'));
const answer = path.resolve(arg('answer', 'film/answer.wav'));
const CARD_SECONDS = 4;
const FADE = 0.5;

const { marks, frames, wallStart } = JSON.parse(readFileSync(path.join(take, 'take.json'), 'utf8'));
const videoStart = frames[0].at;
const videoEnd = frames[frames.length - 1].at;
const length = videoEnd - videoStart;
// Marks are counted from when the camera was switched on; frames carry the
// clock time. This puts a mark on the film's own timeline.
const onFilm = (mark) => wallStart / 1000 + mark.at - videoStart;

// 1. Picture: each frame is held for exactly as long as it was on screen.
const list = ['ffconcat version 1.0'];
frames.forEach((frame, i) => {
  const next = frames[i + 1];
  list.push(`file '${frame.file}'`, `duration ${(next ? next.at - frame.at : 1 / 60).toFixed(5)}`);
});
writeFileSync(path.join(take, 'frames.txt'), list.join('\n') + '\n');

// 2. The closing card, drawn in the game's colours.
const cardFile = path.join(take, 'card.png');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new'
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.setContent(`
  <style>
    body { margin: 0; height: 100vh; display: grid; place-items: center; text-align: center;
           background: radial-gradient(120% 80% at 50% 30%, #2a74ea, #1b57bc 45%, #101b3d);
           font-family: ui-rounded, 'SF Pro Rounded', system-ui, sans-serif; color: #fff; }
    .name { font-size: 54px; font-weight: 900; } .name span { color: #ffc62e; }
    .line { margin-top: 10px; font-size: 26px; font-weight: 800; }
    .langs { margin-top: 28px; font-size: 15px; font-weight: 700; color: #cfd8f0; line-height: 1.7; }
  </style>
  <div>
    <div class="name">Oliver<span>Math</span></div>
    <div class="line">Maths, out loud.</div>
    <div class="langs">English · Español · Français<br>Deutsch · Português</div>
  </div>`);
await page.screenshot({ path: cardFile });
await browser.close();

// 3. Sound: every line of the robot's voice, and the answer each time the
//    microphone was opened during the take.
const inputs = ['-f', 'concat', '-safe', '0', '-i', 'frames.txt', '-loop', '1', '-t', String(CARD_SECONDS + FADE), '-i', cardFile];
const mixes = [];
let n = 2;
const lay = (file, at, volume) => {
  inputs.push('-i', file);
  mixes.push(`[${n}:a]aresample=48000,volume=${volume},adelay=${Math.round(at * 1000)}:all=1[a${n}]`);
  n += 1;
};
marks.filter((m) => m.label === 'voice' && onFilm(m) >= 0).forEach((m) => lay(path.join(take, m.file), onFilm(m), 1.0));
marks.filter((m) => m.label === 'mic-open' && onFilm(m) >= 0 && onFilm(m) < length).forEach((m) => lay(answer, onFilm(m), 0.9));

const total = length + CARD_SECONDS;
const filter = [
  '[0:v]fps=60,scale=780:1688,format=yuv420p[take]',
  '[1:v]fps=60,scale=780:1688,format=yuv420p[card]',
  `[take][card]xfade=transition=fade:duration=${FADE}:offset=${(length - FADE).toFixed(3)}[v]`,
  ...mixes,
  `${mixes.map((_, i) => `[a${i + 2}]`).join('')}amix=inputs=${mixes.length}:normalize=0,` +
    `afade=t=out:st=${(total - 1).toFixed(2)}:d=1,apad=whole_dur=${total.toFixed(2)}[a]`
].join(';');

execFileSync('ffmpeg', [
  '-v', 'error', '-y', ...inputs,
  '-filter_complex', filter, '-map', '[v]', '-map', '[a]',
  '-t', total.toFixed(2),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-c:a', 'aac', '-b:a', '128k', out
], { cwd: take, stdio: 'inherit' });

console.log(`${path.relative(process.cwd(), out)}: ${total.toFixed(1)}s, ${mixes.length} sounds laid in`);
