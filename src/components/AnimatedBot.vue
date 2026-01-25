<template>
  <div class="animated-bot-container" :class="botState">
    <!-- Speech Bubble Overlay -->
    <p v-if="text" class="bubble speech">
      {{ text }}
    </p>
    
    <!-- Lottie Animation -->
    <div class="lottie-wrapper" v-if="currentAnimation">
      <Vue3Lottie
        ref="lottieRef"
        :key="botState"
        :animationData="currentAnimation"
        :loop="true"
        :autoPlay="true"
        :speed="animationSpeed"
        :width="size"
        :height="size"
        @animLoop="onAnimationLoop"
      />
    </div>
  </div>
</template>

<script>
import { Vue3Lottie } from 'vue3-lottie';

// Import all animation states
import robotIdle from '@/assets/lottie/robot-idle.json';
import robotHappy from '@/assets/lottie/robot-happy.json';
import robotSad from '@/assets/lottie/robot-sad.json';
import robotTalking from '@/assets/lottie/robot-talking.json';
import robotThinking from '@/assets/lottie/robot-thinking.json';
import robotListening from '@/assets/lottie/robot-listening.json';

export default {
  name: 'AnimatedBot',
  components: {
    Vue3Lottie
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
    isPlayMode: {
      type: Boolean,
      default: true
    },
    // Audio amplitude for lip sync (0-1)
    audioLevel: {
      type: Number,
      default: 0
    },
    // Bot size
    size: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      // Map of animation data files
      animations: {
        idle: robotIdle,
        happy: robotHappy,
        sad: robotSad,
        talking: robotTalking,
        thinking: robotThinking,
        listening: robotListening
      }
    };
  },
  computed: {
    // Map botState to the appropriate animation
    currentAnimation() {
      const stateToAnimation = {
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
      
      const animationKey = stateToAnimation[this.botState] || 'idle';
      // Always return a valid animation, fallback to idle if not found
      return this.animations[animationKey] || this.animations.idle;
    },
    
    // Adjust animation speed based on state and audio level
    animationSpeed() {
      // Speed up talking animation based on audio level
      if (this.botState === 'speaking' && this.audioLevel > 0) {
        return 1 + (this.audioLevel * 0.8); // 1x to 1.8x speed
      }
      
      // Slow down for sleepy state
      if (this.botState === 'sleepy') {
        return 0.5;
      }
      
      // Speed up for excited states
      if (['excited', 'laughing', 'happy'].includes(this.botState)) {
        return 1.3;
      }
      
      return 1;
    }
  },
  methods: {
    onAnimationLoop() {
      // Can be used to trigger events on animation loop
      this.$emit('animation-loop');
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
  justify-content: center;
  width: 100%;
}

.lottie-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease, filter 0.3s ease;
}

/* State-based visual effects */
.animated-bot-container.happy .lottie-wrapper,
.animated-bot-container.excited .lottie-wrapper,
.animated-bot-container.laughing .lottie-wrapper {
  filter: drop-shadow(0 4px 25px rgba(255, 200, 50, 0.4));
}

.animated-bot-container.sad .lottie-wrapper,
.animated-bot-container.broken .lottie-wrapper {
  filter: drop-shadow(0 4px 15px rgba(100, 100, 150, 0.3));
}

.animated-bot-container.speaking .lottie-wrapper {
  filter: drop-shadow(0 4px 25px rgba(100, 200, 255, 0.4));
}

.animated-bot-container.listening .lottie-wrapper {
  filter: drop-shadow(0 4px 25px rgba(50, 230, 130, 0.4));
}

.animated-bot-container.thinking .lottie-wrapper,
.animated-bot-container.computing .lottie-wrapper {
  filter: drop-shadow(0 4px 25px rgba(255, 180, 50, 0.4));
}

/* Speech bubble styles */
p.bubble {
  position: relative;
  width: min(300px, 80vw);
  padding: 15px 20px;
  margin-bottom: 20px;
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
}

p.bubble::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-top-color: #ffffff;
  border-bottom: 0;
}

/* Empty bubble (no text) should be hidden */
p.bubble:empty {
  display: none;
}

/* Animation for speech bubble appearance */
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

p.bubble {
  animation: bubbleAppear 0.3s ease-out;
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
