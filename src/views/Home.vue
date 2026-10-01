<template>
  <ion-page>
    <!-- Floating HUD. No toolbar: the robot's world is the interface, so the
         controls sit over the scene as glass buttons instead of inside a bar. -->
    <div class="hud">
      <div class="hud-left">
        <button class="hud-btn" @click="showSettingsModal = true" :aria-label="t('settings')">
          <ion-icon :icon="settingsIcon" aria-hidden="true"></ion-icon>
        </button>
        <!-- Permanent entry point. This used to live only inside the first-run
             card, which meant it disappeared forever after one dismissal. -->
        <button class="hud-btn help" @click="showIntro = true" :aria-label="t('howToPlay')">
          <ion-icon :icon="helpIcon" aria-hidden="true"></ion-icon>
        </button>
        <!-- Tapping holds the sky at day or night; the automatic cycle can be
             restored from Settings. The icon shows what the tap will give you. -->
        <button class="hud-btn sky" @click="toggleDayNight" :aria-label="t('dayNight')">
          <ion-icon :icon="dayMode === 'night' ? sunIcon : moonIcon" aria-hidden="true"></ion-icon>
        </button>
      </div>

      <!-- Wordmark. Absolutely centred rather than a flex child, so it stays
           put when the star count grows a digit and the right group widens. -->
      <p class="wordmark" aria-label="Oliver Math">
        <ion-icon :icon="calculatorIcon" class="wordmark-icon" aria-hidden="true"></ion-icon>
        <span class="wordmark-words"><span class="wordmark-oliver">Oliver</span><span class="wordmark-math">Math</span></span>
      </p>

      <div class="hud-right">
        <button class="hud-btn" id="language-trigger-header" aria-label="Change language" aria-haspopup="menu">
          <span class="hud-flag" aria-hidden="true">{{ availableLanguages[selectedLanguage]?.flag }}</span>
        </button>
        <ion-popover trigger="language-trigger-header" trigger-action="click">
          <ion-content class="ion-padding">
            <ion-list>
              <ion-item
                v-for="(lang, code) in availableLanguages"
                :key="code"
                button
                @click="changeLanguage(code)"
                :class="{ 'selected-language': code === selectedLanguage }"
              >
                <span class="language-flag">{{ lang.flag }}</span>
                <ion-label>{{ lang.name }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>

        <router-link to="/stats" class="hud-stars" aria-label="View stats and achievements">
          <ion-icon :icon="star" aria-hidden="true"></ion-icon>
          <span>{{ stars }}</span>
        </router-link>
      </div>
    </div>


    <!-- First-run help. The app previously explained itself with a single
         14-word sentence in a speech bubble and nothing else. -->
    <div class="intro-backdrop" v-if="showIntro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div class="intro-card" ref="introCard">
        <p class="intro-brand" id="intro-title">
          <span class="wordmark-oliver">Oliver</span><span class="wordmark-math">Math</span>
        </p>
        <p class="intro-tagline">{{ t('tagline') }}</p>

        <ol class="intro-steps">
          <li><span class="intro-num">1</span>{{ t('step1') }}</li>
          <li><span class="intro-num">2</span>{{ t('step2') }}</li>
          <li><span class="intro-num">3</span>{{ t('step3') }}</li>
        </ol>

        <!-- Spoken explanation. The written steps above are no use to a child
             who cannot read yet, and tapping this is also the user gesture the
             browser needs before any audio can play. -->
        <button class="intro-hear" @click="explainGame" :disabled="isTalking">
          <ion-icon :icon="volumeIcon" aria-hidden="true"></ion-icon>
          {{ t('hearIt') }}
        </button>

        <button class="intro-go" @click="dismissIntro">{{ t('gotIt') }}</button>
      </div>
    </div>

    <!-- Settings Modal -->
    <ion-modal 
      :is-open="showSettingsModal" 
      @didDismiss="showSettingsModal = false" 
      class="settings-modal"
    >
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ t('settings') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="showSettingsModal = false" aria-label="Close settings">
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
                v-for="level in levelOptions" 
                :key="level.value" 
                class="setting-option" 
                :class="{ active: selectedLevel === level.value }"
                @click="selectedLevel = level.value"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Operator -->
          <div class="settings-group">
            <div class="settings-group-header">
              <ion-icon :icon="calculatorIcon" color="secondary"></ion-icon>
              <span>{{ t('operators') }}</span>
            </div>
            <div class="settings-options">
              <button 
                v-for="op in operatorOptions" 
                :key="op.value" 
                class="setting-option" 
                :class="{ active: selectedOperator === op.value }"
                @click="selectedOperator = op.value"
              >
                {{ op.label }}
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
                :class="{ active: botView === option.value }"
                :aria-pressed="botView === option.value"
                @click="setBotView(option.value)"
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
                @click="setDayMode(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="settings-group">
            <div class="settings-group-header">
              <ion-icon :icon="star" color="warning"></ion-icon>
              <span>{{ t('robotColour') }}</span>
            </div>
            <div class="settings-options">
              <button
                v-for="colour in colourOptions"
                :key="colour.value"
                class="colour-swatch"
                :class="{ active: botColour === colour.value }"
                :style="{ background: colour.value }"
                :aria-label="colour.label"
                :aria-pressed="botColour === colour.value"
                @click="setBotColour(colour.value)"
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
                @click="setAutoChat(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="settings-group">
            <button class="setting-option wide" @click="showIntro = true; showSettingsModal = false">
              {{ t('howToPlay') }}
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
                v-for="mode in modeOptions" 
                :key="mode.value" 
                class="setting-option wide" 
                :class="{ active: sessionMode === mode.value }"
                @click="sessionMode = mode.value"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
    
    <ion-content :fullscreen="true" class="ion-padding" role="main">
      <!-- Action Buttons (when not in play mode) -->
      <div class="action-buttons" v-if="!isPlayMode && !isComputing" role="toolbar" aria-label="Question controls">
        <ion-button fill="clear" size="small" @click="repeatQuestion" :disabled="!currentQuestion || isTalking" aria-label="Repeat question" :title="!currentQuestion ? 'No question available' : 'Repeat question'">
          <ion-icon :icon="refreshIcon" slot="icon-only" aria-hidden="true"></ion-icon>
        </ion-button>
        <ion-button fill="clear" size="small" @click="handleToggleMute" :aria-label="isMuted ? 'Unmute' : 'Mute'" :title="isMuted ? 'Unmute audio' : 'Mute audio'">
          <ion-icon :icon="isMuted ? muteIcon : volumeIcon" slot="icon-only" aria-hidden="true"></ion-icon>
        </ion-button>
        <ion-button fill="clear" size="small" @click="openHistoryModal" aria-label="View problem history" title="View previously solved problems">
          <ion-icon :icon="historyIcon" slot="icon-only" aria-hidden="true"></ion-icon>
        </ion-button>
      </div>

      <!-- Problem History Modal -->
      <ion-modal :is-open="showHistoryModal" @didDismiss="showHistoryModal = false" role="dialog" aria-labelledby="history-modal-title">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title id="history-modal-title">{{ t('problemHistory') }}</ion-title>
            <ion-button slot="end" fill="clear" @click="showHistoryModal = false" aria-label="Close history">
              <ion-icon :icon="alertIcon" slot="icon-only" style="color: white;" aria-hidden="true"></ion-icon>
            </ion-button>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div v-if="problemHistory.length === 0" class="no-history">
            <p>{{ t('noHistory') }}</p>
          </div>
          <ion-list v-else>
            <ion-item v-for="problem in problemHistory" :key="problem.id" :class="problem.isCorrect ? 'correct-item' : 'incorrect-item'">
              <ion-label>
                <h2 class="problem-equation">
                  {{ problem.num1 }} {{ getOperatorSymbol(problem.operator) }} {{ problem.num2 }} = {{ problem.correctAnswer }}
                </h2>
                <p v-if="!problem.isCorrect" class="user-answer">
                  {{ t('yourAnswer') }}: {{ problem.userAnswer || '?' }}
                </p>
                <p class="problem-time">{{ formatTimestamp(problem.timestamp) }}</p>
              </ion-label>
              <ion-icon 
                slot="end" 
                :icon="problem.isCorrect ? star : alertIcon" 
                :color="problem.isCorrect ? 'success' : 'danger'"
              ></ion-icon>
            </ion-item>
          </ion-list>
          <ion-button 
            v-if="problemHistory.length > 0" 
            expand="block" 
            color="danger" 
            fill="outline"
            @click="handleClearHistory"
            class="clear-history-btn"
            aria-label="Delete all problem history"
          >
            <ion-icon :icon="trashIcon" slot="start" aria-hidden="true"></ion-icon>
            {{ t('clearHistory') }}
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Speech glow. The robot talking is otherwise inaudible AND invisible
           with the volume down or the device muted, so the screen edges pulse
           in the speaking colour. Driven by the real amplitude where we have
           it, with a CSS pulse underneath so it still moves when we do not. -->
      <div class="speak-glow" :class="botState" v-if="isTalking || isListening" :style="{ '--glow': speakGlow }" aria-hidden="true"></div>

      <!-- Bot Container -->
      <div class="bot-container">
        <AnimatedBot
          :botState="botState"
          :text="speech_phrases"
          :audioLevel="audioLevel"
          :view="botView"
          :bodyColor="botColour"
          :dayMode="dayMode"
          :closeLabel="t('closeMessage')"
          @dismiss="dismissBubble"
          size="200px"
          @click="changeStatus('laughing')"
          aria-live="polite"
        />
      </div>
    </ion-content>
    
    <!-- Transparent dock over the scene: a status pill and one round control.
         No toolbar chrome - the 3D world runs edge to edge behind it. -->
    <div class="dock">
      <!-- Listening panel: a pre-reading child needs to know the microphone is
           open without reading a word, so this leads with an animated mic and
           level bars, with the transcript underneath only once there is one. -->
      <transition name="panel">
        <div class="listen-panel" v-if="isListening" role="status" aria-live="polite">
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
          <ion-icon :icon="star" class="reward-star" aria-hidden="true"></ion-icon>
          <span class="reward-points">+{{ reward.points }}</span>
          <span class="reward-equation">{{ reward.equation }}</span>
          <span class="reward-streak" v-if="reward.streak >= 3">{{ t('streak') }} {{ reward.streak }}</span>
        </div>
      </transition>

      <div class="status-pill" :class="botState" v-if="statusText" role="status" aria-live="polite">
        <ion-icon :icon="statusIcon" aria-hidden="true"></ion-icon>
        <span>{{ statusText }}</span>
      </div>

      <button
        v-if="isPlayMode"
        class="round-btn play"
        @click="askQuestion"
        :disabled="isComputing"
        :aria-label="t('play')"
      >
        <ion-spinner name="crescent" v-if="isComputing"></ion-spinner>
        <ion-icon :icon="playIcon" v-else aria-hidden="true"></ion-icon>
      </button>

      <!-- Lets the child end their turn themselves instead of waiting for the
           recogniser to time out. Only shown while the mic is actually open. -->
      <button
        v-else-if="isListening"
        class="round-btn done"
        @click="finishAnswering"
        :aria-label="t('stop')"
      >
        <ion-icon :icon="doneIcon" aria-hidden="true"></ion-icon>
      </button>

    </div>
  </ion-page>
</template>
<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonIcon,
  toastController,
  IonItem,
  IonButton,
  IonButtons,
  IonSpinner,
  IonModal,
  IonPopover,
  IonList
} from "@ionic/vue";
import AnimatedBot from "@/components/AnimatedBot.vue";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { star, play, speedometer, calculator, mic, volumeHigh, sync, alertCircle, refresh, volumeMute, timeOutline, trashOutline, globe, fitness, settingsOutline, close, stopCircle, helpCircle, sunny, moon } from "ionicons/icons";
import { OPERATORS, LEVELS, NUMBER_RANGES, SCORING } from "@/config/gameConfig";
import { getRandomInt } from "@/utils/helpers";
import { getSpeechToken, getCachedAudio, validateAnswer } from "@/services/apiService";
import { LANGUAGES, SPEECH_VOICES, getPreferredLanguage, setLanguage, t, getRandomPhrase } from "@/config/i18n";
import { addToHistory, getHistory, clearHistory as clearHistoryService, formatTimestamp, getOperatorSymbol, getRecommendedDifficulty, getSpacedRepetitionProblem } from "@/services/historyService";
import { preloadSounds, playCorrectSound, playIncorrectSound, toggleMute, startMusic, stopMusic, duckMusic } from "@/services/soundService";
import { celebrateConfetti, celebrateStreak, showStar } from "@/utils/confetti";

