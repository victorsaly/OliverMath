<template>
  <div class="animated-bot-container" :class="botState">
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
        size="100%"
        @unsupported="use3D = false"
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

    <!-- Speech Bubble Overlay -->
    <p v-if="text" class="bubble speech">
      {{ text }}
    </p>
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
  props: {
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
    }
  },
  data() {
    return {
      use3D: this.supports3D(),
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
      return this.text ? 0.55 : 0.12;
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
  methods: {
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

/* The state glow sits on a pseudo-element so we animate opacity rather than
   the filter itself, which would re-rasterise the whole robot every frame. */
.bot-stage::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(420px, 85%);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 230, 255, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
  pointer-events: none;
}

.animated-bot-container.happy .bot-stage::before,
.animated-bot-container.excited .bot-stage::before,
.animated-bot-container.laughing .bot-stage::before,
.animated-bot-container.proud .bot-stage::before {
  background: radial-gradient(circle, rgba(255, 200, 50, 0.4), transparent 70%);
  opacity: 1;
}

.animated-bot-container.sad .bot-stage::before,
.animated-bot-container.broken .bot-stage::before {
  background: radial-gradient(circle, rgba(100, 100, 150, 0.3), transparent 70%);
  opacity: 1;
}

.animated-bot-container.speaking .bot-stage::before {
  background: radial-gradient(circle, rgba(100, 200, 255, 0.4), transparent 70%);
  opacity: 1;
}

.animated-bot-container.listening .bot-stage::before {
  background: radial-gradient(circle, rgba(50, 230, 130, 0.4), transparent 70%);
  opacity: 1;
}

.animated-bot-container.thinking .bot-stage::before,
.animated-bot-container.computing .bot-stage::before {
  background: radial-gradient(circle, rgba(255, 180, 50, 0.4), transparent 70%);
  opacity: 1;
}

/* Speech bubble styles */
p.bubble {
  position: relative;
  width: min(300px, 80vw);
  padding: 15px 20px;
  margin-top: 8px;
  margin-bottom: 35px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff, #f0f4f8);
  border-radius: 20px;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 1.1rem;
  line-height: 1.4;
  color: #2d3748;
  text-align: center;
  font-weight: 500;
  z-index: 10;
  animation: bubbleAppear 0.3s ease-out;
}

p.bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  /* Matches the bubble's bottom gradient stop so the tail has no seam. */
  border-top-color: #f0f4f8;
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
