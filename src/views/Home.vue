<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Math Game</ion-title>
        <ion-chip slot="end" color="warning" aria-label="Stars earned">
          <ion-icon :icon="star" aria-hidden="true"></ion-icon>
          <ion-label>{{ stars }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding" role="main">
      <!-- Settings Card -->
      <ion-card class="settings-card">
        <ion-card-content>
          <ion-grid>
            <ion-row class="ion-align-items-center">
              <ion-col size="6">
                <ion-item lines="none" class="setting-item">
                  <ion-icon :icon="speedometerIcon" slot="start" color="primary"></ion-icon>
                  <ion-select
                    interface="popover"
                    :value="selectedLevel"
                    @ionChange="selectedLevel = $event.target.value"
                    label="Level"
                    label-placement="stacked"
                  >
                    <ion-select-option value="beginner">Beginner</ion-select-option>
                    <ion-select-option value="medium">Medium</ion-select-option>
                    <ion-select-option value="expert">Expert</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item lines="none" class="setting-item">
                  <ion-icon :icon="calculatorIcon" slot="start" color="secondary"></ion-icon>
                  <ion-select
                    interface="popover"
                    :value="selectedOperator"
                    @ionChange="selectedOperator = $event.target.value"
                    label="Operator"
                    label-placement="stacked"
                  >
                    <ion-select-option value="times">× Multiply</ion-select-option>
                    <ion-select-option value="plus">+ Addition</ion-select-option>
                    <ion-select-option value="minus">− Subtract</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Bot Container -->
      <div class="bot-container">
        <BotFace
          :botState="botState"
          :isPlayMode="isPlayMode"
          :text="speech_phrases"
          :audioLevel="audioLevel"
          v-on:ask_question="askQuestion"
          @click="changeStatus('laughing')"
          aria-live="polite"
        />
      </div>

      <!-- Status Indicator -->
      <div class="status-indicator" v-if="botState !== 'thinking'">
        <ion-chip :color="statusColor" outline>
          <ion-icon :icon="statusIcon" aria-hidden="true"></ion-icon>
          <ion-label>{{ statusText }}</ion-label>
        </ion-chip>
      </div>
    </ion-content>
    
    <ion-footer class="ion-no-border">
      <ion-toolbar>
        <ion-button
          v-if="isPlayMode && botState !== 'broken'"
          expand="block"
          size="large"
          @click="askQuestion"
          :disabled="isComputing"
          class="play-button"
          aria-label="Start a new math question"
        >
          <ion-icon :icon="playIcon" slot="start" v-if="!isComputing"></ion-icon>
          <ion-spinner name="crescent" v-if="isComputing"></ion-spinner>
          {{ isComputing ? 'Thinking...' : 'Play Math!' }}
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner
} from "@ionic/vue";
import BotFace from "@/components/BotFace.vue";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { star, play, speedometer, calculator, mic, volumeHigh, sync, alertCircle } from "ionicons/icons";
import { OPERATORS, LEVELS, NUMBER_RANGES, PHRASES } from "@/config/gameConfig";
import { getRandomInt, getRandomItem, formatStars, extractNumber } from "@/utils/helpers";
import { getSpeechToken, getCachedAudio } from "@/services/apiService";

