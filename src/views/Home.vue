<template>
  <ion-page>
    <!-- The page had no h1 at all, which left search engines and screen
         readers with no statement of what this page is. It is visually hidden
         because the wordmark carries the branding on screen - and on a phone
         even that is hidden - but it must still be in the document. -->
    <h1 class="visually-hidden">Oliver Math - practise maths by talking to a robot</h1>

    <GameHud
      :language="selectedLanguage"
      :stars="stars"
      :dayMode="dayMode"
      @grown-ups="openGate('grown-ups')"
      @help="showIntro = true"
      @toggle-sky="toggleDayNight"
    />


    <IntroCard
      v-if="showIntro"
      :language="selectedLanguage"
      :talking="isTalking"
      @hear="explainGame"
      @close="dismissIntro"
    />

    <GrownUpsSheet
      :open="showSettingsModal"
      :language="selectedLanguage"
      :languages="availableLanguages"
      v-model:level="selectedLevel"
      v-model:operator="selectedOperator"
      v-model:mode="sessionMode"
      :view="botView"
      :dayMode="dayMode"
      :colour="botColour"
      :autoChat="autoChat"
      :muted="isMuted"
      :historyCount="problemHistory.length"
      :fullGame="trialApplies ? { unlocked, left: sumsLeft, count: freeSums } : null"
      @full-game="showSettingsModal = false; openUnlock()"
      @update:language="changeLanguage"
      @update:view="setBotView"
      @update:dayMode="setDayMode"
      @update:colour="setBotColour"
      @update:autoChat="setAutoChat"
      @toggle-mute="handleToggleMute"
      @clear-history="handleClearHistory"
      @help="showIntro = true; showSettingsModal = false"
      @close="showSettingsModal = false"
    />
    
    <ion-content :fullscreen="true" class="ion-padding" role="main">
      <!-- Action Buttons (when not in play mode) -->
      <div class="action-buttons" v-if="!isPlayMode && !isComputing" role="toolbar" aria-label="Question controls">
        <ion-button fill="clear" size="small" @click="repeatQuestion" :disabled="!currentQuestion || isTalking" aria-label="Repeat question" :title="!currentQuestion ? 'No question available' : 'Repeat question'">
          <ion-icon :icon="refreshIcon" slot="icon-only" aria-hidden="true"></ion-icon>
        </ion-button>
        <ion-button fill="clear" size="small" @click="openHistoryModal" aria-label="View problem history" title="View previously solved problems">
          <ion-icon :icon="historyIcon" slot="icon-only" aria-hidden="true"></ion-icon>
        </ion-button>
      </div>

      <!-- Problem History Modal -->
      <HistorySheet
        :open="showHistoryModal"
        :language="selectedLanguage"
        :history="problemHistory"
        @close="showHistoryModal = false"
      />

      <!-- Speech glow. The robot talking is otherwise inaudible AND invisible
           with the volume down or the device muted, so the screen edges pulse
           in the speaking colour. Driven by the real amplitude where we have
           it, with a CSS pulse underneath so it still moves when we do not. -->
      <div class="speak-glow" :class="botState" v-if="isTalking || isListening" :style="{ '--glow': speakGlow }" aria-hidden="true"></div>

      <!-- Bot Container -->
      <div class="bot-container">
        <AnimatedBot
          :botState="botState"
          :text="bubbleText"
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
    
    <!-- The sum as big figures. It used to exist only as a sentence in a small
         bubble that the next line replaced; a child who missed the voice had
         nothing to go on. Figures are readable before sentences are, and they
         stay until the answer is marked. -->
    <transition name="panel">
      <div class="sum-card" v-if="showSum" role="status" :aria-label="currentQuestion">
        <span class="sum-figures" aria-hidden="true">{{ number1 }} <i>{{ sumSymbol }}</i> {{ number2 }}</span>
        <span class="sum-answer" v-if="isListening || sumHeard" aria-hidden="true">= <b :class="{ empty: !sumHeard }">{{ sumHeard || '?' }}</b></span>
      </div>
    </transition>

    <!-- First run. No card to read and dismiss: the game is the first screen,
         and the three steps are pictures. Tapping them makes the robot say it
         out loud, for a child who cannot read the words yet. -->
    <button class="how-chips" v-if="firstRun && isPlayMode && !showNoMic && !showIntro && !micAsk && !isTalking" @click="explainGame" :aria-label="t('hearIt')">
      <span><ion-icon :icon="playIcon" aria-hidden="true"></ion-icon>{{ t('howTap') }}</span>
      <span><ion-icon :icon="volumeIcon" aria-hidden="true"></ion-icon>{{ t('howListen') }}</span>
      <span><ion-icon :icon="micIcon" aria-hidden="true"></ion-icon>{{ t('howSay') }}</span>
    </button>

    <GameDock
      :language="selectedLanguage"
      :botState="botState"
      :playing="isPlayMode"
      :listening="isListening"
      :talking="isTalking"
      :computing="isComputing"
      :firstRun="firstRun"
      :padOpen="padOpen"
      :heardText="heardText"
      :reward="reward"
      :sums="operatorChoices.find((choice) => choice.value === selectedOperator)"
      @play="askQuestion"
      @done="finishAnswering"
      @pad="openPad"
      @choose-sums="showSumPicker = true"
    />

    <NumberPad
      :open="padOpen"
      :language="selectedLanguage"
      :equation="padEquation"
      @key="triggerHaptic('light')"
      @submit="submitPad"
      @close="closePad"
    />

    <MicrophoneCards
      :language="selectedLanguage"
      :languageName="availableLanguages[selectedLanguage]?.name"
      :noMic="showNoMic"
      :noMicBody="noMicBody"
      :refused="micRefused"
      :asking="micAsk"
      :learning="learningLanguage"
      @use-pad="playWithPad"
      @retry="retryMicrophone"
      @close="showNoMic = false"
      @answer="answerMicAsk"
    />

    <TrialCards
      :language="selectedLanguage"
      :count="freeSums"
      :limitOpen="showLimit"
      :unlockOpen="showUnlock"
      :canPurchase="canPurchase"
      :price="fullGamePrice"
      :busy="purchaseBusy"
      :message="purchaseMessage"
      :storeLink="storeLink"
      @grown-ups="showLimit = false; openGate('unlock')"
      @close-limit="showLimit = false"
      @buy="buyUnlock"
      @restore="restoreUnlock"
      @close-unlock="showUnlock = false"
    />

    <SumPicker
      :open="showSumPicker"
      :language="selectedLanguage"
      :choices="operatorChoices"
      :selected="selectedOperator"
      @choose="chooseOperator"
      @close="showSumPicker = false"
    />

    <ParentalGate
      :open="gateOpen"
      :language="selectedLanguage"
      @pass="onGatePassed"
      @miss="triggerHaptic('error')"
      @close="gateOpen = false"
    />
  </ion-page>
