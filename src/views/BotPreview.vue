<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Bot States Preview</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="preview-container">
        <h2>Robot Animation States</h2>
        <p class="description">Preview all Lottie animation states for the robot character</p>

        <div class="states-grid">
          <div 
            v-for="state in botStates" 
            :key="state.name"
            class="state-card"
            :class="{ active: selectedState === state.name }"
            @click="selectedState = state.name"
          >
            <div class="animation-wrapper">
              <Vue3Lottie
                :animationData="state.animation"
                :loop="true"
                :autoPlay="true"
                :speed="1"
                width="120px"
                height="120px"
              />
            </div>
            <div class="state-info">
              <h3>{{ state.label }}</h3>
              <p>{{ state.description }}</p>
            </div>
          </div>
        </div>

        <div class="selected-preview" v-if="selectedAnimation">
          <h3>Selected: {{ selectedState }}</h3>
          <div class="large-preview">
            <Vue3Lottie
              :key="selectedState"
              :animationData="selectedAnimation"
              :loop="true"
              :autoPlay="true"
              :speed="animationSpeed"
              width="200px"
              height="200px"
            />
          </div>
          <div class="controls">
            <ion-item>
              <ion-label>Speed: {{ animationSpeed.toFixed(1) }}x</ion-label>
              <ion-range
                :min="0.1"
                :max="2"
                :step="0.1"
                :value="animationSpeed"
                @ionChange="animationSpeed = $event.detail.value"
              ></ion-range>
            </ion-item>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton,
  IonItem,
  IonLabel,
  IonRange
} from '@ionic/vue';
import { Vue3Lottie } from 'vue3-lottie';

// Import all animation states
import robotIdle from '@/assets/lottie/robot-idle.json';
import robotHappy from '@/assets/lottie/robot-happy.json';
import robotSad from '@/assets/lottie/robot-sad.json';
import robotTalking from '@/assets/lottie/robot-talking.json';
import robotThinking from '@/assets/lottie/robot-thinking.json';
import robotListening from '@/assets/lottie/robot-listening.json';

export default {
  name: 'BotPreview',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonRange,
    Vue3Lottie
  },
  setup() {
    const selectedState = ref('idle');
    const animationSpeed = ref(1);

    const botStates = [
      {
        name: 'idle',
        label: 'Idle',
        description: 'Default resting state',
        animation: robotIdle
      },
      {
        name: 'happy',
        label: 'Happy',
        description: 'Correct answer celebration',
        animation: robotHappy
      },
      {
        name: 'sad',
        label: 'Sad',
        description: 'Incorrect answer response',
        animation: robotSad
      },
      {
        name: 'talking',
        label: 'Talking',
        description: 'Speaking to the user',
        animation: robotTalking
      },
      {
        name: 'thinking',
        label: 'Thinking',
        description: 'Processing or computing',
        animation: robotThinking
      },
      {
        name: 'listening',
        label: 'Listening',
        description: 'Voice input active',
        animation: robotListening
      }
    ];

    const selectedAnimation = computed(() => {
      const state = botStates.find(s => s.name === selectedState.value);
      return state ? state.animation : null;
    });

    return {
      selectedState,
      animationSpeed,
      botStates,
      selectedAnimation
    };
  }
};
</script>

<style scoped>
.preview-container {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  color: var(--ion-color-primary);
  margin-bottom: 0.5rem;
}

.description {
  text-align: center;
  color: var(--ion-color-medium);
  margin-bottom: 2rem;
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.state-card {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.state-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.state-card.active {
  border-color: var(--ion-color-primary);
  background: var(--ion-color-primary-tint);
}

.animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.state-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--ion-color-dark);
}

.state-info p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

.selected-preview {
  background: var(--ion-color-light);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
}

.selected-preview h3 {
  margin-top: 0;
  text-transform: capitalize;
  color: var(--ion-color-primary);
}

.large-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: var(--ion-background-color);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.controls {
  max-width: 300px;
  margin: 0 auto;
}

ion-range {
  --bar-background: var(--ion-color-medium);
  --bar-background-active: var(--ion-color-primary);
  --knob-background: var(--ion-color-primary);
}
</style>
