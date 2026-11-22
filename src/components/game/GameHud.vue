<template>
  <!-- Floating HUD. No toolbar: the robot's world is the interface, so the
       controls sit over the scene as glass buttons instead of inside a bar. -->
  <div class="hud">
    <div class="hud-left">
      <!-- The grown-ups door. Level, language, sound and anything that leaves
           the app sit behind a gate a young child cannot pass by accident, as
           the Kids Category requires. -->
      <button class="hud-btn" @click="$emit('grown-ups')" :aria-label="t('grownUps')">
        <ion-icon :icon="lockIcon" aria-hidden="true"></ion-icon>
      </button>
      <!-- Permanent entry point. This used to live only inside the first-run
           card, which meant it disappeared forever after one dismissal. -->
      <button class="hud-btn help" @click="$emit('help')" :aria-label="t('howToPlay')">
        <ion-icon :icon="helpIcon" aria-hidden="true"></ion-icon>
      </button>
      <!-- Tapping holds the sky at day or night; the automatic cycle can be
           restored from Grown-ups. The icon shows what the tap will give you. -->
      <button class="hud-btn sky" @click="$emit('toggle-sky')" :aria-label="t('dayNight')">
        <ion-icon :icon="dayMode === 'night' ? sunIcon : moonIcon" aria-hidden="true"></ion-icon>
      </button>
    </div>

    <!-- Wordmark. Absolutely centred rather than a flex child, so it stays put
         when the star count grows a digit and the right group widens. -->
    <p class="wordmark" aria-label="Oliver Math">
      <ion-icon :icon="calculatorIcon" class="wordmark-icon" aria-hidden="true"></ion-icon>
      <span class="wordmark-words"><span class="wordmark-oliver">Oliver</span><span class="wordmark-math">Math</span></span>
    </p>

    <div class="hud-right">
      <router-link to="/stats" class="hud-stars" aria-label="View stats and achievements">
        <ion-icon :icon="starIcon" aria-hidden="true"></ion-icon>
        <span>{{ stars }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { star, calculator, helpCircle, sunny, moon, lockClosed } from 'ionicons/icons';
import { t } from '@/config/i18n';

/**
 * The top bar: the grown-ups door, help and the sky toggle on the left, the
 * child's stars on the right.
 */
export default {
  name: 'GameHud',
  components: { IonIcon },
  props: {
    language: { type: String, required: true },
    stars: { type: Number, default: 0 },
    dayMode: { type: String, default: 'auto' }
  },
  emits: ['grown-ups', 'help', 'toggle-sky'],
  setup() {
    return {
      starIcon: star,
      calculatorIcon: calculator,
      helpIcon: helpCircle,
      sunIcon: sunny,
      moonIcon: moon,
      lockIcon: lockClosed
    };
  },
  methods: {
    t(key) {
      return t(this.language, key);
    }
  }
};
</script>

<style scoped>
/* ---------------------------------------------------------------------------
   Immersive chrome. There is no toolbar: the robot's world runs edge to edge
   and the controls float over it as glass. Everything here respects the safe
   area, because a full-bleed layout puts controls under the notch otherwise.
   --------------------------------------------------------------------------- */

.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px;
  pointer-events: none;
}

.hud > *,
.hud-left > *,
.hud-right > * {
  pointer-events: auto;
}

.hud-right,
.hud-left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
}

.hud-btn.help {
  border-color: rgba(255, 215, 0, 0.45);
  color: #ffd700;
}

.hud-btn.sky {
  border-color: rgba(160, 200, 255, 0.5);
  color: #cfe4ff;
}

/* 48px, comfortably above the 44px minimum. The old icon buttons were 28px. */
.hud-btn {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(16, 24, 40, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease;
}

.hud-btn:hover {
  background: rgba(16, 24, 40, 0.6);
}

.hud-btn:active {
  transform: scale(0.94);
}

.hud-btn:focus-visible,
.hud-stars:focus-visible,
.round-btn:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

.hud-flag {
  font-size: 22px;
  line-height: 1;
}

.hud-stars {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 5px;
  height: 44px;
  padding: 0 12px;
  border-radius: 22px;
  border: 1px solid rgba(255, 215, 0, 0.45);
  background: rgba(16, 24, 40, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

/* Wordmark ----------------------------------------------------------------- */

/* A flex child between the two button groups, NOT absolutely centred.
   Centring it with position:absolute meant it was laid out independently of
   the buttons, so on a phone it sat straight on top of them - the icons
   appeared to collapse and the words overlapped them. As a flex item it gets
   its own space and shrinks before anything collides. */
.wordmark {
  flex: 0 1 auto;
  min-width: 0;
  margin: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Only the icon is spaced away; the two words sit tight together so they
     read as one mark rather than two labels. */
  gap: 6px;
  font-size: clamp(14px, 3.6vw, 21px);
  font-weight: 800;
  letter-spacing: -0.4px;
  white-space: nowrap;
  overflow: hidden;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
}

/* Hidden outright on phones. Five controls plus a mark do not fit across a
   phone at any size that leaves the mark legible: at 320px the two button
   groups alone need 283px of a 296px content box. Showing just the icon still
   crowded the controls on a real device, so the mark is desktop and tablet
   only - the app is identified by its own icon on a phone home screen anyway. */
@media (max-width: 767px) {
  .wordmark {
    display: none;
  }
}

.wordmark-oliver {
  color: #ffffff;
}

/* Solid gold with a brightness pulse, not a gradient clipped to the text:
   background-clip renders the glyphs dark wherever the gradient happens to be
   mid-sweep, and it drops out entirely where it is unsupported. */
.wordmark-math {
  color: #ffd700;
  animation: wordmark-pulse 4s ease-in-out infinite;
}

.wordmark-words {
  display: inline-flex;
  gap: 2px;
}

/* Tilted and gently rocking - a calculator sitting perfectly straight looked
   like a toolbar icon rather than part of a logo. */
.wordmark-icon {
  font-size: 1.3em;
  color: #ffd700;
  transform-origin: 50% 70%;
  animation: wordmark-wiggle 3.2s ease-in-out infinite;
}

@keyframes wordmark-wiggle {
  0%, 100% { transform: rotate(-9deg) translateY(0); filter: brightness(1); }
  35% { transform: rotate(7deg) translateY(-1px); filter: brightness(1.3); }
  70% { transform: rotate(-4deg) translateY(0.5px); filter: brightness(1.1); }
}

@keyframes wordmark-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}

@media (prefers-reduced-motion: reduce) {
  .wordmark-math,
  .wordmark-icon {
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hud-btn,
  .round-btn {
    transition: none;
  }
}
</style>