</template>
<script>
import { IonPage, IonContent, IonIcon, IonButton, toastController } from "@ionic/vue";
import { play, volumeHigh, mic, refresh, timeOutline } from "ionicons/icons";
import AnimatedBot from "@/components/AnimatedBot.vue";
import GameHud from "@/components/game/GameHud.vue";
import GameDock from "@/components/game/GameDock.vue";
import IntroCard from "@/components/game/IntroCard.vue";
import GrownUpsSheet from "@/components/game/GrownUpsSheet.vue";
import HistorySheet from "@/components/game/HistorySheet.vue";
import NumberPad from "@/components/game/NumberPad.vue";
import MicrophoneCards from "@/components/game/MicrophoneCards.vue";
import SumPicker from "@/components/game/SumPicker.vue";
import ParentalGate from "@/components/game/ParentalGate.vue";
import TrialCards from "@/components/game/TrialCards.vue";
import { OPERATORS, LEVELS, SCORING, STORE_LINKS } from "@/config/gameConfig";
import { checkSpokenAnswer } from "@/utils/numberWords";
import { createSpeech, isNativeApp, openDeviceSettings } from "@/game/speech";
import { nextQuestion, answerTo } from "@/game/questions";
import { BODY_COLOURS } from "@/game/options";
import { FREE_SUMS_PER_DAY, sumsLeftToday, countSum, wasUnlocked, rememberUnlocked } from "@/game/trial";
import { canPurchase, fullGameProduct, ownsFullGame, buyFullGame, restoreFullGame, onFullGameChange } from "@/services/purchases";
import { LANGUAGES, SPEECH_VOICES, getPreferredLanguage, setLanguage, t, getRandomPhrase } from "@/config/i18n";
import { addToHistory, getHistory, clearHistory as clearHistoryService, getOperatorSymbol } from "@/services/historyService";
import { preloadSounds, playCorrectSound, playIncorrectSound, toggleMute, startMusic, stopMusic, duckMusic } from "@/services/soundService";
import { celebrateConfetti, celebrateStreak, showStar } from "@/utils/confetti";

