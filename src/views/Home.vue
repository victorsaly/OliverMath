<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Math Game</ion-title>
        <ion-chip slot="end" aria-label="Stars earned">
          <ion-icon :icon="star" color="warning" aria-hidden="true"></ion-icon>
          <ion-label>{{ stars }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    <ion-item>
      <ion-label id="level-label">Difficulty</ion-label>
      <ion-select
        interface="popover"
        :value="selectedLevel"
        @ionChange="selectedLevel = $event.target.value"
        aria-labelledby="level-label"
      >
        <ion-select-option value="beginner">Beginner</ion-select-option>
        <ion-select-option value="medium">Medium</ion-select-option>
        <ion-select-option value="expert">Expert</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label id="operator-label">Operator</ion-label>
      <ion-select
        interface="popover"
        :value="selectedOperator"
        @ionChange="selectedOperator = $event.target.value"
        aria-labelledby="operator-label"
      >
        <ion-select-option value="times">Multiply (×)</ion-select-option>
        <ion-select-option value="plus">Addition (+)</ion-select-option>
        <ion-select-option value="minus">Subtraction (−)</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-content :fullscreen="true" role="main">
      <BotFace
        :botState="botState"
        :isPlayMode="isPlayMode"
        :text="speech_phrases"
        v-on:ask_question="askQuestion"
        @click="changeStatus('laughing')"
        aria-live="polite"
      />
    </ion-content>
    
    <ion-footer no-padding style="margin-bottom:5px;">
      <ion-button
        v-if="isPlayMode && botState !== 'broken'"
        expand="full"
        @click="askQuestion"
        :disabled="isComputing"
        aria-label="Start a new math question"
      >
        {{ isComputing ? 'Loading...' : 'Play Math' }}
      </ion-button>
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
  IonFooter
} from "@ionic/vue";
import BotFace from "@/components/BotFace.vue";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { star } from "ionicons/icons";
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
    IonFooter
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
      
      // Game state
      text: "",
      selectedLevel: LEVELS.MEDIUM,
      selectedOperator: OPERATORS.TIMES,
      speech_phrases: "Click play, listen the question and respond back by talking your answer.",
      number1: 2,
      number2: 3,
      stars: 0,
      previousPosition: -1,
      
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
      
      // Config
      isMicrophoneEnabled: false,
      publicPath: import.meta.env.BASE_URL,
      timeout: null,
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
  },
  methods: {
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
          
          audio.onended = () => {
            this.isTalking = false;
            // Trigger listening after speech ends
            if (this.isQuery) {
              this.isQuery = false;
              this.listen();
            }
          };
          
          audio.onerror = () => {
            this.isTalking = false;
            this.speakWithBrowser();
          };
          
          await audio.play();
          
        } catch (error) {
          console.error('Azure TTS error:', error);
          this.isTalking = false;
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
      }

      if (this.isResolved) {        
        this.stars++;
        localStorage.stars = this.stars;
        const correct = getRandomItem(PHRASES.CORRECT);
        const encourage = getRandomItem(PHRASES.ENCOURAGEMENT);
        this.text = `${correct}, ${encourage}; You earned ${formatStars(this.stars)}.`;
      } else if (isFinalResult) {
        const incorrect = getRandomItem(PHRASES.INCORRECT);
        this.text = `${incorrect}, the correct answer is ${this.expectedResultAsNumber}.`;
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
  setup() {
    return {
      star,
    };
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
    // Clear any pending timeouts
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
};
</script>