export default {
  name: "Math",
  components: {
    BotFace,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonChip,
    IonLabel,
    IonIcon,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFooter,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner
  },
  setup() {
    return {
      star,
      playIcon: play,
      speedometerIcon: speedometer,
      calculatorIcon: calculator,
      micIcon: mic,
      volumeIcon: volumeHigh,
      syncIcon: sync,
      alertIcon: alertCircle
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
      speech_phrases: "Click play, listen the question and respond back by talking your answer.",
      number1: 2,
      number2: 3,
      stars: 0,
      previousPosition: -1,
      consecutiveCorrect: 0,
      
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
      } else if (this.isListening) {
        return "listening";
      } else if (this.isComputing) {
        return "computing";
      } else {
        return "thinking";
      }
    },
    expectedResultAsNumber() {
      if (this.selectedOperator == "plus") {
        return this.number1 + this.number2;
      }
      if (this.selectedOperator == "minus") {
        return this.number1 - this.number2;
      }
      return this.number1 * this.number2;
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
        case 'speaking': return 'Speaking...';
        case 'listening': return 'Listening...';
        case 'computing': return 'Processing...';
        case 'broken': return 'Error';
        case 'laughing': return 'Haha!';
        case 'happy': return 'Correct! 🎉';
        case 'sad': return 'Try again...';
        case 'excited': return 'Amazing!';
        case 'proud': return 'Great streak!';
        case 'surprised': return 'Wow!';
        case 'confused': return 'Hmm...';
        default: return 'Ready';
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
        } catch (e) {
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
      if (!this.isTalking) {
        this.audioLevel = 0;
        return;
      }
      
      const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
      this.audioAnalyser.getByteFrequencyData(dataArray);
      
      // Calculate average amplitude from frequency data
      // Focus on voice frequency range (roughly 80Hz - 3000Hz)
      const voiceStart = Math.floor(80 / (this.audioContext.sampleRate / this.audioAnalyser.fftSize));
      const voiceEnd = Math.floor(3000 / (this.audioContext.sampleRate / this.audioAnalyser.fftSize));
      
      let sum = 0;
      let count = 0;
      for (let i = voiceStart; i < Math.min(voiceEnd, dataArray.length); i++) {
        sum += dataArray[i];
        count++;
      }
      
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
    },
    changeStatus(status) {
      if (this.timeout) 
          if (status == "laughing"){
            var audio = new Audio(window.location.origin + this.$route.path + this.publicPath + 'assets/sound/laugh.wav');
            audio.play();
            this.isLaughing = true;
          }
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            this.isLaughing = false;
          }, 1500); // delay
    },
    keyDownHandler(e) {
      let value = e.key * 1;
      if (!isNaN(parseFloat(value)) && isFinite(value)){
        this.typeText.push(value);
        if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            if (this.typeText.length > 0){
              var typeText = this.typeText.join('');
              this.showToast("Your writing response is : " + typeText, "secondary");
              this.validateWord(typeText);
              this.typeText = [];
            }
          }, 400); // delay
      }
    },
    async showToast(text, color) {
      const toast = await toastController.create({
        message: text,
        duration: 5000,
        color: color,
        translucent: false,
        cssClass:"toast-custom-position",
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
            
            // Get number ranges from config
            const ranges = NUMBER_RANGES[self.selectedOperator]?.[self.selectedLevel] 
              || NUMBER_RANGES[OPERATORS.TIMES][LEVELS.BEGINNER];
            
            self.number1 = getRandomInt(ranges.min1, ranges.max1);
            self.number2 = getRandomInt(ranges.min2, ranges.max2);
            self.text = `What's ${self.number1} ${self.selectedOperator} ${self.number2}?`;
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
          // Use cached audio service for better performance
          const audio = await getCachedAudio(this.text);
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
      this.showToast("Listening...", "warning");
      this.isComputing = true;
      this.isListening = false;
      var sc = SpeechConfig.fromAuthorizationToken(
         
        this.token,
        this.speechRegion
      );
      sc.speechRecognitionLanguage = "en-GB";
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
     * Validate if the spoken/typed word matches the expected answer
     */
    validateWord(word) {
      if (!word || this.isResolved) return;
      
      const number = extractNumber(word);
      if (number !== null && number === this.expectedResultAsNumber) {
        this.isResolved = true;
      }
    },
    /**
     * Process speech recognition result
     */
    validateSpeechRecording(recordedText, isFinalResult) {
      const isSilent = recordedText === undefined;
      const displayText = isSilent ? "(silent)" : String(recordedText);

      if (!isSilent) {
        this.showToast(`Your response: ${displayText}`, "secondary");
        this.validateWord(recordedText);
      } else if (isFinalResult) {
        // Show confused when no speech detected
        this.showExpression('confused', 2000);
      }

      if (this.isResolved) {        
        this.stars++;
        this.consecutiveCorrect++;
        localStorage.stars = this.stars;
        const correct = getRandomItem(PHRASES.CORRECT);
        const encourage = getRandomItem(PHRASES.ENCOURAGEMENT);
        this.text = `${correct}, ${encourage}; You earned ${formatStars(this.stars)}.`;
        
        // Show expression based on streak
        if (this.consecutiveCorrect >= 5) {
          this.showExpression('excited', 3000);
        } else if (this.consecutiveCorrect >= 3) {
          this.showExpression('proud', 2500);
        } else {
          this.showExpression('happy', 2000);
        }
      } else if (isFinalResult) {
        this.consecutiveCorrect = 0;
        const incorrect = getRandomItem(PHRASES.INCORRECT);
        this.text = `${incorrect}, the correct answer is ${this.expectedResultAsNumber}.`;
        // Show sad for wrong answer, confused was already shown for silence
        if (!isSilent) {
          this.showExpression('sad', 2000);
        }
      }
      
      if (isFinalResult) {
        this.speak();
        this.isPlayMode = true;
      }
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

    // Load saved stars
    const savedStars = localStorage.getItem('stars');
    if (savedStars) {
      this.stars = parseInt(savedStars, 10) || 0;
    }

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
.settings-card {
  margin: 8px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.settings-card ion-card-content {
  padding: 8px;
}

.setting-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
}

.setting-item ion-icon {
  font-size: 24px;
  margin-right: 8px;
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
  margin: 16px 0;
}

.status-indicator ion-chip {
  font-size: 14px;
  padding: 8px 16px;
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
  .settings-card ion-grid ion-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .bot-container {
    min-height: 300px;
  }
}

@media (min-width: 768px) {
  .settings-card {
    max-width: 600px;
    margin: 16px auto;
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

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .settings-card {
    --background: var(--ion-color-step-100);
  }
}
</style>