/**
 * The game screen. It owns the turn: ask a sum, hear or read the answer, mark
 * it, reward it. What the screen is made of lives in components/game, the
 * robot's voice and ears in game/speech.js, and the choice of sum in
 * game/questions.js.
 */
export default {
  name: "Math",
  components: {
    AnimatedBot,
    GameHud,
    GameDock,
    IntroCard,
    GrownUpsSheet,
    HistorySheet,
    NumberPad,
    MicrophoneCards,
    SumPicker,
    ParentalGate,
    TrialCards,
    IonPage,
    IonContent,
    IonIcon,
    IonButton
  },
  setup() {
    return {
      playIcon: play,
      volumeIcon: volumeHigh,
      micIcon: mic,
      refreshIcon: refresh,
      historyIcon: timeOutline,
      freeSums: FREE_SUMS_PER_DAY,
      canPurchase
    };
  },
  data() {
    return {
      // UI state
      typeText: [],
      isLoading: true,
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
      // The help card is now opened from the "?" button only. A first visit
      // lands on the game itself, with the three steps shown as pictures.
      showIntro: false,
      firstRun: !localStorage.seenIntro,
      // A sum has been asked and not yet marked.
      questionActive: false,
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
      // Remembered between visits. They used to reset to Medium and times
      // every time the game was opened.
      selectedLevel: [...Object.values(LEVELS), 'auto'].includes(localStorage.selectedLevel)
        ? localStorage.selectedLevel
        : LEVELS.MEDIUM,
      selectedOperator: Object.values(OPERATORS).includes(localStorage.selectedOperator)
        ? localStorage.selectedOperator
        : OPERATORS.TIMES,
      showSumPicker: false,
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
      // Native apps: the card shown before the system asks for the
      // microphone, and the one shown while a language's speech model arrives.
      micAsk: false,
      learningLanguage: false,
      // The free version: a few sums a day until the full game is unlocked.
      unlocked: wasUnlocked(),
      sumsLeft: sumsLeftToday(),
      showLimit: false,
      showUnlock: false,
      fullGamePrice: '',
      purchaseBusy: false,
      purchaseMessage: '',
      // Parental gate in front of Grown-ups.
      gateThen: 'grown-ups',
      gateOpen: false,
      // Number pad and the no-microphone card.
      padOpen: false,
      // The child chose to tap answers. Not saved: every visit gets a fresh
      // chance to use the microphone.
      padMode: false,
      showNoMic: false,
      // Why the phone cannot listen, from the native speech plugin.
      deviceSpeechReason: '',
      problemHistory: [],
      availableLanguages: LANGUAGES,
      
      // The loudness of the robot's voice, 0 to 1, for its mouth and the glow.
      audioLevel: 0,
      
      // Config
      isMicrophoneEnabled: false,
      publicPath: import.meta.env.BASE_URL,
      timeout: null,
      expressionTimeout: null,
    };
  },
  watch: {
    // Music through the speaker is picked straight back up by an open
    // microphone, so pull it down whenever the robot is talking or listening
    // and bring it back once the turn is over.
    botState(state) {
      duckMusic(['speaking', 'listening', 'computing'].includes(state));
    },
    selectedOperator(value) {
      try {
        localStorage.selectedOperator = value;
      } catch (err) {
        console.warn('Could not save the type of sum:', err);
      }
    },
    selectedLevel(value) {
      try {
        localStorage.selectedLevel = value;
      } catch (err) {
        console.warn('Could not save the level:', err);
      }
    },
    // Play is back on screen, so the turn is over and the sum comes down.
    isPlayMode(playing) {
      if (playing) this.questionActive = false;
    }
  },
  computed: {
    /** The four kinds of sum, each as a symbol and a word in the chosen language. */
    operatorChoices() {
      return [
        { value: 'times', symbol: '×', word: this.t('times') },
        { value: 'plus', symbol: '+', word: this.t('plus') },
        { value: 'minus', symbol: '−', word: this.t('minus') },
        { value: 'divide', symbol: '÷', word: this.t('dividedBy') }
      ];
    },
    sumSymbol() {
      const symbols = { plus: '+', minus: '−', times: '×', divide: '÷' };
      return symbols[this.currentOperator] || symbols[this.selectedOperator] || '×';
    },
    /** The sum as figures, for the number pad: "3 × 11". */
    padEquation() {
      return `${this.number1} ${this.sumSymbol} ${this.number2}`;
    },
    /** The pad shows the sum itself, so the card steps aside for it. */
    showSum() {
      return this.questionActive && !this.isPlayMode && !this.padOpen;
    },
    /** What the robot heard, once it is a number: it drops into the sum. */
    sumHeard() {
      return /^\d+$/.test(String(this.heardText || '')) ? String(this.heardText) : '';
    },
    /**
     * The bubble is for things the robot says that are not on screen already.
     * While the sum is up in figures, repeating it as a sentence underneath
     * only crowds a phone.
     */
    bubbleText() {
      if (this.showSum && this.text === this.currentQuestion) return '';
      return this.speech_phrases;
    },
    /** On the web: the store for this device, if the apps are live. */
    storeLink() {
      const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
      return (apple ? STORE_LINKS.ios : STORE_LINKS.android) || STORE_LINKS.ios || STORE_LINKS.android || '';
    },
    /**
     * Whether the free version's limit is in force here: always in the apps;
     * on the web only once there is an app to point to.
     */
    trialApplies() {
      return canPurchase || !!this.storeLink;
    },
    /** In the apps, a refused microphone can only be turned back on in Settings. */
    micRefused() {
      return isNativeApp && this.deviceSpeechReason === 'microphone-denied';
    },
    /** In the apps the microphone may be fine and the speech model missing. */
    noMicBody() {
      if (isNativeApp && this.deviceSpeechReason === 'model-not-installed') return this.t('cantListenYet');
      if (isNativeApp && this.deviceSpeechReason && this.deviceSpeechReason !== 'microphone-denied') return this.t('cantListenHere');
      return this.t('cantHearBody');
    },
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
      // currentOperator may differ from the one chosen, in the practice modes.
      return answerTo(this.number1, this.number2, this.currentOperator || this.selectedOperator);
    },
    /** The language the robot speaks and listens in, e.g. 'en-GB'. */
    speechLocale() {
      return SPEECH_VOICES[this.selectedLanguage] || 'en-GB';
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
    // 0-1, used as the strength of the edge glow while the robot talks.
    speakGlow() {
      return (0.22 + Math.min(this.audioLevel, 1) * 0.6).toFixed(3);
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
      // The sheets handle their own keys while they are open.
      if (this.padOpen || this.gateOpen || this.showSumPicker || this.showUnlock) return;
      let value = e.key * 1;
      if (!isNaN(parseFloat(value)) && isFinite(value)){
        this.typeText.push(value);
        if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(async () => {
            if (this.typeText.length > 0){
              var typeText = this.typeText.join('');
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
    /**
     * Make sure the robot can listen: the microphone, and whatever the engine
     * needs behind it (a token on the web, a speech model in the apps).
     * Sets isMicrophoneEnabled; never throws.
     */
    async enableMicrophone() {
      // Playing with the number pad: do not ask for the microphone again on
      // every question.
      if (this.padMode && !this.isMicrophoneEnabled) return;
      let readiness;
      try {
        readiness = await this.speech.prepare(this.speechLocale, {
          // Never asked before: the robot asks for a grown-up first.
          beforePrompt: () => this.askForGrownUp(),
          onDownloading: () => { this.learningLanguage = true; }
        });
      } finally {
        this.learningLanguage = false;
      }
      this.isMicrophoneEnabled = readiness.ready;
      this.deviceSpeechReason = readiness.reason;
      // "Use the number pad" on the ask-a-grown-up card.
      if (readiness.reason === 'declined') this.padMode = true;
    },
    /**
     * Play: ask the next sum.
     */
    async askQuestion() {
      // The free version: today's sums are used up. Good news for the child,
      // and a way in for a grown-up.
      if (this.trialApplies && !this.unlocked && sumsLeftToday() <= 0) {
        this.sumsLeft = 0;
        this.showLimit = true;
        return;
      }
      this.isResolved = false;
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

      try {
        await this.enableMicrophone();
      } catch (error) {
        console.error('Failed to ask question:', error);
        this.isComputing = false;
        this.isError = true;
        this.text = this.t('somethingWrong');
        this.showToast(this.text, 'warning');
        return;
      }

      if (!this.isMicrophoneEnabled && !this.padMode) {
        // No microphone, or no speech model yet. This used to be the end of
        // the game: a lower-case English message and an "Error" chip. Now it
        // is a card with a way to play.
        this.isComputing = false;
        this.speech_phrases = '';
        this.showNoMic = true;
        return;
      }

      this.isComputing = false;
      this.isQuery = true;
      this.isPlayMode = false;
      this.speech_phrases = '';

      const question = nextQuestion({
        operator: this.selectedOperator,
        level: this.selectedLevel,
        autoLevel: this.currentAutoLevel,
        mode: this.sessionMode
      });
      if (question.levelChange) {
        this.showToast(this.t(question.levelChange === 'up' ? 'difficultyIncreased' : 'difficultyDecreased'), 'primary');
      }
      this.currentAutoLevel = question.autoLevel;
      // The level and operator actually used, for the history. In the practice
      // modes the operator can differ from the one chosen.
      this.currentEffectiveLevel = question.level;
      this.currentOperator = question.operator;
      this.number1 = question.number1;
      this.number2 = question.number2;

      const words = { plus: this.t('plus'), minus: this.t('minus'), times: this.t('times'), divide: this.t('dividedBy') };
      this.text = `${this.t('whatIs')} ${this.number1} ${words[question.operator] || question.operator} ${this.number2}?`;
      this.currentQuestion = this.text; // Store for repeat
      this.questionActive = true;
      if (this.firstRun) {
        this.firstRun = false;
        try {
          localStorage.seenIntro = '1';
        } catch (err) {
          console.warn('Could not save the intro flag:', err);
        }
      }
      this.speak();
      // Tapping does not have to wait for the robot to stop talking, and must
      // not depend on the voice finishing at all: a device with no working
      // voice would otherwise never reach the pad.
      if (this.padMode && !this.isMicrophoneEnabled) {
        this.isQuery = false;
        this.openPad();
      }
    },
    /**
     * The robot says this.text. A new line cuts off the one before it.
     */
    async speak() {
      // Show text immediately
      this.speech_phrases = this.text;
      this.isTalking = true;

      const result = await this.speech.speak(this.text, this.speechLocale);
      // Stopped by hand, or replaced by the next line. Whoever stopped it has
      // already moved the turn on.
      if (result === 'stopped') return;
      this.afterSpeaking();
    },
    /**
     * What happens when the robot finishes a line: tidy up, and open the
     * microphone if the line was a question.
     */
    afterSpeaking() {
      this.isTalking = false;
      this.audioLevel = 0;
      if (this.clearAfterSpeak) {
        this.clearAfterSpeak = false;
        this.text = '';
        this.speech_phrases = '';
      }
      if (this.isQuery) {
        this.isQuery = false;
        this.listen();
      }
    },
    chooseOperator(value) {
      this.selectedOperator = value;
      this.showSumPicker = false;
    },
    /** Shows the "ask a grown-up" card and waits for one of its two buttons. */
    askForGrownUp() {
      this.isComputing = false;
      this.micAsk = true;
      return new Promise((resolve) => {
        this.micAskResolve = resolve;
      });
    },
    answerMicAsk(goAhead) {
      this.micAsk = false;
      const resolve = this.micAskResolve;
      this.micAskResolve = null;
      if (resolve) resolve(goAhead);
    },
    /**
     * @param {'grown-ups'|'device-settings'|'unlock'} then - what passing the gate opens
     */
    openGate(then) {
      this.gateThen = ['device-settings', 'unlock'].includes(then) ? then : 'grown-ups';
      this.gateOpen = true;
    },
    onGatePassed() {
      this.gateOpen = false;
      // Leaving the app for the phone's Settings, and anything to do with
      // buying, are grown-ups' steps too.
      if (this.gateThen === 'device-settings') openDeviceSettings();
      else if (this.gateThen === 'unlock') this.openUnlock();
      else this.showSettingsModal = true;
    },
    /** The full-game sheet. Only ever opened from behind the gate. */
    async openUnlock() {
      this.purchaseMessage = '';
      this.showUnlock = true;
      if (!canPurchase || this.fullGamePrice) return;
      const product = await fullGameProduct();
      this.fullGamePrice = product.available ? product.price || '' : '';
      if (!product.available) this.purchaseMessage = this.t('fullGameUnavailable');
    },
    /** As setUnlocked, without the thank-you: used when the app starts. */
    setUnlockedQuietly(unlocked) {
      this.unlocked = unlocked;
      rememberUnlocked(unlocked);
    },
    setUnlocked(unlocked) {
      this.unlocked = unlocked;
      rememberUnlocked(unlocked);
      if (unlocked) {
        this.showLimit = false;
        this.purchaseMessage = this.t('fullGameUnlocked');
      }
    },
    async buyUnlock() {
      this.purchaseBusy = true;
      this.purchaseMessage = '';
      const result = await buyFullGame();
      this.purchaseBusy = false;
      if (result.unlocked) this.setUnlocked(true);
      else if (result.pending) this.purchaseMessage = this.t('fullGamePending');
      else if (result.failed) this.purchaseMessage = this.t('fullGameFailed');
    },
    async restoreUnlock() {
      this.purchaseBusy = true;
      this.purchaseMessage = '';
      const owned = await restoreFullGame();
      this.purchaseBusy = false;
      if (owned) this.setUnlocked(true);
      else this.purchaseMessage = this.t('fullGameNotFound');
    },
    /** A tapped answer goes down the same path as a spoken one: same stars. */
    async submitPad(answer) {
      this.padOpen = false;
      await this.validateSpeechRecording(answer, true);
    },
    /**
     * Open the number pad for the current sum. If the microphone is open it is
     * closed first; whatever it was in the middle of hearing is dropped, not
     * scored, because the child has chosen to tap instead.
     */
    openPad() {
      this.padOpen = true;
      this.showNoMic = false;
      if (this.isListening) this.stopListening();
      this.isListening = false;
      this.isComputing = false;
      this.isPlayMode = false;
    },
    /** Close without answering. Like Done: the turn ends and is not scored. */
    closePad() {
      this.padOpen = false;
      if (this.answerFinalised) return;
      this.answerFinalised = true;
      this.isQuery = false;
      this.isPlayMode = true;
    },
    /** "Play with the number pad" on the no-microphone card. */
    playWithPad() {
      this.padMode = true;
      this.showNoMic = false;
      this.askQuestion();
    },
    /** "Try the microphone again" on the no-microphone card. */
    retryMicrophone() {
      // Refused in the app: asking again does nothing, the phone will not show
      // its question twice. The way back is Settings, behind the gate.
      if (this.micRefused) {
        this.showNoMic = false;
        this.openGate('device-settings');
        return;
      }
      this.padMode = false;
      this.showNoMic = false;
      this.speech.reset();
      this.askQuestion();
    },
    /**
     * The child's turn. Opens the microphone for one answer, or the number pad
     * when they are playing without one.
     */
    async listen() {
      // The microphone is open, so it is the child's turn to speak RIGHT NOW.
      // isListening gives them the green listening robot and "Your turn!".
      this.isComputing = false;
      if (this.padMode && !this.isMicrophoneEnabled) {
        this.openPad();
        return;
      }
      this.isListening = true;
      const turn = (this.listenTurn = (this.listenTurn || 0) + 1);
      try {
        const heard = await this.speech.listen(this.speechLocale, (partial) => {
          // Display only: one spoken number, one score.
          if (turn === this.listenTurn && this.isListening) this.heardText = partial;
        });
        if (turn !== this.listenTurn) return;
        // The turn may already be over - the child tapped Done, or opened the
        // pad - so a late result is dropped rather than scored twice.
        const wasAlreadyFinalised = this.answerFinalised;
        this.isListening = false;
        this.isComputing = false;
        if (wasAlreadyFinalised || this.padOpen) return;
        this.validateSpeechRecording(heard, true);
      } catch (error) {
        console.warn('Listening failed:', error);
        if (turn !== this.listenTurn) return;
        this.isListening = false;
        this.isComputing = false;
        if (this.answerFinalised || this.padOpen) return;
        // The game could not listen at all. Same sum, on the pad.
        this.isQuery = false;
        this.openPad();
      }
    },
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
      this.speech.stopSpeaking();
      this.isTalking = false;
      this.audioLevel = 0;

      // Pausing the audio means onended never fires, so the work it would have
      // done has to happen here - otherwise the turn strands with neither the
      // Play nor the Done button on screen.
      if (this.isQuery) {
        this.isQuery = false;
        this.listen();
      } else if (!this.isListening && !this.padOpen) {
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
     * Close the microphone. Safe to call more than once, and while a listen is
     * still in flight: its result arrives as silence and is dropped.
     */
    stopListening() {
      this.isListening = false;
      this.isComputing = false;
      this.speech.stopListening();
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
    /**
     * Work out what the child said and whether it is right.
     *
     * Interpreted LOCALLY first. This used to call the backend for every
     * answer, which made a maths game depend on a network round trip, an API
     * key and a running Function App just to tell 56 from 42 - and when any of
     * those failed the fallback was a digit regex, which finds nothing in
     * spoken words, so a child saying the correct answer was told they were
     * wrong. Reading a spoken number needs no model.
     *
     * The backend is still consulted, but only when local parsing finds no
     * number at all - the phrasings a lookup cannot cover. If it is unavailable
     * the game carries on working.
     */
    async validateWordWithLLM(word) {
      if (!word || this.isResolved) return;

      const local = checkSpokenAnswer(word, this.expectedResultAsNumber, this.selectedLanguage);

      if (local.understood) {
        if (local.correct) this.isResolved = true;
        return {
          correct: local.correct,
          understood: true,
          interpretedNumber: local.number,
          confidence: 'high'
        };
      }

      // Nothing recognisable locally, so this is "I did not catch that" -
      // never a wrong answer. The web version used to send the transcript on
      // to a backend that passed it to a language model and logged it. A
      // children's game should not send what a child said anywhere it does
      // not have to, and the child now has the number pad instead.
      return { correct: false, understood: false, interpretedNumber: null };
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

        // Not heard twice. This used to end the turn with "Say it again!" on
        // screen, the microphone closed and the sum thrown away. Keep the sum
        // and let the child tap it.
        this.isQuery = false;
        this.text = this.t('padPrompt');
        this.openPad();
        this.speak();
        return;
      }

      // Count the question whenever the turn actually gets an outcome. Gating
      // this on isFinalResult alone skewed accuracy above 100%, because a
      // correct answer recognised from an interim transcript incremented the
      // correct count without ever incrementing the total.
      if (this.isResolved || isFinalResult) {
        this.totalQuestionsAnswered++;
        localStorage.totalQuestions = this.totalQuestionsAnswered;
        // A marked answer uses one of the day's free sums.
        if (this.trialApplies && !this.unlocked) this.sumsLeft = countSum();
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
  },
  mounted() {
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

    // The store is the authority on whether the full game is owned; the
    // remembered answer only covers the moment before it replies.
    if (canPurchase) {
      ownsFullGame().then((owned) => {
        if (owned !== null) this.setUnlockedQuietly(owned);
      });
      onFullGameChange((owned) => this.setUnlocked(owned));
    }

    // Get the first Play ready in the background.
    this.speech.warmUp();

    // A browser will not play sound before the first tap; the apps can, so on
    // a first launch there the robot explains the game by itself.
    if (isNativeApp && this.firstRun) {
      this.text = this.t('explainSpoken');
      this.isQuery = false;
      // Leaves a clean screen when the robot has finished explaining.
      this.clearAfterSpeak = true;
      this.speak();
    }
  },
  created() {
    // Not reactive: the engine holds SDK objects that Vue should not wrap.
    this.speech = createSpeech({ onLevel: (level) => { this.audioLevel = level; } });
    window.addEventListener('keydown', this.keyDownHandler);
  },
  unmounted() {
    stopMusic();
    this.stopIdleChat();
    clearTimeout(this.bubbleTimer);
    clearTimeout(this.rewardTimer);
    if (this.firstGesture) {
      window.removeEventListener('pointerdown', this.firstGesture);
      window.removeEventListener('keydown', this.firstGesture);
    }
    window.removeEventListener('keydown', this.keyDownHandler);
    this.speech.stopSpeaking();
    this.speech.stopListening();
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

/* The sum in figures ------------------------------------------------------- */
.sum-card {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 134px);
  left: 0;
  right: 0;
  z-index: 15;
  width: fit-content;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 10px 26px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 24px;
  background: rgba(16, 27, 61, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
  pointer-events: none;
}
.sum-figures {
  font-size: clamp(44px, 15vw, 68px);
  white-space: nowrap;
}
.sum-figures i {
  font-style: normal;
  color: #ffc62e;
}
.sum-answer {
  font-size: clamp(30px, 10vw, 44px);
}
.sum-answer b {
  display: inline-block;
  min-width: 1.4em;
  padding: 0 6px;
  text-align: center;
  color: #3fe07f;
  border-bottom: 4px dashed #3fe07f;
}
.sum-answer b.empty {
  color: rgba(255, 255, 255, 0.5);
  border-bottom-color: rgba(255, 255, 255, 0.35);
}

/* First run: the three steps as pictures ----------------------------------- */
.how-chips {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 150px);
  z-index: 18;
  width: fit-content;
  max-width: calc(100% - 24px);
  margin: 0 auto;
  padding: 0;
  display: flex;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.how-chips span {
  min-width: 84px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-radius: 16px;
  background: rgba(16, 27, 61, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
}
.how-chips ion-icon {
  font-size: 24px;
  color: #ffc62e;
}
.how-chips:focus-visible {
  outline: 3px solid #ffc62e;
  outline-offset: 4px;
  border-radius: 18px;
}

/* Available to assistive tech and crawlers, absent from the layout. Not
   display:none, which would remove it from the accessibility tree too. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
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
  /* The scroll container has 16px of padding all round, cancelled by the
     negative margin below. A plain 100% is therefore 32px short, which showed
     as a black strip under the scene on every screen. */
  height: calc(100% + 32px);
  margin: -16px;
  padding: 0;
  /* The sky's own colours, shown for the moment before the 3D scene has
     loaded. Without it the app opened on a white screen. */
  background: linear-gradient(#4a8be0, #8fb6ea 55%, #8a94a8 55%);
}

/* Responsive adjustments */
@media (max-width: 400px) {
  .bot-container {
    min-height: 300px;
  }

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

@media (min-width: 768px) {
  
  .bot-container {
    min-height: 400px;
  }

}

/* Respect a reduced-motion preference. This stops the decorative loops only -
   the correct/incorrect feedback, expression changes and state colours all
   still happen, because that is information, not decoration. */
@media (prefers-reduced-motion: reduce) {

  .toast-compact {
    transition: none;
  }

}
</style>