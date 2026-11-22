<template>
  <!-- Transparent dock over the scene: a status pill and one round control.
       No toolbar chrome - the 3D world runs edge to edge behind it. -->
  <div class="dock" :class="{ 'play-mode': playing }">
    <!-- Listening panel: a pre-reading child needs to know the microphone is
         open without reading a word, so this leads with an animated mic and
         level bars, with the transcript underneath only once there is one. -->
    <transition name="panel">
      <div class="listen-panel" v-if="listening" role="status" aria-live="polite">
        <span class="listen-bars" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i>
        </span>
        <span class="listen-text">{{ t('yourTurn') }}</span>
        <span class="listen-heard" v-if="heardText">{{ heardText }}</span>
      </div>
    </transition>

    <!-- Correct answer: the star and the equation carry it, not the words. -->
    <transition name="panel">
      <div class="reward-panel" v-if="reward" role="status" aria-live="polite">
        <ion-icon :icon="starIcon" class="reward-star" aria-hidden="true"></ion-icon>
        <span class="reward-points">+{{ reward.points }}</span>
        <span class="reward-equation">{{ reward.equation }}</span>
        <span class="reward-streak" v-if="reward.streak >= 3">{{ t('streak') }} {{ reward.streak }}</span>
      </div>
    </transition>

    <!-- Hidden while listening: the "Your turn!" panel already says it, and
         four things in one row pushed the number pad button off a phone. -->
    <div class="status-pill" :class="botState" v-if="showStatus" role="status" aria-live="polite">
      <ion-icon :icon="statusIcon" aria-hidden="true"></ion-icon>
      <span>{{ statusText }}</span>
    </div>

    <!-- What the child is practising, and theirs to change. It used to be
         four bare symbols inside Settings. Hidden on a first visit, where
         the three step pictures have this place. -->
    <button
      class="sum-chip"
      v-if="playing && !firstRun && !talking && sums"
      @click="$emit('choose-sums')"
      :aria-label="t('changeSums')"
    >
      <b aria-hidden="true">{{ sums.symbol }}</b>
      <span>{{ sums.word }}</span>
      <ion-icon :icon="chevronIcon" aria-hidden="true"></ion-icon>
    </button>

    <!-- Centred, large and named. It was a bare icon at the bottom right. -->
    <div class="play-wrap" v-if="playing">
      <button
        class="round-btn play"
        @click="$emit('play')"
        :disabled="computing"
        :aria-label="t('play')"
      >
        <ion-spinner name="crescent" v-if="computing"></ion-spinner>
        <ion-icon :icon="playIcon" v-else aria-hidden="true"></ion-icon>
      </button>
      <span class="play-label" aria-hidden="true">{{ t('play') }}</span>
    </div>

    <!-- Lets the child end their turn themselves instead of waiting for the
         recogniser to time out. Only shown while the mic is actually open. -->
    <button
      v-else-if="listening"
      class="round-btn done"
      @click="$emit('done')"
      :aria-label="t('stop')"
    >
      <ion-icon :icon="doneIcon" aria-hidden="true"></ion-icon>
    </button>

    <!-- Always one tap away while it is the child's turn: a noisy room, a
         shy child, or a recogniser that keeps mishearing "eight". -->
    <button
      v-if="listening && !padOpen"
      class="round-btn pad"
      @click="$emit('pad')"
      :aria-label="t('numberPad')"
    >123</button>

  </div>
</template>

<script>
import { IonIcon, IonSpinner } from '@ionic/vue';
import { star, play, mic, volumeHigh, sync, alertCircle, stopCircle, chevronUp } from 'ionicons/icons';
import { t } from '@/config/i18n';

/**
 * The band along the bottom of the game: whose turn it is, the reward for a
 * right answer, and the one control that matters at that moment - Play, or
 * the stop and number-pad buttons while the child is answering.
 */
export default {
  name: 'GameDock',
  components: { IonIcon, IonSpinner },
  props: {
    language: { type: String, required: true },
    botState: { type: String, default: 'neutral' },
    playing: { type: Boolean, default: true },
    listening: { type: Boolean, default: false },
    talking: { type: Boolean, default: false },
    computing: { type: Boolean, default: false },
    firstRun: { type: Boolean, default: false },
    padOpen: { type: Boolean, default: false },
    heardText: { type: String, default: '' },
    reward: { type: Object, default: null },
    // The kind of sum being practised: { symbol, word }.
    sums: { type: Object, default: null }
  },
  emits: ['play', 'done', 'pad', 'choose-sums'],
  setup() {
    return {
      starIcon: star,
      playIcon: play,
      micIcon: mic,
      volumeIcon: volumeHigh,
      syncIcon: sync,
      alertIcon: alertCircle,
      doneIcon: stopCircle,
      chevronIcon: chevronUp
    };
  },
  computed: {
    statusText() {
      switch (this.botState) {
        case 'speaking': return this.t('speaking');
        case 'listening': return this.t('listening');
        case 'computing': return this.t('thinking');
        case 'broken': return 'Error';
        case 'laughing': return 'Haha!';
        case 'happy': return this.t('correct') + '! 🎉';
        case 'sad': return '...';
        case 'excited': return '🎉';
        case 'proud': return '⭐';
        case 'surprised': return '!';
        case 'confused': return '?';
        default: return this.t('ready');
      }
    },
    statusIcon() {
      switch (this.botState) {
        case 'speaking': return this.volumeIcon;
        case 'listening': return this.micIcon;
        case 'computing': return this.syncIcon;
        case 'broken': return this.alertIcon;
        case 'happy': return this.starIcon;
        case 'sad': return this.alertIcon;
        case 'excited': return this.starIcon;
        case 'proud': return this.starIcon;
        case 'surprised': return this.starIcon;
        case 'confused': return this.syncIcon;
        default: return this.syncIcon;
      }
    },
    /**
     * One thing at a time along the bottom. "Ready to play!" beside a button
     * that says Play said it twice, and the listening panel already says whose
     * turn it is.
     */
    showStatus() {
      if (!this.statusText || this.listening || this.padOpen) return false;
      if (this.playing && this.statusText === this.t('ready')) return false;
      return true;
    }
  },
  methods: {
    t(key) {
      return t(this.language, key);
    }
  }
};
</script>

