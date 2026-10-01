<template>
  <div class="animated-bot-container" :class="[botState, { 'no-3d': !use3D }]">
    <!-- The robot is a full-bleed backdrop; the bubble floats over it. -->
    <div class="bot-stage">
      <!-- 3D robot. Falls back to the Lottie robot if WebGL is unavailable
           or the model fails to load. -->
      <!-- The 3D robot fills the stage, which is sized responsively in CSS so
           it can grow on a phone without overflowing a short screen. -->
      <Robot3D
        v-if="use3D"
        :botState="botState"
        :audioLevel="audioLevel"
        :view="view"
        :headroom="headroom"
        :bodyColor="bodyColor"
        :dayMode="dayMode"
        size="100%"
        @unsupported="use3D = false"
        @anchor="onAnchor"
      />
      <Vue3Lottie
        v-else
        :key="currentAnimationType"
        :animationData="animations[currentAnimationType]"
        :loop="true"
        :autoPlay="true"
        :speed="animationSpeed"
        :width="size"
        :height="size"
      />
    </div>

    <!-- Speech bubble. When the 3D scene reports where the head is on screen
         the bubble follows it, so it reads as coming from the robot rather
         than hovering at the top of the page. -->
    <div v-if="text" class="bubble speech" :class="{ anchored: !!anchor, snap: snapBubble }" :style="bubbleStyle">
      <span class="bubble-text">{{ text }}</span>
      <button class="bubble-close" @click="$emit('dismiss')" :aria-label="closeLabel">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent, markRaw } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';

import robotIdle from '@/assets/lottie/robot-idle.json';
import robotHappy from '@/assets/lottie/robot-happy.json';
import robotSad from '@/assets/lottie/robot-sad.json';
import robotTalking from '@/assets/lottie/robot-talking.json';
import robotThinking from '@/assets/lottie/robot-thinking.json';
import robotListening from '@/assets/lottie/robot-listening.json';

// Module-level and markRaw'd: these never change, so there is no reason to pay
// for deep reactive proxies over six large nested objects.
const ANIMATIONS = markRaw({
  idle: robotIdle,
  happy: robotHappy,
  sad: robotSad,
  talking: robotTalking,
  thinking: robotThinking,
  listening: robotListening
});

const STATE_TO_ANIMATION = {
  neutral: 'idle',
  thinking: 'thinking',
  speaking: 'talking',
  listening: 'listening',
  computing: 'thinking',
  laughing: 'happy',
  happy: 'happy',
  sad: 'sad',
  excited: 'happy',
  proud: 'happy',
  surprised: 'happy',
  confused: 'thinking',
  broken: 'sad',
  sleepy: 'idle'
};

export default {
  name: 'AnimatedBot',
  components: {
    Vue3Lottie,
    // Async so three.js and the 464KB model stay out of the entry chunk.
    Robot3D: defineAsyncComponent(() => import('./Robot3D.vue'))
  },
  emits: ['dismiss'],
  props: {
    closeLabel: {
      type: String,
      default: 'Close message'
    },
    botState: {
      type: String,
      default: 'neutral',
      validator: (value) => [
        'neutral', 'thinking', 'speaking', 'listening', 'computing',
        'laughing', 'happy', 'sad', 'excited', 'proud',
        'surprised', 'confused', 'broken', 'sleepy'
      ].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    // Kept for API compatibility with Home.vue. It no longer gates playback:
    // pausing the robot during the question/answer sequence hid exactly the
    // motion that tells the child whose turn it is.
    isPlayMode: {
      type: Boolean,
      default: true
    },
    // Audio amplitude, 0-1
    audioLevel: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: '200px'
    },
    // 3D camera framing: 'auto' shows the face for expression states and pulls
    // back to the full body for Dance/Jump/ThumbsUp. 'face' or 'full' pin it.
    view: {
      type: String,
      default: 'auto',
      validator: (v) => ['auto', 'face', 'full'].includes(v)
    },
    // Hex for the 3D robot's body panels.
    bodyColor: {
      type: String,
      default: null
    },
    // auto | day | night
    dayMode: {
      type: String,
      default: 'auto'
    }
  },
  data() {
    return {
      use3D: this.supports3D(),
      anchor: null,
      // Suppresses the follow transition for one tick when the bubble appears,
      // so it does not slide in from wherever the head was last time.
      snapBubble: false,
      animations: ANIMATIONS
    };
  },
  computed: {
    currentAnimationType() {
      return STATE_TO_ANIMATION[this.botState] || 'idle';
    },

    // Reserve space at the top of the 3D frame when a speech bubble is showing,
    // so the bubble never lands on the robot's face.
    headroom() {
      return this.text ? 0.16 : 0.04;
    },

    bubbleStyle() {
      if (!this.anchor) return {};
      // Clamped so the bubble never leaves the viewport when the robot walks
      // towards an edge or the camera pulls in close.
      const x = Math.min(82, Math.max(18, this.anchor.x));
      // Clamped so the bubble never rides up under the HUD at the top of the
      // screen, nor drops onto the dock at the bottom.
      const y = Math.min(84, Math.max(17, this.anchor.y));
      return { left: `${x}%`, top: `${y}%` };
    },

    animationSpeed() {
      if (this.botState === 'speaking' && this.audioLevel > 0) {
        return 1 + (this.audioLevel * 0.8);
      }
      if (this.botState === 'sleepy') {
        return 0.5;
      }
      if (['excited', 'laughing', 'happy'].includes(this.botState)) {
        return 1.3;
      }
      return 1;
    }
  },
  watch: {
    text(value, previous) {
      if (value && !previous) {
        this.snapBubble = true;
        this.$nextTick(() => {
          requestAnimationFrame(() => { this.snapBubble = false; });
        });
      }
    }
  },
  methods: {
    onAnchor(point) {
      this.anchor = point;
    },

    // Cheap capability probe before we try to load three.js at all.
    supports3D() {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl2') || canvas.getContext('webgl'))
        );
      } catch {
        return false;
      }
    }
  }
};
</script>