// Kept beside the component so the saved-value check and the swatch list
// cannot drift apart.
const BODY_COLOURS = [
  '#ffc62e', '#2fb4ff', '#3fe07f', '#2fe8e0',
  '#ff6fb5', '#b47cff', '#ff8a3d', '#ff5f57'
];

export default {
  name: "Math",
  components: {
    AnimatedBot,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonLabel,
    IonIcon,
    IonItem,
    IonButton,
    IonButtons,
    IonSpinner,
    IonModal,
    IonPopover,
    IonList
  },
  setup() {
    return {
      star,
      starIcon: star,
      playIcon: play,
      doneIcon: stopCircle,
      helpIcon: helpCircle,
      sunIcon: sunny,
      moonIcon: moon,
      speedometerIcon: speedometer,
      calculatorIcon: calculator,
      micIcon: mic,
      volumeIcon: volumeHigh,
      syncIcon: sync,
      alertIcon: alertCircle,
      refreshIcon: refresh,
      muteIcon: volumeMute,
      historyIcon: timeOutline,
      trashIcon: trashOutline,
      globeIcon: globe,
      targetIcon: fitness,
      settingsIcon: settingsOutline,
      closeIcon: close
    };
  },
  data() {
    return {
      // UI state
      typeText: [],
      isLoading: true,
      isOnBoundary: false,
      isTalking: false,
      isListening: false,
      isComputing: false,
      isLaughing: false,
      isError: false,
      isQuery: false,
      isPlayMode: true,
      isResolved: false,
      // Bounds the "I didn't hear you" retry to one attempt per question.
      silenceRetried: false,
      // Set once a turn has an outcome, so a correct interim transcript cannot
      // be scored again by the final result that follows it.
      answerFinalised: false,
      // 3D camera framing preference: auto | face | full
      botView: localStorage.botView || 'auto',
      // What the recogniser last heard, shown in the listening panel.
      heardText: '',
      // Transient celebration shown on a correct answer.
      reward: null,
      rewardTimer: null,
      // First-run help. Shown once, reopenable from settings or the HUD.
      showIntro: !localStorage.seenIntro,
      // Set when the next utterance should leave a clean screen behind it.
      clearAfterSpeak: false,
      // Idle chatter: the robot prompts and offers tips while waiting.
      autoChat: localStorage.autoChat !== '0',
      // auto | day | night
      dayMode: localStorage.dayMode || 'auto',
      // Body panel colour. The brighter palette replaced a muted one, so a
      // value saved against the old swatches is migrated rather than left
      // selected-but-invisible in the settings list.
      botColour: BODY_COLOURS.includes(localStorage.botColour)
        ? localStorage.botColour
        : BODY_COLOURS[0],
      idleTimer: null,
      bubbleTimer: null,
      
      // Expression states
      isHappy: false,
      isSad: false,
      isExcited: false,
      isProud: false,
      isSurprised: false,
      isConfused: false,
      
      // Game state
      text: "",
      selectedLevel: LEVELS.MEDIUM,
      selectedOperator: OPERATORS.TIMES,
      sessionMode: 'random', // random, weak_operators, recent_failures
      currentAutoLevel: 'medium', // Used when selectedLevel is 'auto'
      currentEffectiveLevel: 'medium', // Tracks actual difficulty used for current question
      currentOperator: 'times', // Tracks actual operator used (may differ in SR mode)
      selectedLanguage: 'en',
      speech_phrases: 'Click play, listen to the question and respond back by talking your answer.',
      number1: 2,
      number2: 3,
      stars: 0,
      highScore: 0,
      bestStreak: 0,
      previousPosition: -1,
      consecutiveCorrect: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      isMuted: false,
      currentQuestion: "",  // Store current question for repeat
      showHistoryModal: false,
      showSettingsModal: false,
      problemHistory: [],
      availableLanguages: LANGUAGES,
      
      // Speech
      synth: window.speechSynthesis,
      greetingSpeech: new window.SpeechSynthesisUtterance(),
      audioConfig: null,
      speechConfig: null,
      speechRecognizer: null,
      speechRecording: null,
      token: null,
      speechRegion: null,
      audioPlayer: null,
      
      // Audio analysis for lip sync
      audioContext: null,
      audioAnalyser: null,
      audioSource: null,
      audioLevel: 0,
      animationFrameId: null,
      
      // Config
      isMicrophoneEnabled: false,
      publicPath: import.meta.env.BASE_URL,
      timeout: null,
      expressionTimeout: null,
    };
  },
  watch: {
    // aria-modal only tells assistive tech that the rest of the page is inert;
    // it does not make it so. Without this, keyboard and screen-reader users
    // could tab straight out of the card and onto the controls behind it.
    showIntro: {
      immediate: true,
      handler(open) {
        if (open) {
          this.introReturnFocus = document.activeElement;
          this.$nextTick(() => {
            const first = this.$refs.introCard?.querySelector('button');
            if (first) first.focus();
            document.addEventListener('keydown', this.onIntroKeydown);
          });
        } else {
          document.removeEventListener('keydown', this.onIntroKeydown);
          if (this.introReturnFocus && this.introReturnFocus.focus) {
            this.introReturnFocus.focus();
          }
          this.introReturnFocus = null;
        }
      }
    },
    // Music through the speaker is picked straight back up by an open
    // microphone, so pull it down whenever the robot is talking or listening
    // and bring it back once the turn is over.
    botState(state) {
      duckMusic(['speaking', 'listening', 'computing'].includes(state));
    }
  },
  computed: {
    botState() {
      if (this.isError) {
        return "broken";
      }
      // Deliberately below speaking and listening. The robot is now a
      // full-bleed backdrop, so a tap anywhere lands on it - and laughing used
      // to outrank an active turn, wiping out the signal telling the child
      // whose turn it is. The easter egg only plays when nothing else is
      // happening.
      if (this.isLaughing && !this.isTalking && !this.isListening) {
        return "laughing";
      }
      if (this.isHappy) {
        return "happy";
      }
      if (this.isSad) {
        return "sad";
      }
      if (this.isExcited) {
        return "excited";
      }
      if (this.isProud) {
        return "proud";
      }
      if (this.isSurprised) {
        return "surprised";
      }
      if (this.isConfused) {
        return "confused";
      }
      if (this.isTalking) {
        return "speaking";
      }
      if (this.isListening) {
        return "listening";
      }
      if (this.isComputing) {
        return "computing";
      }
      // Default to neutral (idle) state
      return "neutral";
    },
    expectedResultAsNumber() {
      // Use currentOperator (may differ from selectedOperator in spaced repetition mode)
      const op = this.currentOperator || this.selectedOperator;
      if (op == "plus") {
        return this.number1 + this.number2;
      }
      if (op == "minus") {
        return this.number1 - this.number2;
      }
      if (op == "divide") {
        return this.number1 / this.number2;
      }
      return this.number1 * this.number2;
    },
    accuracy() {
      if (this.totalQuestionsAnswered === 0) return 0;
      return Math.round((this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100);
    },
    starsDisplay() {
      // Cap stars at 100 and show max indicator
      const displayStars = Math.min(this.stars, 100);
      return this.stars >= 100 ? '100 ⭐' : displayStars.toString();
    },
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
        { value: 'times', label: '×' },
        { value: 'plus', label: '+' },
        { value: 'minus', label: '−' },
        { value: 'divide', label: '÷' },
      ];
    },
    modeOptions() {
      return [
        { value: 'random', label: this.t('randomMode') },
        { value: 'weak_operators', label: this.t('practiceWeakOperators') },
        { value: 'recent_failures', label: this.t('practiceRecentFailures') },
      ];
    },
    // 0-1, used as the strength of the edge glow while the robot talks.
    speakGlow() {
      return (0.22 + Math.min(this.audioLevel, 1) * 0.6).toFixed(3);
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
      ];
    },
    chatOptions() {
      return [
        { value: true, label: this.t('optionOn') },
        { value: false, label: this.t('optionOff') },
      ];
    },
    viewOptions() {
      return [
        { value: 'auto', label: this.t('viewAuto') },
        { value: 'face', label: this.t('viewFace') },
        { value: 'full', label: this.t('viewFull') },
      ];
    },
    statusColor() {
      switch (this.botState) {
        case 'speaking': return 'primary';
        case 'listening': return 'success';
        case 'computing': return 'warning';
        case 'broken': return 'danger';
        case 'laughing': return 'tertiary';
        case 'happy': return 'success';
        case 'sad': return 'primary';
        case 'excited': return 'secondary';
        case 'proud': return 'warning';
        case 'surprised': return 'tertiary';
        case 'confused': return 'medium';
        default: return 'medium';
      }
    },
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
    }
  },
  methods: {
    /**
     * Show a temporary expression on the bot face
     */
    showExpression(expression, duration = 2000) {
      // Reset all expression states
      this.isHappy = false;
      this.isSad = false;
      this.isExcited = false;
      this.isProud = false;
      this.isSurprised = false;
      this.isConfused = false;
      
      // Set the requested expression
      switch (expression) {
        case 'happy':
          this.isHappy = true;
          break;
        case 'sad':
          this.isSad = true;
          break;
        case 'excited':
          this.isExcited = true;
          break;
        case 'proud':
          this.isProud = true;
          break;
        case 'surprised':
          this.isSurprised = true;
          break;
        case 'confused':
          this.isConfused = true;
          break;
      }
      
      // Clear expression after duration
      if (this.expressionTimeout) {
        clearTimeout(this.expressionTimeout);
      }
      this.expressionTimeout = setTimeout(() => {
        this.isHappy = false;
        this.isSad = false;
        this.isExcited = false;
        this.isProud = false;
        this.isSurprised = false;
        this.isConfused = false;
      }, duration);
    },
    /**
     * Initialize audio context for lip sync analysis
     */
    initAudioAnalysis() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 256;
        this.audioAnalyser.smoothingTimeConstant = 0.3;
      }
    },
    /**
     * Start analyzing audio for lip sync
     */
    startAudioAnalysis(audioElement) {
      this.initAudioAnalysis();
      
      // Connect audio element to analyser
      if (this.audioSource) {
        try {
          this.audioSource.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
      
      try {
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
        this.audioSource.connect(this.audioAnalyser);
        this.audioAnalyser.connect(this.audioContext.destination);
      } catch (e) {
        // Audio element might already be connected, just update the analyser
        console.warn('Audio source already connected:', e.message);
      }
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Start the animation loop
      this.analyzeAudio();
    },
    /**
     * Analyze audio amplitude for lip sync
     */
    analyzeAudio() {
      if (!this.isTalking || !this.audioAnalyser) {
        this.audioLevel = 0;
        return;
      }
      
      // Reuse buffer to reduce GC pressure
      if (!this._audioDataArray || this._audioDataArray.length !== this.audioAnalyser.frequencyBinCount) {
        this._audioDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        // Pre-calculate voice frequency range bounds (cache these)
        this._voiceStart = Math.floor(80 / (this.audioContext.sampleRate / this.audioAnalyser.fftSize));
        this._voiceEnd = Math.floor(3000 / (this.audioContext.sampleRate / this.audioAnalyser.fftSize));
      }
      
      this.audioAnalyser.getByteFrequencyData(this._audioDataArray);
      
      // Calculate average amplitude from voice frequency range
      let sum = 0;
      const end = Math.min(this._voiceEnd, this._audioDataArray.length);
      for (let i = this._voiceStart; i < end; i++) {
        sum += this._audioDataArray[i];
      }
      
      const count = end - this._voiceStart;
      const average = count > 0 ? sum / count : 0;
      // Normalize to 0-1 range with some amplification
      this.audioLevel = Math.min(1, (average / 128) * 1.5);
      
      // Continue analyzing
      this.animationFrameId = requestAnimationFrame(() => this.analyzeAudio());
    },
    /**
     * Stop audio analysis
     */
    stopAudioAnalysis() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.audioLevel = 0;
      // Clear cached analysis buffers
      this._audioDataArray = null;
      this._voiceStart = null;
      this._voiceEnd = null;
    },
    changeStatus(status) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      if (status === "laughing") {
        var audio = new Audio(window.location.origin + this.$route.path + this.publicPath + 'assets/sound/laugh.wav');
        audio.play();
        this.isLaughing = true;
        
        this.timeout = setTimeout(() => {
          this.isLaughing = false;
        }, 1500); // delay
      }
    },
    keyDownHandler(e) {
      let value = e.key * 1;
      if (!isNaN(parseFloat(value)) && isFinite(value)){
        this.typeText.push(value);
        if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(async () => {
            if (this.typeText.length > 0){
              var typeText = this.typeText.join('');
              this.showToast("Your typed response: " + typeText, "secondary");
              // For typed numbers, we can do simple validation
              const number = parseInt(typeText, 10);
              if (!isNaN(number) && number === this.expectedResultAsNumber) {
                this.isResolved = true;
                await this.validateSpeechRecording(typeText, true);
              }
              this.typeText = [];
            }
          }, 400); // delay
      }
    },
    async showToast(text, color) {
      const toast = await toastController.create({
        message: text,
        duration: 4000,
        color: color,
        position: 'bottom',
        translucent: true,
        cssClass:"toast-compact",
        animated:false,
      });
      return toast.present();
    },
    async enableMicrophone() {
      var self = this;
      if (!this.isMicrophoneEnabled) {
        self.speech_phrases = "enabling microphone..";
        self.isMicrophoneEnabled = true;
        await navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then(function (e) {
            self.audioConfig = AudioConfig.fromMicrophoneInput(e.id);
            self.speech_phrases = "microphone enabled";
          })
          .catch(function () {
            self.speech_phrases = "microphone disabled";
            self.isError = true;
            self.showToast("Microphone disabled", "danger");
            self.isMicrophoneEnabled = false;
          });
      }
    },
    async askQuestion() {
      this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      this.isResolved = false;
      var self = this;
      this.isComputing = true;
      // Every Play is a fresh attempt. isError used to be a one-way latch, so a
      // single denied permission or cold backend hid the Play button forever.
      this.isError = false;
      this.silenceRetried = false;
      this.answerFinalised = false;
      // Started here rather than on mount: browsers only allow an AudioContext
      // to start from a user gesture, and Play is the first real one.
      startMusic();
      this.heardText = '';
      this.reward = null;
      
      // Brief surprised expression when starting new question
      this.showExpression('surprised', 800);

      await this.enableMicrophone()
        .then(function () {
          if (self.isMicrophoneEnabled) {
            self.isComputing = false;
            self.isQuery = true;
            self.isPlayMode = false;
            self.speech_phrases = "";
            
            // Handle adaptive difficulty (auto mode)
            let effectiveLevel = self.selectedLevel;
            if (self.selectedLevel === 'auto') {
              const recommendation = getRecommendedDifficulty(self.selectedOperator, self.currentAutoLevel);
              if (recommendation.recommended !== self.currentAutoLevel) {
                self.currentAutoLevel = recommendation.recommended;
                // Show toast notification about difficulty change
                const message = recommendation.reason === 'high_accuracy' 
                  ? self.t('difficultyIncreased') 
                  : self.t('difficultyDecreased');
                self.showToast(message, 'primary');
              }
              effectiveLevel = self.currentAutoLevel;
            }
            
            // Store effective level for history tracking
            self.currentEffectiveLevel = effectiveLevel;
            
            // Check for spaced repetition problem based on sessionMode
            let srProblem = null;
            if (self.sessionMode !== 'random') {
              // Only use spaced repetition when not in random mode
              srProblem = getSpacedRepetitionProblem(self.selectedOperator, effectiveLevel, self.sessionMode);
            }
            let operatorToUse = self.selectedOperator;
            
            if (srProblem && srProblem.type === 'retry_failure') {
              // Reuse exact problem from history
              self.number1 = srProblem.num1;
              self.number2 = srProblem.num2;
              // Map operator symbol back to operator key
              const opSymbolToKey = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divide' };
              operatorToUse = opSymbolToKey[srProblem.operator] || self.selectedOperator;
            } else if (srProblem && srProblem.type === 'weak_operator') {
              // Generate new problem for weak operator
              const opSymbolToKey = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divide' };
              operatorToUse = opSymbolToKey[srProblem.operator] || self.selectedOperator;
              const ranges = NUMBER_RANGES[operatorToUse]?.[effectiveLevel] 
                || NUMBER_RANGES[OPERATORS.TIMES][LEVELS.BEGINNER];
              if (operatorToUse === 'divide') {
                const divisor = getRandomInt(ranges.min2, ranges.max2);
                const quotient = getRandomInt(ranges.min1, ranges.max1);
                self.number1 = divisor * quotient;
                self.number2 = divisor;
              } else {
                self.number1 = getRandomInt(ranges.min1, ranges.max1);
                self.number2 = getRandomInt(ranges.min2, ranges.max2);
              }
            } else {
              // Standard random generation
              const ranges = NUMBER_RANGES[self.selectedOperator]?.[effectiveLevel] 
                || NUMBER_RANGES[OPERATORS.TIMES][LEVELS.BEGINNER];
              
              // For division, generate numbers that result in whole number answers
              if (self.selectedOperator === 'divide') {
                // Generate divisor and quotient, then calculate dividend
                const divisor = getRandomInt(ranges.min2, ranges.max2);
                const quotient = getRandomInt(ranges.min1, ranges.max1);
                self.number1 = divisor * quotient; // dividend
                self.number2 = divisor;
              } else {
                self.number1 = getRandomInt(ranges.min1, ranges.max1);
                self.number2 = getRandomInt(ranges.min2, ranges.max2);
              }
            }
            
            // Store the actual operator being used
            self.currentOperator = operatorToUse;
            
            // Get translated operator word
            const operatorWords = {
              'plus': self.t('plus'),
              'minus': self.t('minus'),
              'times': self.t('times'),
              'divide': self.t('dividedBy')
            };
            const operatorWord = operatorWords[operatorToUse] || operatorToUse;
            self.text = `${self.t('whatIs')} ${self.number1} ${operatorWord} ${self.number2}?`;
            self.currentQuestion = self.text; // Store for repeat
            self.speak();
          } else {
            self.speech_phrases = "microphone not available";
            self.isError = true;
            self.showToast("Microphone not available", "danger");
          }
        })
        .catch(function (e) {
          console.error("Failed to ask question:", e);
          self.isError = true;
          self.text = "Something went wrong. Please try again.";
          self.showToast(self.text, "danger");
        });
    },
    /**
     * Speak text using Azure Neural TTS with caching
     */
    async speak() {
        // Prevent overlapping audio
        if (this.audioPlayer && !this.audioPlayer.paused) {
          return;
        }
        
        // Show text immediately
        this.speech_phrases = this.text;
        this.isTalking = true;
        this.isOnBoundary = true;

        try {
          // Use cached audio service with language-specific voice
          const speechLang = SPEECH_VOICES[this.selectedLanguage] || 'en-GB';
          const audio = await getCachedAudio(this.text, speechLang);
          this.audioPlayer = audio;
          
          // Set up audio analysis for lip sync
          audio.crossOrigin = "anonymous";
          
          audio.onplay = () => {
            this.startAudioAnalysis(audio);
          };
          
          audio.onended = () => {
            this.isTalking = false;
            this.stopAudioAnalysis();
            if (this.clearAfterSpeak) {
              this.clearAfterSpeak = false;
              this.text = '';
              this.speech_phrases = '';
            }
            // Trigger listening after speech ends
            if (this.isQuery) {
              this.isQuery = false;
              this.listen();
            }
          };
          
          audio.onerror = () => {
            this.isTalking = false;
            this.stopAudioAnalysis();
            this.speakWithBrowser();
          };
          
          await audio.play();
          
        } catch (error) {
          console.error('Azure TTS error:', error);
          this.isTalking = false;
          this.stopAudioAnalysis();
          this.speakWithBrowser();
        }
    },
    /**
     * Fallback to browser speech synthesis
     */
    speakWithBrowser() {
      if (!this.synth.speaking) {
        this.greetingSpeech.text = this.text;
        this.synth.speak(this.greetingSpeech);
      }
    },
    listen() {
      // The microphone is open, so it is the child's turn to speak RIGHT NOW.
      // This used to set isComputing, which rendered as "Thinking..." with a
      // frozen grey-gear robot - telling the child to wait at the exact moment
      // it needed them to talk. isListening gives them the green listening
      // robot and "Your turn!" instead.
      // No toast: the listening panel in the dock carries this now, and four
      // stacked 4-second toasts per answer was the noisiest thing on screen.
      this.isComputing = false;
      this.isListening = true;
      var sc = SpeechConfig.fromAuthorizationToken(
         
        this.token,
        this.speechRegion
      );
      // Use language-specific speech recognition
      sc.speechRecognitionLanguage = SPEECH_VOICES[this.selectedLanguage] || 'en-GB';
      this.speechConfig = sc;
      this.speechRecording = new SpeechRecognizer(
        this.speechConfig,
        this.audioConfig
      );
      this.listenForSpeechRecordingEvents();
    },
    /**
     * Persist the robot camera framing. localStorage is written directly here
     * to match how every other preference in this view is stored.
     */
    /**
     * Celebration panel for a correct answer. Replaces a plain text toast with
     * something a child who cannot read fluently can still understand: a big
     * star, the points earned, and the equation they just solved.
     */
    showReward(points) {
      clearTimeout(this.rewardTimer);
      this.reward = {
        points,
        equation: `${this.number1} ${this.getOperatorSymbolForHistory(this.currentOperator)} ${this.number2} = ${this.expectedResultAsNumber}`,
        streak: this.consecutiveCorrect
      };
      this.rewardTimer = setTimeout(() => { this.reward = null; }, 2600);
    },

    /**
     * The robot explains the game out loud. Routed through the normal speak()
     * path so it gets the same voice, the same language and the same talking
     * animation as everything else it says.
     */
    /**
     * Closes the speech bubble by hand. Also stops the audio: dismissing the
     * words while the robot carries on reading them aloud would be worse than
     * leaving it up.
     */
    dismissBubble() {
      clearTimeout(this.bubbleTimer);
      this.clearAfterSpeak = false;
      this.text = '';
      this.speech_phrases = '';
      if (this.audioPlayer && !this.audioPlayer.paused) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      this.isTalking = false;
      this.stopAudioAnalysis();

      // Pausing the audio means onended never fires, so the work it would have
      // done has to happen here - otherwise the turn strands with neither the
      // Play nor the Done button on screen.
      if (this.isQuery) {
        this.isQuery = false;
        this.listen();
      } else if (!this.isListening) {
        this.isPlayMode = true;
      }
    },

    toggleDayNight() {
      this.setDayMode(this.dayMode === 'night' ? 'day' : 'night');
    },

    setDayMode(value) {
      this.dayMode = value;
      try {
        localStorage.dayMode = value;
      } catch (err) {
        console.warn('Could not save the day/night preference:', err);
      }
    },

    setBotColour(value) {
      this.botColour = value;
      try {
        localStorage.botColour = value;
      } catch (err) {
        console.warn('Could not save the robot colour:', err);
      }
    },

    setAutoChat(value) {
      this.autoChat = value;
      try {
        localStorage.autoChat = value ? '1' : '0';
      } catch (err) {
        console.warn('Could not save the chatter preference:', err);
      }
      if (value) this.startIdleChat();
      else this.stopIdleChat();
    },

    /**
     * The robot speaks up now and then while nothing is happening - a nudge or
     * a tip - so an idle screen does not feel abandoned. Only ever when it is
     * genuinely idle: never over a question, a turn, or its own voice.
     */
    startIdleChat() {
      this.stopIdleChat();
      if (!this.autoChat) return;
      this.idleTimer = setInterval(() => {
        const idle =
          this.isPlayMode &&
          !this.isTalking &&
          !this.isListening &&
          !this.isComputing &&
          !this.showIntro &&
          !this.showSettingsModal &&
          !this.showHistoryModal &&
          document.visibilityState === 'visible';
        if (!idle) return;
        this.sayIdlePhrase();
      }, 45000);
    },

    stopIdleChat() {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    },

    sayIdlePhrase() {
      const phrase = getRandomPhrase(this.selectedLanguage, 'idlePhrases');
      if (!phrase) return;
      this.isQuery = false;
      this.clearAfterSpeak = true;
      this.text = phrase;
      this.speak();
      this.scheduleBubbleClear();
    },

    /**
     * The bubble is not a permanent fixture. Anything said outside a question
     * fades off the screen on its own rather than sitting there indefinitely.
     */
    scheduleBubbleClear(ms = 90000) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = setTimeout(() => {
        if (this.isPlayMode && !this.isTalking && !this.isListening) {
          this.text = '';
          this.speech_phrases = '';
        }
      }, ms);
    },

    async explainGame() {
      if (this.isTalking) return;
      // Close the card first: the point of hearing it is to watch the robot
      // say it, which a modal over the scene would defeat. Clicking this also
      // counts as having seen the help, so it does not reappear next launch.
      this.dismissIntro();
      this.isQuery = false;
      // Clears the bubble once the line finishes, leaving a clean screen
      // rather than the explanation sitting there until something replaces it.
      this.clearAfterSpeak = true;
      this.text = this.t('explainSpoken');
      await this.speak();
    },

    /**
     * Escape closes the card; Tab cycles within it.
     */
    onIntroKeydown(e) {
      if (!this.showIntro) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.dismissIntro();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = this.$refs.introCard?.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable || !focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },

    dismissIntro() {
      this.showIntro = false;
      try {
        localStorage.seenIntro = '1';
      } catch (err) {
        console.warn('Could not save the intro flag:', err);
      }
    },

    setBotView(value) {
      this.botView = value;
      try {
        localStorage.botView = value;
      } catch (err) {
        console.warn('Could not save the robot view preference:', err);
      }
    },
    /**
     * Close the recogniser and release the microphone. Safe to call more than
     * once, and safe to call while recognizeOnceAsync is still in flight - its
     * callbacks null-check the handle before touching it.
     */
    stopListening() {
      const recogniser = this.speechRecording;
      this.speechRecording = null;
      this.isListening = false;
      this.isComputing = false;

      if (!recogniser) return;
      try {
        recogniser.close();
      } catch (err) {
        console.warn('Could not close the speech recogniser:', err);
      }
    },
    /**
     * "Done" button: the child says they have finished speaking. Ends the turn
     * without scoring it, so tapping Done is never punished - the worst case is
     * they press Play again.
     */
    finishAnswering() {
      if (this.answerFinalised) return;
      this.answerFinalised = true;
      this.stopListening();
      this.isQuery = false;
      this.isPlayMode = true;
    },
    /**
     * React to speech recording events
     */
    listenForSpeechRecordingEvents() {
      const self = this;

      // Signals that a new session has started with the speech service
      this.speechRecording.speechStartDetected = function () {
        console.log("speechStartDetected");
        self.isListening = true;
        self.isComputing = false;
      };

      this.speechRecording.recognizing = function (s, e) {
        // Display only. This used to run the full validation path for every
        // partial hypothesis, which fired a backend call each time, let two
        // concurrent validations score the same answer, and could finalise a
        // turn from an interim - closing the recogniser before the final-only
        // path restored the Play button. One spoken number, one score.
        self.heardText = e.result.text || '';
      };

      this.speechRecording.recognizeOnceAsync(
        function (result) {
          // The turn may already be over - a correct interim transcript stops
          // listening, and the child can tap Done - so release the recogniser
          // and drop the late result rather than scoring it twice.
          const wasAlreadyFinalised = self.answerFinalised;
          self.stopListening();
          if (wasAlreadyFinalised) return;
          self.validateSpeechRecording(result.text, true);
        },
        function (err) {
          console.log("err recognizeOnceAsync", err);
          self.stopListening();
          if (self.answerFinalised) return;
          self.isQuery = false;
          self.text = self.t('didntHear');
          self.showToast(self.text, "warning");
          // Deliberately NOT isError: that makes botState 'broken', which hides
          // the Play button. A failed recognition is transient and not the
          // child's fault, so leave them a way to try again.
          self.isPlayMode = true;
        }
      );
    },
    /**
     * React to speech events
     */
    listenForSpeechEvents() {
      this.greetingSpeech.onstart = () => {
        this.isTalking = true;
        this.isOnBoundary = false;
         if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            if (!this.isOnBoundary){
              this.speech_phrases = this.text;
              this.isOnBoundary = true;
            }
          }, 600); // delay
      };

      this.greetingSpeech.onend = () => {
        this.isTalking = false;
        if (this.clearAfterSpeak) {
          this.clearAfterSpeak = false;
          this.text = '';
          this.speech_phrases = '';
        }
        if (this.isQuery) {
          this.isQuery = false;
          this.listen();
        }
      };

      this.greetingSpeech.onboundary = (e) => {
        this.isOnBoundary = true;
        if (e.name == "word") {
          var word = this.getWordAt(this.text, e.charIndex).toLowerCase();
          // console.log(word);
          if (word == "times") {
            word = "x";
          }

          if (word == "plus") {
            word = "+";
          }

          if (word == "minus") {
            word = "-";
          }

          this.speech_phrases += word + " ";
        }
      };
    },
    /**
     * Calculate points based on streak and level
     */
    calculatePoints() {
      const levelMultiplier = SCORING.LEVEL_MULTIPLIER[this.selectedLevel] || 1;
      let streakBonus = 1;
      
      if (this.consecutiveCorrect >= SCORING.STREAK_BONUS_THRESHOLD) {
        const streakLevel = this.consecutiveCorrect - SCORING.STREAK_BONUS_THRESHOLD + 1;
        streakBonus = Math.min(
          1 + (streakLevel * SCORING.STREAK_BONUS_MULTIPLIER),
          SCORING.MAX_STREAK_BONUS
        );
      }
      
      return Math.round(SCORING.BASE_POINTS * levelMultiplier * streakBonus);
    },
    /**
     * Check if difficulty should be auto-adjusted based on performance
     */
    checkDifficultyAdjustment() {
      // If 5+ correct in a row at current level, suggest upgrading
      if (this.consecutiveCorrect >= 5 && this.selectedLevel !== LEVELS.EXPERT) {
        const nextLevel = this.selectedLevel === LEVELS.BEGINNER ? LEVELS.MEDIUM : LEVELS.EXPERT;
        this.showToast(`Great job! Consider trying ${nextLevel} level! 🚀`, "success");
      }
    },
    /**
     * Repeat the current question
     */
    repeatQuestion() {
      if (this.currentQuestion && !this.isTalking) {
        this.text = this.currentQuestion;
        this.speak();
      }
    },
    /**
     * Toggle sound mute
     */
    handleToggleMute() {
      this.isMuted = toggleMute();
      this.showToast(this.isMuted ? "Sound muted 🔇" : "Sound on 🔊", "medium");
    },
    /**
     * Open the problem history modal
     */
    openHistoryModal() {
      this.problemHistory = getHistory();
      this.showHistoryModal = true;
    },
    /**
     * Clear all problem history
     */
    handleClearHistory() {
      clearHistoryService();
      this.problemHistory = [];
      this.showToast(this.t('clearHistory') + " ✓", "success");
    },
    /**
     * Change language
     */
    changeLanguage(langCode) {
      setLanguage(langCode);
      this.selectedLanguage = langCode;
      this.speech_phrases = this.t('initialPrompt');
      this.showToast(`${this.availableLanguages[langCode].flag} ${this.availableLanguages[langCode].name}`, "success");
    },
    /**
     * Get translation for current language
     */
    t(key, params = {}) {
      return t(this.selectedLanguage, key, params);
    },
    /**
     * Get a random phrase from the current language
     */
    getPhrase(key, params = {}) {
      return getRandomPhrase(this.selectedLanguage, key, params);
    },
    /**
     * Get operator symbol for display
     */
    getOperatorSymbol,
    /**
     * Format timestamp for display
     */
    formatTimestamp,
    /**
     * Trigger haptic feedback if available
     */
    triggerHaptic(type = 'light') {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [50],
          success: [10, 50, 10],
          error: [50, 30, 50]
        };
        navigator.vibrate(patterns[type] || patterns.light);
      }
    },
    /**
     * Validate if the spoken/typed word matches the expected answer using LLM
     */
    async validateWordWithLLM(word) {
      if (!word || this.isResolved) return;
      
      try {
        const result = await validateAnswer(
          word,
          this.expectedResultAsNumber,
          // The question, NOT this.text. this.text is whatever the robot is
          // currently saying, and the retry path overwrites it with the
          // "I didn't hear you" line - so the retry was being validated
          // without the sum ever being shown to the model.
          this.currentQuestion || this.text,
          this.selectedLanguage
        );
        
        if (result.correct) {
          this.isResolved = true;
        }
        
        // Show what the LLM interpreted
        if (result.understood && result.interpretedNumber !== null) {
          console.log(`LLM interpreted "${word}" as ${result.interpretedNumber} (confidence: ${result.confidence})`);
        }
        
        return result;
      } catch (error) {
        console.error('LLM validation failed:', error);
        // Fall back to simple extraction
        const match = String(word).match(/\d+/);
        const number = match ? parseInt(match[0], 10) : null;
        if (number !== null && number === this.expectedResultAsNumber) {
          this.isResolved = true;
        }
        return { correct: this.isResolved, understood: number !== null };
      }
    },
    /**
     * Process speech recognition result
     */
    async validateSpeechRecording(recordedText, isFinalResult) {
      // The turn already has an outcome. Interim transcripts keep arriving after
      // a correct answer, and each one used to re-run the whole scoring block.
      if (this.answerFinalised) return;

      const isSilent = recordedText === undefined || recordedText === '';
      const displayText = isSilent ? "(silent)" : String(recordedText);

      let validationResult = null;

      // Interim transcripts arrive faster than the validation call returns, so
      // two of them could both pass the check above, both await, and both score
      // the same answer. One validation at a time, and re-check afterwards.
      if (this.validationInFlight) return;

      if (!isSilent) {
        // 'I heard: ...' and 'Interpreted as: N' were engineer language shown
        // to a seven-year-old, in English regardless of the chosen language.
        // The transcript now appears in the listening panel instead.
        this.heardText = displayText;
        this.isComputing = true;
        this.validationInFlight = true;
        try {
          validationResult = await this.validateWordWithLLM(recordedText);
        } finally {
          this.validationInFlight = false;
        }
        this.isComputing = false;

        // The turn may have been finalised while we were waiting.
        if (this.answerFinalised) return;
        
        // Show interpreted number if different from what was heard
        if (validationResult?.understood && validationResult.interpretedNumber !== null) {
          const interpreted = validationResult.interpretedNumber;
          this.heardText = String(interpreted);
        }
      }

      // Silence, or an answer the backend could not interpret, is NOT a wrong
      // answer. For a child on a phone in a room with other people it is the
      // most likely outcome of a turn, and scoring it punished them for the
      // room: it reset the streak, said "Not quite, the answer is 56", and
      // wrote a permanent failure to history. The backend already distinguishes
      // the two cases for us via understood:false.
      const notUnderstood = isSilent || validationResult?.understood === false;

      if (isFinalResult && notUnderstood) {
        this.showExpression('confused', 2000);
        this.text = this.t('didntHear');

        // One bounded retry on the SAME question. Setting isQuery makes the
        // existing audio.onended handler re-open the microphone once the
        // "I didn't hear you" line finishes playing.
        if (!this.silenceRetried && this.isMicrophoneEnabled) {
          this.silenceRetried = true;
          this.isQuery = true;
          this.speak();
          return;
        }

        this.answerFinalised = true;
        this.speak();
        this.isPlayMode = true;
        return;
      }

      // Count the question whenever the turn actually gets an outcome. Gating
      // this on isFinalResult alone skewed accuracy above 100%, because a
      // correct answer recognised from an interim transcript incremented the
      // correct count without ever incrementing the total.
      if (this.isResolved || isFinalResult) {
        this.totalQuestionsAnswered++;
        localStorage.totalQuestions = this.totalQuestionsAnswered;
      }

      if (this.isResolved) {
        // Right answer - the turn is over, so let go of the microphone instead
        // of leaving it open to collect the child's celebration noises.
        this.answerFinalised = true;
        this.stopListening();

        this.consecutiveCorrect++;
        this.totalCorrectAnswers++;
        localStorage.totalCorrect = this.totalCorrectAnswers;
        
        const points = this.calculatePoints();
        this.stars = Math.min(this.stars + points, 100); // Cap at 100 stars
        this.showReward(points);
        
        // Play sound and show celebration
        playCorrectSound(this.consecutiveCorrect);
        
        // Show confetti for correct answers
        if (this.consecutiveCorrect >= 5) {
          celebrateStreak(this.consecutiveCorrect);
        } else if (this.consecutiveCorrect >= 3) {
          celebrateConfetti(40);
        } else {
          // Small celebration - show star at center
          showStar(window.innerWidth / 2, window.innerHeight / 2);
        }
        
        // Update best streak
        if (this.consecutiveCorrect > this.bestStreak) {
          this.bestStreak = this.consecutiveCorrect;
          localStorage.bestStreak = this.bestStreak;
        }
        
        // Update high score
        if (this.stars > this.highScore) {
          this.highScore = this.stars;
          localStorage.highScore = this.highScore;
        }
        
        localStorage.stars = this.stars;
        
        // Haptic feedback for correct answer
        this.triggerHaptic(this.consecutiveCorrect >= 5 ? 'success' : 'light');
        
        const correct = this.getPhrase('correctPhrases');
        let message = '';
        
        // Special messages for streaks
        if (this.consecutiveCorrect >= 5) {
          const streak = this.getPhrase('streakPhrases', { count: this.consecutiveCorrect });
          message = `${correct}! ${streak} +${points} ⭐!`;
          this.showExpression('excited', 3000);
        } else if (this.consecutiveCorrect >= 3) {
          message = `${correct}! ${this.t('streak')}: ${this.consecutiveCorrect}! +${points} ⭐!`;
          this.showExpression('proud', 2500);
        } else {
          message = `${correct}! +${points} ⭐`;
          this.showExpression('happy', 2000);
        }
        
        this.text = message;
        
        // Auto-adjust difficulty
        this.checkDifficultyAdjustment();
        
      } else if (isFinalResult) {
        // Genuinely wrong - a number was recognised and it did not match.
        this.answerFinalised = true;
        this.consecutiveCorrect = 0;

        // Play incorrect sound
        playIncorrectSound();
        
        this.triggerHaptic('error');
        const incorrect = this.getPhrase('incorrectPhrases', { answer: this.expectedResultAsNumber });
        const hint = this.getPhrase('hintPhrases');
        this.text = `${incorrect}. ${hint}`;
        // Show sad for wrong answer, confused was already shown for silence
        if (!isSilent) {
          this.showExpression('sad', 2000);
        }
      }
      
      // Save to problem history
      if (isFinalResult) {
        addToHistory({
          question: this.currentQuestion,
          num1: this.number1,
          operator: this.getOperatorSymbolForHistory(this.currentOperator),
          num2: this.number2,
          correctAnswer: this.expectedResultAsNumber,
          userAnswer: recordedText || '',
          interpretedAnswer: validationResult?.interpretedNumber ?? null,
          isCorrect: this.isResolved,
          difficulty: this.currentEffectiveLevel,
          timestamp: Date.now()
        });
      }
      
      if (isFinalResult) {
        this.speak();
        this.isPlayMode = true;
      }
    },
    /**
     * Get operator symbol for history storage
     */
    getOperatorSymbolForHistory(operator) {
      const symbols = {
        plus: '+',
        minus: '-',
        times: '×',
        divide: '÷'
      };
      return symbols[operator] || operator;
    },
    /**
     * Get word at position in string
     */
    getWordAt(str, pos) {
      str = String(str);
      pos = Number(pos) >>> 0;

      if (this.previousPosition === pos) {
        this.isTalking = false;
        return "";
      }
      this.previousPosition = pos;

      const left = str.slice(0, pos + 1).search(/\S+$/);
      const right = str.slice(pos).search(/\s/);
      
      if (right < 0) {
        if (!this.isQuery) {
          this.isPlayMode = true;
        }
        this.isTalking = false;
        return str.slice(left);
      }

      return str.slice(left, right + pos);
    },
  },
  async mounted() {
    // Try to start the music immediately. Browsers block an AudioContext until
    // the page has been interacted with, so if that is refused we arm a
    // one-shot listener and start on the very first touch or key instead.
    startMusic().catch(() => {});
    this.firstGesture = () => {
      startMusic().catch(() => {});
      window.removeEventListener('pointerdown', this.firstGesture);
      window.removeEventListener('keydown', this.firstGesture);
    };
    window.addEventListener('pointerdown', this.firstGesture, { once: true });
    window.addEventListener('keydown', this.firstGesture, { once: true });

    this.startIdleChat();
    this.scheduleBubbleClear();

    // Check microphone availability
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isMicrophoneEnabled = true;
    } catch {
      console.warn("Microphone not available");
    }

    this.listenForSpeechEvents();

    // Load saved game data
    const savedStars = localStorage.getItem('stars');
    if (savedStars) {
      this.stars = Math.min(parseInt(savedStars, 10) || 0, 100); // Cap at 100
    }
    
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore, 10) || 0;
    }
    
    const savedBestStreak = localStorage.getItem('bestStreak');
    if (savedBestStreak) {
      this.bestStreak = parseInt(savedBestStreak, 10) || 0;
    }
    
    const savedTotalQuestions = localStorage.getItem('totalQuestions');
    if (savedTotalQuestions) {
      this.totalQuestionsAnswered = parseInt(savedTotalQuestions, 10) || 0;
    }
    
    const savedTotalCorrect = localStorage.getItem('totalCorrect');
    if (savedTotalCorrect) {
      this.totalCorrectAnswers = parseInt(savedTotalCorrect, 10) || 0;
    }
    
    // Load language preference
    this.selectedLanguage = getPreferredLanguage();
    
    // Update speech_phrases to the selected language
    this.speech_phrases = this.t('initialPrompt');
    
    // Load problem history
    this.problemHistory = getHistory();
    
    // Preload sounds
    preloadSounds().catch(err => console.warn('Sound preload failed:', err));

    // Get speech token from API
    try {
      const { token, region } = await getSpeechToken();
      this.token = token;
      this.speechRegion = region;
    } catch (error) {
      console.error("Failed to get speech token:", error);
      this.isError = true;
      this.speech_phrases = "Server is unavailable. Please refresh the page.";
      this.showToast(this.speech_phrases, "danger");
    }
  },
  created() {
    window.addEventListener('keydown', this.keyDownHandler);
  },
  unmounted() {
    stopMusic();
    document.removeEventListener('keydown', this.onIntroKeydown);
    this.stopIdleChat();
    clearTimeout(this.bubbleTimer);
    clearTimeout(this.rewardTimer);
    if (this.firstGesture) {
      window.removeEventListener('pointerdown', this.firstGesture);
      window.removeEventListener('keydown', this.firstGesture);
    }
    window.removeEventListener('keydown', this.keyDownHandler);
    // Cleanup audio player
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
    // Cleanup audio analysis
    this.stopAudioAnalysis();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    // Clear any pending timeouts
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.expressionTimeout) {
      clearTimeout(this.expressionTimeout);
    }
  },
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

