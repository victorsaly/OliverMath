<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Vocabulary Game V1.0</ion-title>
        <ion-chip slot="end">
          <ion-icon :icon="star" color="dark"></ion-icon>
          <ion-label>{{ stars }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    <ion-item v-show="false">
      <ion-label>Level</ion-label>
      <ion-select
        interface="popover"
        
        :value="selectedLevel"
        @ionChange="selectedLevel = $event.target.value"
      >
        <ion-select-option value="11+">11+</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item v-show="false">
      <ion-label>Operator</ion-label>
      <ion-select
        interface="popover"
        :value="selectedOperator"
        
        @ionChange="
          selectedOperator = $event.target.value;
          askQuestion;
        "
        >>
        <ion-select-option value="vocabulary">Vocabulary</ion-select-option>
        <ion-select-option value="synonyms">Synonyms</ion-select-option>
        <ion-select-option value="antonyms">Antonyms</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-content :fullscreen="true">
      <BotFace
        :botState="botState"
        :isPlayMode="isPlayMode"
        :text="speech_phrases"
        v-on:ask_question="askQuestion"
        @click="changeStatus('laughing')"
      />
    </ion-content>
    
      <ion-footer no-padding style="margin-bottom:5px;">
          <ion-button
          v-if="isPlayMode && botState != 'broken'"
          expand="full"
          @click="askQuestion"
          >Start new vocabulary</ion-button
        >
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
import axios from "axios";
import { star } from "ionicons/icons";
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
      typeText:[],
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
      text: "",
      selectedLevel: "11+",
      selectedOperator: "vocabulary",
      speech_phrases:
        "Click play, listen the word and respond with back by talking your answer.",
      synth: window.speechSynthesis,
      encourage_phases: [
        "Well done!",
        "Great work!",
        "Good job!",
        "Keep up the good work!",
        "You've really got this!",
      ],
      correct_phases: [
        "That's correct",
        "That's right",
        "That's true",
        "Flawless",
        "Perfect",
      ],
      incorrect_phases: [
        "Not quite",
        "Maybe next time",
        "I'm sure you can get the next one right",
        "Incorrect",
      ],
      voiceList: [],
      greetingSpeech: new window.SpeechSynthesisUtterance(),
      audioConfig: null,
      speechConfig: null,
      speechRecognizer: null,
      speechRecording: null,
      word:null,
      number1: 2,
      number2: 3,
      // eslint-disable-next-line no-undef
      token: null,
      tokenUrl: process.env.VUE_APP_TOKEN_URL,
      previousPosition: -1,
      stars: 0,
      isMicrophoneEnabled: false,
      publicPath: process.env.BASE_URL
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
      if (this.selectedOperator == "synonyms") {
        return this.number1 + this.number2;
      }
      if (this.selectedOperator == "antonyms") {
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
              //this.validateWord(typeText);
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

            if (self.selectedOperator == "vocabulary")
            {
              // step 1 find a randon word
              axios
              .get('https://localhost:7284/Vocabulary')
              .then((response) => {
                self.word = response.data[0];
                self.text =
              "What '" +
              self.word +
              "' means?";
              self.speak();
              })
              .catch(() => {
                self.isError = true;
                self.speech_phrases = "Server is unavailable.";
                self.showToast(this.speech_phrases, "danger");
              });
            }
          } else {
            self.speech_phrases = "microphone not available";
            self.isError = true;
            self.showToast("Microphone not available", "danger");
          }
        })
        .catch(function (e) {
          console.log("internal server error", e);
          self.isError = true;
          self.text = "internal error";
          self.showToast(self.text);
        });
    },
    /**
     * Shout at the user
     */
    speak() {
        if (!this.synth.speaking){
          this.greetingSpeech.text = this.text;
          this.synth.speak(this.greetingSpeech);
        }
    },
    listen() {
      this.showToast("Listening...", "warning");
      this.isComputing = true;
      this.isListening = false;
      var sc = SpeechConfig.fromAuthorizationToken(
        // eslint-disable-next-line no-undef
        this.token,
        "uksouth"
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
    async listenForSpeechRecordingEvents() {
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
        // self.validateSpeechRecording(e.result.text, false);
      };

      this.speechRecording.recognizeOnceAsync(
        async function (result) {
          await self.validateSpeechRecording(result.text, true);
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
          this.speech_phrases += word + " ";
        }
      };
    },
    async validateSpeechRecording(recordedText, isFinalResult) {
      let isSilent = recordedText == undefined ? true : false;
      // Perform type conversions.
      
      recordedText = String(
        recordedText == undefined ? "(silent)" : recordedText
      );

      if (isSilent && this.typeText.length >= 0)
      {
        // keep it silent
      }
      else
      {
        this.showToast("Your response is : " + recordedText, "secondary");
        // this.validateWord(recordedText);
      }

      //console.log('Correct anwser for:' + this.expectedResultAsNumber + ' => ' + recordedText + ' is ' + this.isResolved);

      if (isFinalResult)
      {
        let self = this;
        try {
          var res = await axios.get('https://localhost:7284/OpenAI?word=' + self.word + '&answer=' + recordedText);
          
          let aiResponse = res.data;
            if (aiResponse != null && aiResponse.includes('Yes'))
            {
              self.stars++;
                localStorage.stars = self.stars;
                self.text = aiResponse + "." +
                self.correct_phases[
                    Math.floor(Math.random() * self.correct_phases.length)
                  ] +
                  ", " +
                  self.encourage_phases[
                    Math.floor(Math.random() * self.encourage_phases.length)
                  ] +
                  "; You earned " +
                  self.stars +
                  " star" +
                  (self.stars == 1 ? "" : "s");
            } else {
              self.text =
              self.incorrect_phases[
                  Math.floor(Math.random() * self.incorrect_phases.length)
                ] +
                aiResponse +
                ".";
            }
            self.speak();
            self.isPlayMode = true;
        } catch {
          self.isError = true;
          self.speech_phrases = "Server is unavailable.";
          self.showToast(this.speech_phrases, "danger");
        }
      }
    },
    getWordAt(str, pos) {
      // Perform type conversions.
      str = String(str);
      pos = Number(pos) >>> 0;

      // console.log('previousPosition', this.previousPosition)
      if (this.previousPosition == pos) {
        this.isTalking = false;
        return "";
      }
      this.previousPosition = pos;

      // Search for the word's beginning and end.
      var left = str.slice(0, pos + 1).search(/\S+$/),
        right = str.slice(pos).search(/\s/);
      // The last word in the string is a special case.
      if (right < 0) {
        if (!this.isQuery) {
          this.isPlayMode = true;
        }
        this.isTalking = false;
        return str.slice(left);
      }

      // Return the word, using the located bounds to extract it from the string.
      return str.slice(left, right + pos);
    },
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  },
  mounted() {
    var self = this;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function () {
        self.isMicrophoneEnabled = true;
      })
      .catch(function () {
        console.log("No mic for you!");
      });

    this.listenForSpeechEvents();

    if (localStorage.stars) {
      this.stars = localStorage.stars;
    }

    axios
      .get(this.tokenUrl)
      .then((response) => {
        this.token = response.data;
      })
      .catch(() => {
        this.isError = true;
        this.speech_phrases = "Server is unavailable.";
        this.showToast(this.speech_phrases, "danger");
      });
  },
  setup() {
    return {
      star,
    };
  },
  created(){
    window.addEventListener('keydown', this.keyDownHandler)
  },
  unmounted() {
    window.removeEventListener('keydown', this.keyDownHandler)
  },
};
</script>