<style scoped>
.animated-bot-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  /* No `height: 100%` here. The parent's height comes from a min-height, which
     is not a definite height, so a percentage would resolve to auto and the
     scene would collapse to the height of the bubble. Stretching as a flex item
     fills the parent for real. */
  align-self: stretch;
  flex: 1 1 auto;
  min-height: 0;
}

/* The robot fills the whole stage rather than sitting in a small square, so it
   reads as the scene the child is in rather than an illustration on a page. */
.bot-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

/* The glow circle that used to sit behind the robot is gone: the 3D scene now
   carries state through the robot's own colour, the floor ring and the mouth,
   and a hovering disc broke the illusion of a real place. Kept only for the
   2D Lottie fallback, which has no scene of its own. */
.animated-bot-container.no-3d .bot-stage::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(380px, 80%);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 230, 255, 0.28), transparent 70%);
  pointer-events: none;
}

/* Speech bubble styles */
/* Translucent glass rather than a solid white card, so the scene reads through
   it and it sits in the world instead of on top of it. Dark + blur rather than
   light + transparency: white text on this composites to better than 7:1 even
   over a bright backdrop, whereas a translucent white panel would have put dark
   text over whatever happened to be behind it. */
/* The bubble is a flex row now: text plus a close button. */
.bubble {
  position: relative;
  width: min(290px, 78vw);
  padding: 10px 15px;
  margin-top: 4px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 18, 32, 0.62);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.3);
  /* 0.95rem (about 15px). Deliberately not smaller: this is the primary text
     for a seven-year-old, and early-reader guidance puts the floor around
     here. The long explanation is kept readable by widening the bubble rather
     than by shrinking the type further. */
  font-size: 0.95rem;
  line-height: 1.38;
  color: #ffffff;
  text-align: center;
  font-weight: 500;
  z-index: 10;
  animation: bubbleAppear 0.3s ease-out;
}

.bubble-text {
  flex: 1;
}

.bubble-close {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  margin: -4px -6px -4px 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  cursor: pointer;
}

.bubble-close svg {
  width: 14px;
  height: 14px;
  stroke: #ffffff;
  stroke-width: 2.4;
  stroke-linecap: round;
  fill: none;
}

.bubble-close:focus-visible {
  outline: 2px solid #ffd700;
  outline-offset: 2px;
}

/* Positioned over the robot's head, reported each frame by the 3D scene. The
   translate puts the bubble's tail at that point rather than its centre. */
.bubble.anchored {
  position: absolute;
  margin: 0;
  transform: translate(-50%, -100%);
  transition: left 0.35s ease-out, top 0.35s ease-out;
}

.bubble.anchored.snap {
  /* Only the FOLLOW is suppressed on first appearance, so it does not slide in
     from wherever the head was last time. The fade below still runs - without
     it the bubble flicked into existence. */
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .bubble.anchored {
    transition: none;
  }
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  border: 9px solid transparent;
  border-top-color: rgba(12, 18, 32, 0.62);
  border-bottom: 0;
}

@keyframes bubbleAppear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  p.bubble {
    animation: none;
  }
  .bot-stage::before {
    transition: none;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  p.bubble {
    width: min(250px, 90vw);
    padding: 12px 16px;
    font-size: 1rem;
  }
}
</style>
