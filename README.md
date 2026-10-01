# Oliver Math

**A voice-controlled maths game for children aged 7+.** A 3D robot asks a maths
question out loud, your child answers by speaking, and correct answers earn
stars.

[**Play it here →**](https://victorsaly.github.io/OliverMath/)

> Built by my son, who wanted a robot that talks and listens like Alexa, but for
> his times tables.

---

## What it does

- **Speak your answer.** Azure Speech recognises what the child says; there is
  nothing to type and nothing to read.
- **A robot that reacts.** A 3D character listens, thinks, celebrates and
  commiserates, in a scene with a day/night cycle, drifting numbers and birds.
- **Says what it wants.** Tap *Tell me how* and the robot explains the game
  aloud — the written instructions are no use to a child who cannot read
  fluently yet.
- **Five languages.** English, Spanish, French, German and Portuguese, including
  the robot's voice.
- **Stars, streaks and badges**, with history and per-operator statistics.
- **Adaptive difficulty** and practice modes that revisit weak operators or
  recent mistakes.
- **Works offline.** Installable as a PWA; the model, code and assets are
  precached.

## Accessibility

The game is designed for a child who may not read fluently, so no state depends
on text alone:

- Every state is carried by **colour, shape and motion together** — the robot's
  colour, its expression, the ring on the floor, and a written word.
- **Speaking and listening are visible with the sound off**: the screen edges
  pulse blue while the robot talks and green while it listens.
- **Silence is never scored as a wrong answer.** In a noisy room a missed
  answer is the most likely outcome of a turn, so it earns a retry, not a
  failure.
- `prefers-reduced-motion` is honoured throughout: the decorative loops and the
  confetti stop, while the feedback that carries meaning stays.
- Touch targets are 44px or larger and pinch-zoom is not disabled.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:8100
```

The frontend runs on its own, but speech needs the backend.

### Backend

Four Azure Functions in [`azure/functions`](azure/functions):

| Endpoint | Purpose |
| --- | --- |
| `GET /api/speechToken` | Issues a short-lived Azure Speech token, so the key never reaches the browser |
| `POST /api/validateAnswer` | Interprets the spoken answer (`"fifty six"` → `56`) and checks it |
| `POST /api/speak` | Text to speech |
| `POST /api/chat` | Chat proxy |

```bash
cd azure/functions
npm install
func start           # http://localhost:7071
```

Create `azure/functions/local.settings.json` (gitignored):

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "OPENAI_API_KEY": "sk-...",
    "OPENAI_MODEL": "gpt-4o-mini",
    "AZURE_SPEECH_KEY": "...",
    "AZURE_SPEECH_REGION": "eastus"
  },
  "Host": { "CORS": "*" }
}
```

> **Note:** a `.env.local` at the project root does **not** configure the
> backend — the Functions host reads `local.settings.json`. The only variable
> the frontend reads is `VITE_API_BASE_URL`; Vite exposes nothing without the
> `VITE_` prefix, which is also why no key can leak into the bundle.

### Scripts

```bash
npm run dev        # dev server
npm run build      # production build into docs/ (GitHub Pages)
npm run lint       # eslint
npm run typecheck  # vue-tsc
npm run test:unit  # vitest
npm run test:e2e   # cypress
```

## How it is built

| | |
| --- | --- |
| Frontend | Vue 3 + Ionic 8, Vite |
| 3D | three.js, `RobotExpressive.glb` |
| 2D fallback | Lottie, used when WebGL is unavailable |
| Speech | Azure Cognitive Services Speech SDK |
| Backend | Azure Functions (Node) |
| Packaging | vite-plugin-pwa, Capacitor |

### Performance

three.js, the GLTF loader and the robot component are **lazy chunks** and are
absent from the entry bundle's `modulepreload` — the 3D scene is fetched after
first paint. The 464KB model is precached by the service worker so the game
still works offline.

The 3D scene pauses rendering when it is off screen or the tab is hidden, and
disposes its renderer, geometry, materials and textures on unmount.

### Where things are

```
src/
  components/
    Robot3D.vue       3D robot, scene, day/night cycle, camera framing
    AnimatedBot.vue   public API; picks 3D or Lottie, owns the speech bubble
    Achievements.vue  badges
  views/
    Home.vue          the game loop
    Stats.vue         progress
  services/           api, history, sound and music
  config/
    i18n.js           all five languages
    gameConfig.js     levels, operators, scoring
azure/functions/      the backend
```

## Credits

**RobotExpressive.glb** by [Tomás Laulhé](https://www.patreon.com/quaternius),
CC0 1.0, with facial morph targets added by
[Don McCurdy](https://donmccurdy.com/). Obtained from the
[three.js](https://github.com/mrdoob/three.js) examples. See
[`public/models/CREDITS.md`](public/models/CREDITS.md).

Sound effects and the ambient music are synthesised with the Web Audio API — no
audio files are shipped.
