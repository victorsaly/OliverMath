<template>
  <!-- No microphone, or (in the apps) no speech model for the language yet.
       Never a dead end: the first button always leads to a playable game. -->
  <transition name="sheet">
    <div class="nomic-sheet" v-if="noMic" role="dialog" aria-labelledby="nomic-title">
      <button class="sheet-close" @click="$emit('close')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <h2 id="nomic-title">{{ t('cantHearTitle') }}</h2>
      <p>{{ noMicBody }}</p>
      <button class="sheet-btn primary" @click="$emit('use-pad')">
        <span class="sheet-123" aria-hidden="true">123</span>{{ t('useNumberPad') }}
      </button>
      <button class="sheet-btn" @click="$emit('retry')">
        <ion-icon :icon="micIcon" aria-hidden="true"></ion-icon>{{ refused ? t('openSettings') : t('tryMicrophone') }}
      </button>
    </div>
  </transition>

  <!-- Before the phone asks for the microphone. The system's question is
       written for adults and appears on a child's first Play; the robot asks
       for a grown-up first, so the answer is not a child's guess. -->
  <transition name="sheet">
    <div class="nomic-sheet" v-if="asking" role="dialog" aria-labelledby="micask-title">
      <h2 id="micask-title">{{ t('micAskTitle') }}</h2>
      <p>{{ t('micAskBody') }}</p>
      <button class="sheet-btn primary" @click="$emit('answer', true)">
        <ion-icon :icon="micIcon" aria-hidden="true"></ion-icon>{{ t('micAskOk') }}
      </button>
      <button class="sheet-btn" @click="$emit('answer', false)">
        <span class="sheet-123" aria-hidden="true">123</span>{{ t('useNumberPad') }}
      </button>
    </div>
  </transition>

  <!-- The phone is fetching the speech model for this language. It happens
       once per language and can take a little while. -->
  <transition name="sheet">
    <div class="nomic-sheet" v-if="learning" role="status" aria-live="polite">
      <h2>{{ t('learningTitle', { language: languageName }) }}</h2>
      <p>{{ t('learningBody') }}</p>
      <div class="learn-bar" aria-hidden="true"><i></i></div>
    </div>
  </transition>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { close, mic } from 'ionicons/icons';
import { t } from '@/config/i18n';

/**
 * The three cards about hearing the child: it cannot (with a way to play
 * anyway), it is about to ask for the microphone, and it is fetching a
 * language. Which one shows is decided by the game screen.
 */
export default {
  name: 'MicrophoneCards',
  components: { IonIcon },
  props: {
    language: { type: String, required: true },
    languageName: { type: String, default: '' },
    noMic: { type: Boolean, default: false },
    noMicBody: { type: String, default: '' },
    // Refused in the app: the way back is the phone's Settings.
    refused: { type: Boolean, default: false },
    asking: { type: Boolean, default: false },
    learning: { type: Boolean, default: false }
  },
  emits: ['use-pad', 'retry', 'close', 'answer'],
  setup() {
    return { closeIcon: close, micIcon: mic };
  },
  methods: {
    t(key, params) {
      return t(this.language, key, params);
    }
  }
};
</script>