.settings-options.vertical {
  flex-direction: column;
}

.setting-option {
  flex: 1;
  min-width: 60px;
  padding: 12px 16px;
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
  gap: 12px;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px;
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
  gap: 10px;
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
  width: 48px;
  height: 48px;
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
  gap: 6px;
  height: 48px;
  padding: 0 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 215, 0, 0.45);
  background: rgba(16, 24, 40, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
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
  background: linear-gradient(145deg, #2a74ea, #1b57bc);
}

/* Not success green: green with a tick is the correct-answer signal, and a
   control must not borrow the vocabulary of feedback. */
.round-btn.done {
  background: linear-gradient(145deg, #5a4dc4, #3a3192);
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

/* Wordmark ----------------------------------------------------------------- */

.wordmark {
  position: absolute;
  left: 50%;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  transform: translateX(-50%);
  margin: 0;
  height: 48px;
  display: flex;
  align-items: center;
  /* Only the icon is spaced away; the two words sit tight together so they
     read as one mark rather than two labels. */
  gap: 7px;
  font-size: clamp(15px, 4.4vw, 21px);
  font-weight: 800;
  letter-spacing: -0.4px;
  white-space: nowrap;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
}

/* Below this the buttons either side would collide with it. */
@media (max-width: 340px) {
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

.intro-brand .wordmark-oliver,
.intro-brand .wordmark-math {
  font-size: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .wordmark-math,
  .wordmark-icon {
    animation: none;
  }
}

/* Speech glow -------------------------------------------------------------- */

.speak-glow {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: var(--glow, 0.3);
  animation: glow-breathe 1.8s ease-in-out infinite;
  background: radial-gradient(
    ellipse at center,
    transparent 48%,
    rgba(76, 217, 255, 0.42) 100%
  );
}

.speak-glow.listening {
  background: radial-gradient(
    ellipse at center,
    transparent 48%,
    rgba(51, 230, 102, 0.42) 100%
  );
}

@keyframes glow-breathe {
  0%, 100% { filter: brightness(0.85); }
  50% { filter: brightness(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  .speak-glow {
    animation: none;
  }
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

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

/* Intro card --------------------------------------------------------------- */

.intro-backdrop {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(6, 10, 20, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.intro-card {
  width: min(360px, 100%);
  padding: 26px 24px;
  border-radius: 26px;
  background: linear-gradient(160deg, #1d2a4d, #141d36);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #ffffff;
}

.intro-brand {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.intro-tagline {
  margin: 6px 0 20px;
  font-size: 14px;
  line-height: 1.4;
  color: #cbd6e8;
}

.intro-steps {
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
  text-align: left;
}

.intro-steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
}

.intro-num {
  flex: 0 0 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #2a74ea;
  font-size: 15px;
  font-weight: 800;
}

.intro-hear {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 16px;
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.intro-hear ion-icon {
  font-size: 20px;
}

.intro-hear[disabled] {
  opacity: 0.55;
  cursor: default;
}

.intro-hear:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

.intro-go {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(145deg, #2a74ea, #1b57bc);
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.intro-go:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .listen-bars i {
    animation: none;
  }
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
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

/* Full-bleed: the robot is the scene, not a picture placed on the page. It
   spans the whole content area and the bubble floats over it. The negative
   margins cancel ion-content's own padding so the canvas reaches the edges. */
.bot-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: stretch;
  /* Fill the scroll container. The dvh lines are a fallback for the case where
     the percentage cannot resolve; dvh rather than vh because 100vh on iOS
     Safari is the LARGE viewport and would run the scene under the browser
     chrome. 56px header + 90px footer. */
  /* The whole viewport now: there is no header, and the dock floats over the
     scene rather than taking layout space. dvh rather than vh because 100vh on
     iOS Safari is the LARGE viewport and would run the scene under the chrome. */
  min-height: 100vh;
  min-height: 100dvh;
  height: 100%;
  margin: -16px;
  padding: 0;
}

.status-indicator {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 12px 0;
}

.status-indicator ion-chip {
  font-size: 14px;
  padding: 8px 16px;
  --border-radius: 16px;
  /* `background`, not `--background`: ion-chip is shadow-encapsulated and its
     own :host(.ion-color) rule sets background directly, which beat the custom
     property. The chip was rendering white-on-8%-tint at ~1.06:1 - invisible on
     any phone not set to dark mode. */
  background: #0b4fd0;
  color: white;
}

.status-indicator ion-icon {
  color: #ffd700;
  margin-right: 6px;
}

.status-indicator ion-label {
  color: white;
}

ion-footer.footer-spacer {
  min-height: 90px;
}

ion-footer ion-toolbar {
  padding: 8px 16px 16px;
  --background: transparent;
}

.play-button {
  --border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  height: 56px;
  text-transform: none;
}

.play-button ion-icon {
  font-size: 24px;
  margin-right: 8px;
}

/* Same size and weight as Play: it occupies the same slot and is just as
   important to a child who has finished speaking.
   Deliberately NOT success green - green plus a checkmark is the correct-answer
   signal, and a control must not borrow the vocabulary of feedback. Indigo is
   distinct from the primary-blue Play button; white on it is 7.99:1. */
.done-button {
  --border-radius: 16px;
  --background: #4a3fb0;
  --background-activated: #3a3192;
  --background-hover: #3a3192;
  --color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  height: 56px;
  text-transform: none;
}

.done-button ion-icon {
  font-size: 24px;
  margin-right: 8px;
}

/* Responsive adjustments */
@media (max-width: 400px) {
  .bot-container {
    min-height: 300px;
  }
  
  .stats-row {
    flex-wrap: wrap;
  }
  
  .stat-chip {
    font-size: 11px;
    padding: 4px 8px;
  }
}

/* Stats row styling */
.stats-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--ion-color-step-100);
}

.stat-chip {
  font-size: 12px;
  margin: 2px;
}

.star-chip {
  --background: #ffd700 !important;
  color: #000 !important;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.star-chip:hover,
.star-chip:focus {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
}

.star-chip:active {
  transform: scale(0.98);
}

.star-chip ion-icon {
  color: #000 !important;
}

/* Action buttons */
/* Sits below the floating HUD rather than stacking a second row of controls
   into the same corner, which previously put six icon buttons in ~120px. */
.action-buttons {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 74px);
  right: 16px;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 19;
}

.action-buttons ion-button {
  --color: #ffffff;
  --background: rgba(16, 24, 40, 0.42);
  --background-hover: rgba(16, 24, 40, 0.6);
  --border-radius: 50%;
  --padding-start: 0;
  --padding-end: 0;
  width: 44px;
  height: 44px;
}

.action-buttons ion-button:hover {
  --color: var(--ion-color-primary);
}

/* Language selector */
.language-selector {
  position: absolute;
  top: 60px;
  right: 8px;
  z-index: 10;
}

.language-flag {
  font-size: 24px;
}

.language-flag-toolbar {
  font-size: 20px;
  margin: 0 4px;
}

.selected-language {
  --background: var(--ion-color-primary-tint);
}

/* Toast styling */
.toast-compact::part(container) {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  bottom: 130px;
  margin: 0 16px;
  width: calc(100% - 32px);
}

.toast-compact::part(message) {
  padding: 0;
}

/* Problem History Modal */
.no-history {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.correct-item {
  --border-left: 4px solid var(--ion-color-success);
}

.incorrect-item {
  --border-left: 4px solid var(--ion-color-danger);
}

.problem-equation {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.user-answer {
  color: var(--ion-color-danger);
  font-size: 13px;
}

.problem-time {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.clear-history-btn {
  margin-top: 20px;
}

@media (min-width: 768px) {
  .settings-modal {
    --max-width: 500px;
    --border-radius: 16px;
    align-items: center;
  }
  
  .bot-container {
    min-height: 400px;
  }
  
  ion-footer ion-toolbar {
    max-width: 400px;
    margin: 0 auto;
  }
}

/* Animation for status chip */
.status-indicator ion-chip {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Respect a reduced-motion preference. This stops the decorative loops only -
   the correct/incorrect feedback, expression changes and state colours all
   still happen, because that is information, not decoration. */
@media (prefers-reduced-motion: reduce) {
  .status-indicator ion-chip {
    animation: none;
  }

  .toast-compact,
  .setting-option,
  .star-chip {
    transition: none;
  }
}
</style>