<style scoped>
.hud-btn:focus-visible,
.hud-stars:focus-visible,
.round-btn:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

/* Dock -------------------------------------------------------------------- */

.dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* One row: status and control side by side, so they occupy a single band at
     the bottom and leave the robot as much of the screen as possible. */
  gap: 12px;
  padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
  pointer-events: none;
  background: linear-gradient(to top, rgba(10, 14, 26, 0.62), transparent);
}

.dock > * {
  pointer-events: auto;
}

/* One big round control instead of a full-width rectangle, which read as a
   form submit rather than a game. 84px is a generous target for a child. */
.round-btn {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  font-size: 29px;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.round-btn:active {
  transform: scale(0.93);
}

.round-btn[disabled] {
  opacity: 0.6;
  cursor: default;
}

.round-btn.play {
  width: 92px;
  height: 92px;
  font-size: 42px;
  border: 4px solid #ffffff;
  background: linear-gradient(145deg, #2a74ea, #1b57bc);
}
.round-btn.play ion-icon {
  /* The triangle's visual centre sits left of its box. */
  margin-left: 5px;
}
.play-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.play-label {
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 6px rgba(10, 14, 26, 0.7);
}
/* With Play on screen the dock stacks: a reward or status above, Play below. */
.dock.play-mode {
  flex-direction: column;
  gap: 10px;
}

/* The child's choice of sum ------------------------------------------------- */
.sum-chip {
  min-height: 44px;
  padding: 6px 14px 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(16, 27, 61, 0.86);
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}
.sum-chip b {
  color: #ffc62e;
  font-size: 24px;
  line-height: 1;
}
.sum-chip span::first-letter,
.pick-tile span::first-letter {
  text-transform: uppercase;
}
.sum-chip ion-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}
.sum-chip:focus-visible,
.pick-tile:focus-visible {
  outline: 3px solid #ffc62e;
  outline-offset: 2px;
}

/* Not success green: green with a tick is the correct-answer signal, and a
   control must not borrow the vocabulary of feedback. */
.round-btn.done {
  background: linear-gradient(145deg, #5a4dc4, #3a3192);
}
.round-btn.pad {
  background: linear-gradient(160deg, #26355f, #18233f);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

/* Listening panel ---------------------------------------------------------- */

.listen-panel,
.reward-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 20px;
  background: rgba(10, 14, 26, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #ffffff;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.listen-panel {
  border-color: rgba(51, 230, 102, 0.55);
}

.listen-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 22px;
}

.listen-bars i {
  width: 4px;
  border-radius: 2px;
  background: #6ef09a;
  animation: listen-bar 0.9s ease-in-out infinite;
}

.listen-bars i:nth-child(1) { height: 40%; animation-delay: 0s; }
.listen-bars i:nth-child(2) { height: 70%; animation-delay: 0.12s; }
.listen-bars i:nth-child(3) { height: 100%; animation-delay: 0.24s; }
.listen-bars i:nth-child(4) { height: 65%; animation-delay: 0.36s; }
.listen-bars i:nth-child(5) { height: 45%; animation-delay: 0.48s; }

@keyframes listen-bar {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

.listen-text {
  font-size: 16px;
  font-weight: 700;
}

.listen-heard {
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 14px;
  font-weight: 600;
}

/* Reward panel ------------------------------------------------------------- */

.reward-panel {
  border-color: rgba(255, 215, 0, 0.55);
}

.reward-star {
  font-size: 26px;
  color: #ffd700;
}

.reward-points {
  font-size: 20px;
  font-weight: 800;
  color: #ffd700;
}

.reward-equation {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.reward-streak {
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.18);
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

@media (prefers-reduced-motion: reduce) {
  .listen-bars i {
    animation: none;
  }
}

/* Status pill: carries state in colour AND an icon AND a word, so it does not
   depend on colour alone. Replaces the ion-chip, whose shadow DOM overrode the
   background and left white text at ~1.06:1 in light mode. */
.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(10, 14, 26, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
}

.status-pill ion-icon {
  font-size: 18px;
  color: #8fd8ff;
}

.status-pill.listening {
  border-color: rgba(51, 230, 102, 0.6);
}

.status-pill.listening ion-icon {
  color: #6ef09a;
}

.status-pill.speaking ion-icon {
  color: #7fdcff;
}

.status-pill.computing ion-icon,
.status-pill.thinking ion-icon {
  color: #ffc766;
}

.status-pill.broken {
  border-color: rgba(255, 122, 147, 0.6);
}

.status-pill.broken ion-icon {
  color: #ff9aae;
}

@media (prefers-reduced-motion: reduce) {
  .hud-btn,
  .round-btn {
    transition: none;
  }
}
</style>
