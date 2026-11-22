<template>
  <!-- Grown-ups: everything a parent sets, opened from behind the gate. -->
  <ion-modal 
    :is-open="open" 
    @didDismiss="$emit('close')" 
    class="settings-modal"
  >
    <ion-header>
      <ion-toolbar class="navy-bar">
        <ion-title>{{ t('grownUps') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="$emit('close')" aria-label="Close settings">
            <ion-icon :icon="closeIcon" slot="icon-only" style="color: white;"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="settings-list">
        <!-- Difficulty Level -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="speedometerIcon" color="primary"></ion-icon>
            <span>{{ t('level') }}</span>
          </div>
          <div class="settings-options">
            <button 
              v-for="choice in levelOptions" 
              :key="choice.value" 
              class="setting-option" 
              :class="{ active: level === choice.value }"
              @click="$emit('update:level', choice.value)"
            >
              {{ choice.label }}
            </button>
          </div>
        </div>

        <!-- Operator -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="calculatorIcon" color="secondary"></ion-icon>
            <span>{{ t('operators') }}</span>
          </div>
          <div class="settings-options two">
            <button 
              v-for="op in operatorOptions" 
              :key="op.value" 
              class="setting-option" 
              :class="{ active: operator === op.value }"
              @click="$emit('update:operator', op.value)"
            >
              {{ op.label }}
            </button>
          </div>
        </div>

        <!-- Language. Was a flag button on the game screen, where a child
             could switch the whole game to a language they do not speak. -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="globeIcon" color="primary"></ion-icon>
            <span>{{ t('language') }}</span>
          </div>
          <div class="settings-options two">
            <button
              v-for="(lang, code) in languages"
              :key="code"
              class="setting-option"
              :class="{ active: language === code }"
              :aria-pressed="language === code"
              @click="$emit('update:language', code)"
            >
              <span aria-hidden="true">{{ lang.flag }}</span> {{ lang.name }}
            </button>
          </div>
        </div>

        <!-- Robot view: lives in settings rather than the game screen, which
             already carries six icon controls in one corner. -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="doneIcon" color="tertiary"></ion-icon>
            <span>{{ t('robotView') }}</span>
          </div>
          <div class="settings-options">
            <button
              v-for="option in viewOptions"
              :key="option.value"
              class="setting-option"
              :class="{ active: view === option.value }"
              :aria-pressed="view === option.value"
              @click="$emit('update:view', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="sunIcon" color="warning"></ion-icon>
            <span>{{ t('dayNight') }}</span>
          </div>
          <div class="settings-options">
            <button
              v-for="option in dayOptions"
              :key="option.value"
              class="setting-option"
              :class="{ active: dayMode === option.value }"
              :aria-pressed="dayMode === option.value"
              @click="$emit('update:dayMode', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="starIcon" color="warning"></ion-icon>
            <span>{{ t('robotColour') }}</span>
          </div>
          <div class="settings-options">
            <button
              v-for="colour in colourOptions"
              :key="colour.value"
              class="colour-swatch"
              :class="{ active: colour === colour.value }"
              :style="{ background: colour.value }"
              :aria-label="colour.label"
              :aria-pressed="colour === colour.value"
              @click="$emit('update:colour', colour.value)"
            ></button>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="volumeIcon" color="secondary"></ion-icon>
            <span>{{ t('robotChat') }}</span>
          </div>
          <div class="settings-options">
            <button
              v-for="option in chatOptions"
              :key="String(option.value)"
              class="setting-option"
              :class="{ active: autoChat === option.value }"
              :aria-pressed="autoChat === option.value"
              @click="$emit('update:autoChat', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Sound. Was a bare speaker icon on the game screen. -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="volumeIcon" color="secondary"></ion-icon>
            <span>{{ t('sound') }}</span>
          </div>
          <div class="settings-options">
            <button class="setting-option" :class="{ active: !muted }" :aria-pressed="!muted" @click="muted && $emit('toggle-mute')">{{ t('soundOn') }}</button>
            <button class="setting-option" :class="{ active: muted }" :aria-pressed="muted" @click="!muted && $emit('toggle-mute')">{{ t('soundOff') }}</button>
          </div>
        </div>

        <!-- Where the child's voice goes, in plain words. The app and the
             web version differ, so each says its own truth. -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="lockIcon" color="success"></ion-icon>
            <span>{{ t('privacy') }}</span>
          </div>
          <dl class="privacy-list">
            <div><dt>{{ t('privacyVoice') }}</dt><dd :class="{ good: isNative }">{{ isNative ? t('privacyVoiceDevice') : t('privacyVoiceWeb') }}</dd></div>
            <div><dt>{{ t('privacyProgress') }}</dt><dd class="good">{{ t('privacyProgressValue') }}</dd></div>
            <div><dt>{{ t('privacyAds') }}</dt><dd class="good">{{ t('privacyNone') }}</dd></div>
          </dl>
          <!-- Plain pages, not part of the game: they open in its place and
               carry their own way back. Reachable only from behind the gate. -->
          <div class="settings-options vertical parent-links">
            <a class="setting-option wide" :href="publicPath + 'privacy.html'">{{ t('privacyForParents') }}</a>
            <a class="setting-option wide" :href="publicPath + 'support.html'">{{ t('helpAndSupport') }}</a>
          </div>
        </div>

        <div class="settings-group">
          <button class="setting-option wide" @click="$emit('help')">
            {{ t('howToPlay') }}
          </button>
        </div>

        <!-- Wiping the record of every sum is a grown-up's decision. It used
             to be a button in the child's own history panel. -->
        <div class="settings-group" v-if="historyCount > 0">
          <button class="setting-option wide danger" @click="$emit('clear-history')">
            {{ t('clearHistory') }} ({{ historyCount }})
          </button>
        </div>

        <!-- Practice Mode -->
        <div class="settings-group">
          <div class="settings-group-header">
            <ion-icon :icon="targetIcon" color="tertiary"></ion-icon>
            <span>{{ t('sessionMode') }}</span>
          </div>
          <div class="settings-options vertical">
            <button 
              v-for="choice in modeOptions" 
              :key="choice.value" 
              class="setting-option wide" 
              :class="{ active: mode === choice.value }"
              @click="$emit('update:mode', choice.value)"
            >
              {{ choice.label }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/vue';
import { star, speedometer, calculator, volumeHigh, globe, fitness, close, stopCircle, sunny, lockClosed } from 'ionicons/icons';
import { t } from '@/config/i18n';
import { BODY_COLOURS } from '@/game/options';
import { isNativeApp } from '@/services/deviceSpeech';

/**
 * The Grown-ups sheet. It holds no settings of its own: each one comes in as
 * a prop and goes back out as an event, so the game screen stays the one
 * place that knows the current settings and saves them.
 */
export default {
  name: 'GrownUpsSheet',
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon },
  props: {
    open: { type: Boolean, default: false },
    language: { type: String, required: true },
    languages: { type: Object, required: true },
    level: { type: String, required: true },
    operator: { type: String, required: true },
    mode: { type: String, required: true },
    view: { type: String, required: true },
    dayMode: { type: String, required: true },
    colour: { type: String, required: true },
    autoChat: { type: Boolean, default: true },
    muted: { type: Boolean, default: false },
    historyCount: { type: Number, default: 0 }
  },
  emits: [
    'update:level', 'update:operator', 'update:mode', 'update:language', 'update:view',
    'update:dayMode', 'update:colour', 'update:autoChat', 'toggle-mute', 'clear-history', 'help', 'close'
  ],
  setup() {
    return {
      starIcon: star,
      speedometerIcon: speedometer,
      calculatorIcon: calculator,
      volumeIcon: volumeHigh,
      globeIcon: globe,
      targetIcon: fitness,
      closeIcon: close,
      doneIcon: stopCircle,
      sunIcon: sunny,
      lockIcon: lockClosed,
      isNative: isNativeApp,
      publicPath: import.meta.env.BASE_URL
    };
  },
  computed: {
    levelOptions() {
      return [
        { value: 'beginner', label: this.t('easy') },
        { value: 'medium', label: this.t('medium') },
        { value: 'expert', label: this.t('hard') },
        { value: 'auto', label: '🎯 ' + this.t('auto') },
      ];
    },
    operatorOptions() {
      return [
        { value: 'times', label: '× ' + this.t('times') },
        { value: 'plus', label: '+ ' + this.t('plus') },
        { value: 'minus', label: '− ' + this.t('minus') },
        { value: 'divide', label: '÷ ' + this.t('dividedBy') },
      ];
    },
    modeOptions() {
      return [
        { value: 'random', label: this.t('randomMode') },
        { value: 'weak_operators', label: this.t('practiceWeakOperators') },
        { value: 'recent_failures', label: this.t('practiceRecentFailures') },
      ];
    },
    viewOptions() {
      return [
        { value: 'auto', label: this.t('viewAuto') },
        { value: 'face', label: this.t('viewFace') },
        { value: 'full', label: this.t('viewFull') },
      ];
    },
    dayOptions() {
      return [
        { value: 'auto', label: this.t('viewAuto') },
        { value: 'day', label: this.t('optionDay') },
        { value: 'night', label: this.t('optionNight') },
      ];
    },
    colourOptions() {
      return [
        { value: BODY_COLOURS[0], label: 'Yellow' },
        { value: BODY_COLOURS[1], label: 'Blue' },
        { value: BODY_COLOURS[2], label: 'Green' },
        { value: BODY_COLOURS[3], label: 'Cyan' },
        { value: BODY_COLOURS[4], label: 'Pink' },
        { value: BODY_COLOURS[5], label: 'Purple' },
        { value: BODY_COLOURS[6], label: 'Orange' },
        { value: BODY_COLOURS[7], label: 'Red' },
        { value: BODY_COLOURS[8], label: 'Silver' },
      ];
    },
    chatOptions() {
      return [
        { value: true, label: this.t('optionOn') },
        { value: false, label: this.t('optionOff') },
      ];
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
/* Settings Modal Styles */
ion-modal.settings-modal {
  --height: 60%;
  --min-height: 400px;
  --border-radius: 16px 16px 0 0;
  align-items: flex-end;
}

.settings-modal ion-content {
  --background: #1a1a2e;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-group {
  background: #16213e;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.settings-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 15px;
  color: #e2e8f0;
}

.settings-group-header ion-icon {
  font-size: 20px;
}

.settings-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.setting-option.danger {
  color: #ff9c92;
  border-color: rgba(255, 156, 146, 0.45);
  background: transparent;
}
.settings-options.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
/* One navy look. The sheet used to open under a default light-blue bar. */
ion-toolbar.navy-bar {
  --background: #101b3d;
  --color: #ffffff;
  --border-color: rgba(255, 255, 255, 0.12);
}
.parent-links {
  margin-top: 14px;
}
.parent-links a {
  display: block;
  text-decoration: none;
}
.privacy-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.privacy-list div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
}
.privacy-list div + div {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.privacy-list dt {
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  flex: none;
  max-width: 48%;
}
.privacy-list dd {
  margin: 0;
  color: #cbd5e0;
  font-size: 14px;
  text-align: right;
}
.privacy-list dd.good {
  color: #6ee7a0;
  font-weight: 600;
}

.settings-options.vertical {
  flex-direction: column;
}

.setting-option {
  flex: 1;
  min-width: 60px;
  /* Narrow side padding and no wrapping: "Medium" used to break as "Medi/um"
     in a four-across row on a phone. */
  padding: 12px 6px;
  white-space: nowrap;
  border: 2px solid #2d3748;
  border-radius: 10px;
  background: #0f3460;
  font-size: 15px;
  font-weight: 500;
  color: #cbd5e0;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.setting-option.wide {
  flex: none;
  width: 100%;
  text-align: left;
}

.setting-option:hover {
  border-color: #4299e1;
  background: #1a4a7a;
}

.setting-option.active {
  border-color: #4299e1;
  background: #3182ce;
  color: white;
}

.colour-swatch {
  /* 44px: the minimum touch target, which the rest of this redesign holds to. */
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
}

.colour-swatch.active {
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.28);
}

.colour-swatch:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

@media (min-width: 768px) {
  .settings-modal {
    --max-width: 500px;
    --border-radius: 16px;
    align-items: center;
  }
}

/* Respect a reduced-motion preference. This stops the decorative loops only -
   the correct/incorrect feedback, expression changes and state colours all
   still happen, because that is information, not decoration. */
@media (prefers-reduced-motion: reduce) {

  .toast-compact,
  .setting-option,
  .star-chip {
    transition: none;
  }
}
</style>
