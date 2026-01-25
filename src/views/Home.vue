<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button fill="clear" size="small" @click="showSettingsModal = true" aria-label="Open settings">
            <ion-icon :icon="settingsIcon" slot="icon-only" style="color: white;"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" size="small" id="language-trigger-header" aria-label="Change language" aria-expanded="false" aria-haspopup="menu">
            <span class="language-flag-toolbar" aria-hidden="true">{{ availableLanguages[selectedLanguage]?.flag }}</span>
          </ion-button>
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
          <ion-chip 
            color="warning" 
            class="star-chip clickable-chip" 
            router-link="/stats"
            aria-label="View stats and achievements"
            role="button"
          >
            <ion-icon :icon="star" aria-hidden="true"></ion-icon>
            <ion-label>{{ starsDisplay }}</ion-label>
          </ion-chip>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

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

      <!-- Bot Container -->
      <div class="bot-container">
        <AnimatedBot
          :botState="botState"
          :isPlayMode="isPlayMode"
          :text="speech_phrases"
          :audioLevel="audioLevel"
          size="200px"
          @click="changeStatus('laughing')"
          aria-live="polite"
        />
      </div>
    </ion-content>
    
    <ion-footer class="ion-no-border footer-spacer">
      <ion-toolbar>
        <!-- Status Indicator -->
        <div class="status-indicator" v-if="botState !== 'thinking'">
          <ion-chip :color="statusColor">
            <ion-icon :icon="statusIcon" aria-hidden="true"></ion-icon>
            <ion-label>{{ statusText }}</ion-label>
          </ion-chip>
        </div>
      </ion-toolbar>
      <ion-toolbar v-if="isPlayMode && botState !== 'broken'">
        <ion-button
          expand="block"
          size="large"
          @click="askQuestion"
          :disabled="isComputing"
          class="play-button"
          aria-label="Start a new math question"
        >
          <ion-icon :icon="playIcon" slot="start" v-if="!isComputing"></ion-icon>
          <ion-spinner name="crescent" v-if="isComputing"></ion-spinner>
          {{ isComputing ? t('thinking') : t('play') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonChip,
  IonLabel,
  IonIcon,
  toastController,
  IonItem,
  IonButton,
  IonButtons,
  IonFooter,
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
import { star, play, speedometer, calculator, mic, volumeHigh, sync, alertCircle, refresh, volumeMute, timeOutline, trashOutline, globe, fitness, settingsOutline, close } from "ionicons/icons";
import { OPERATORS, LEVELS, NUMBER_RANGES, SCORING } from "@/config/gameConfig";
import { getRandomInt } from "@/utils/helpers";
import { getSpeechToken, getCachedAudio, validateAnswer } from "@/services/apiService";
import { LANGUAGES, SPEECH_VOICES, getPreferredLanguage, setLanguage, t, getRandomPhrase } from "@/config/i18n";
import { addToHistory, getHistory, clearHistory as clearHistoryService, formatTimestamp, getOperatorSymbol, getRecommendedDifficulty, getSpacedRepetitionProblem } from "@/services/historyService";
import { preloadSounds, playCorrectSound, playIncorrectSound, toggleMute } from "@/services/soundService";
import { celebrateConfetti, celebrateStreak, showStar } from "@/utils/confetti";

export default {
  name: "Math",
  components: {
    AnimatedBot,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonChip,
    IonLabel,
    IonIcon,
    IonItem,
    IonButton,
    IonButtons,
    IonFooter,
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
  computed: {
    botState() {
      if (this.isError) {
        return "broken";
      }
      if (this.isLaughing){
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
      this.showToast(this.t('listening'), "warning");
      this.isComputing = true;
      this.isListening = false;
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
     * React to speech recording events
     */
    listenForSpeechRecordingEvents() {
      const self = this;

      // Signals that a new session has started with the speech service
      this.speechRecording.speechStartDetected = function () {
        console.log("speechStartDetected");
        self.showToast("I'm Listening", "success");
        self.isListening = true;
        self.isComputing = false;
      };

      this.speechRecording.recognizing  = function (s, e) {
        window.console.log('recognizing ', e.result.text);
        self.validateSpeechRecording(e.result.text, false);
      };

      this.speechRecording.recognizeOnceAsync(
        function (result) {
          self.validateSpeechRecording(result.text, true);
          self.isListening = false;
          self.isComputing = false;
          self.speechRecording.close();
          self.speechRecording = null;
        },
        function (err) {
          console.log("err recognizeOnceAsync", err);
          self.showToast("Unable to connect to the server.", "danger");
          self.isListening = false;
          self.isComputing = false;
          self.isQuery = false;
          self.isError = true;
          self.text = "Unable to recognized the voice. Internal error";
          self.showToast(self.text);

          self.speechRecording.close();
          self.speechRecording = null;
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
          this.text, // The question
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
      const isSilent = recordedText === undefined || recordedText === '';
      const displayText = isSilent ? "(silent)" : String(recordedText);

      let validationResult = null;
      
      if (!isSilent) {
        this.showToast(`I heard: "${displayText}"`, "secondary");
        this.isComputing = true;
        validationResult = await this.validateWordWithLLM(recordedText);
        this.isComputing = false;
        
        // Show interpreted number if different from what was heard
        if (validationResult?.understood && validationResult.interpretedNumber !== null) {
          const interpreted = validationResult.interpretedNumber;
          this.showToast(`Interpreted as: ${interpreted}`, validationResult.correct ? "success" : "warning");
        }
      } else if (isFinalResult) {
        // Show confused when no speech detected
        this.showExpression('confused', 2000);
      }

      if (isFinalResult) {
        this.totalQuestionsAnswered++;
        localStorage.totalQuestions = this.totalQuestionsAnswered;
      }

      if (this.isResolved) {
        this.consecutiveCorrect++;
        this.totalCorrectAnswers++;
        localStorage.totalCorrect = this.totalCorrectAnswers;
        
        const points = this.calculatePoints();
        this.stars = Math.min(this.stars + points, 100); // Cap at 100 stars
        
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

.bot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 350px;
  padding: 16px;
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
  --background: #0066ff;
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
.action-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 20;
}

.action-buttons ion-button {
  --color: var(--ion-color-medium);
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

/* Dark mode adjustments - settings already dark themed */
@media (prefers-color-scheme: dark) {
  /* Settings modal is already dark */
}
</style>