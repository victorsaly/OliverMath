<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Speech Grammar 11+ Game V1.0</ion-title>
        <ion-chip slot="end">
          <ion-icon :icon="star" color="dark"></ion-icon>
          <ion-label>{{ stars }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    <ion-item>
      <ion-label>Test Type</ion-label>
      <ion-select
        interface="popover"
        :value="selectedLevel"
        @ionChange="selectedLevel = $event.target.value"
      >
        <ion-select-option value="word">Sentence to Word</ion-select-option>
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
      <div class="hintWord" v-if="isResolved == false && !isPlayMode">{{ hintWord }}</div>
    </ion-content>
    
      <ion-footer no-padding style="margin-bottom:5px;">
          <ion-button
          v-if="isPlayMode && botState != 'broken'"
          expand="full"
          @click="askQuestion"
          >Play</ion-button
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
      selectedLevel: "word",
      // selectedOperator: "times",
      speech_phrases:
        "Click play, listen the question and respond back by talking your answer.",
      synth: window.speechSynthesis,
      dictionary:[
        {
          words:["swindled", "swindle"],
          sentences:["Deceived someone to take their money or possessions"],          
          antonyms:["conned", "cheated", "cheat", "scammed", "dupe", "duped"],
          synonyms:[""]
        },
        {
          words:["absurd"],
          sentences:["Without any sense or reason", "Ridiculous, often in a humorous way"],
          antonyms:["nonsensical", "preposterous", "ludicrous", "silly", "comical", "foolish"],
          synonyms:["reasonable", "sensible", "normal", "logical", "rational"]
        },
        {
          words:["feign"],
          sentences:["To pretend to feel or think something"],
          antonyms:[],
          synonyms:["fake", "simulate"]
        },
        {
          words:["noxious"],
          sentences:["Poisonous or dangerous to living things"],
          antonyms:["false", "harmless", "innocuous"],
          synonyms:["harmful", "deadly", "toxic"]
        },
        {
          words:["turmoil"],
          sentences:["A state of disruption or confusion"],          
          synonyms:["chaos", "confusion", "unrest"],
          antonyms:["calm", "composure", "peace"]
        },
        {
          words:["threadbare"],
          sentences:["Looking old, thin or damaged due to being used a lot"],          
          synonyms:["warn", "tattered", "ragged", "frayed"],
          antonyms:["pristine", "immaculate", "unused"]
        },
        {
          words:["jocular"],
          sentences:["Cheerful and joking, usually making people laugh"],          
          synonyms:["jovial", "jolly", "droll", "comical", "playful"],
          antonyms:["serious", "solemn", "humorless"]
        },
        {
          words:["seldom"],
          sentences:["Almost never"],          
          synonyms:["rarely", "infrequently", "sporadically"],
          antonyms:["often", "frequently", "regularly"]
        },
        {
          words:["abundance"],
          sentences:["A large quantity or supplier of something"],          
          synonyms:["wealth", "mass", "profusion", "bounty"],
          antonyms:["shortage", "scarcity", "deficiency"]
        },
        {
          words:["vicinity"],
          sentences:["The area around a place"],          
          synonyms:["surroundings", "region", "district", "proximity"],
          antonyms:[]
        },
        {
          words:["quaint"],
          sentences:["Pleasantly old fashioned or unusual"],          
          synonyms:["charming", "antiquated", "whimsical"],
          antonyms:["modern", "contemporary", "ordinary"]
        },
        {
          words:["quench"],
          sentences:["To satisfy thirst or a desire", "To put out a fire or candle"],          
          synonyms:["assuage", "alleviate", "extinguish", "smother", "douse", "quell"],
          antonyms:["intensify", "exacerbate", "light", "start"]
        },
        {
          words:["asunder"],
          sentences:["Into pieces, usually by force"],          
          synonyms:["apart"],
          antonyms:[]
        },
        {
          words:["tedium"],
          sentences:["The state of being boring or bored"],          
          synonyms:["monotony", "boredom", "dullness"],
          antonyms:["excitement"]
        },
        {
          words:["inkling"],
          sentences:["A vague suspicion or idea about something"],          
          synonyms:["hunch", "notion", "suggestion", "hint", "whisper"],
          antonyms:[]
        },
        {
          words:["entice"],
          sentences:["To attract or tempt someone"],          
          synonyms:["allure", "invite", "persuade"],
          antonyms:["repel", "repulse", "discourage"]
        },
        {
          words:["elude"],
          sentences:["To avoid something or someone"],          
          synonyms:["evade", "dodge"],
          antonyms:["approach", "attract", "confront"]
        },
        {
          words:["wretched", "wretch"],
          sentences:["Unfortunate or in a bad situation", "Poor quality"],          
          synonyms:["pitiable", "miserable", "hopeless", "unhappy", "worthless", "pathetic", "terrible"],
          antonyms:["fortunate", "blessed", "excellent", "decent", "worthy"]
        },
        {
          words:["obstinate"],
          sentences:["Inflexible, despite persuasion or reason", "Difficult to move, remove or change"],          
          synonyms:["stubborn", "determined", "obdurate", "tenacious", "unyielding", "persistent"],
          antonyms:["complaint", "submissive", "amenable", "yielding", "unresisting", "pliant"]
        },
        {
          words:["procure"],
          sentences:["To gain possession of something, usually with effort or determination."],          
          synonyms:["obtain", "get", "acquire"],
          antonyms:["lose"]
        },
        {
          words:["placid"],
          sentences:["Calm and peaceful in nature or appearance"],          
          synonyms:["tranquil", "mild", "serene"],
          antonyms:["wild", "agitated", "turbulent", "stormy"]
        },
        {
          words:["uncouth"],
          sentences:["Rude or lacking decency"],          
          synonyms:["coarse", "vulgar", "boorish", "uncivilized"],
          antonyms:["polite", "dignified", "refined", "courteous"]
        },
        {
          words:["idyllic"],
          sentences:["Peaceful, safe and scenic"],          
          synonyms:["heavenly", "picturesque", "charming", "utopian"],
          antonyms:["hellish", "chaotic", "frightening", "appalling"]
        },
        {
          words:["remedy"],
          sentences:["A cure or resolution for something", "To cure or resolve something"],          
          synonyms:["antidote", "solution", "solve", "rectify"],
          antonyms:["worsen", "aggravate"]
        },
        {
          words:["flippant"],
          sentences:["Thoughtless and disrespectful in attitude"],          
          synonyms:["glib", "frivolous", "insincere"],
          antonyms:["respectful", "earnest", "sincere", "serious"]
        },
        {
          words:["divulge"],
          sentences:["To reveal something secret or private"],          
          synonyms:["disclose", "make known", "reveal"],
          antonyms:["conceal", "hide", "withhold"]
        },
        {
          words:["cumbersome"],
          sentences:["Heavy, large and difficult to move or use"],          
          synonyms:["unwieldy", "bulky", "awkward", "weighty"],
          antonyms:["manageable", "light", "practical", "compact"]
        },
        {
          words:["oppress"],
          sentences:["To treat cruelly and deprive of opportunities"],          
          synonyms:["exploit", "subjugate", "persecute", "maltreat", "torment", "burden", "daunt"],
          antonyms:["emancipate", "liberate", "comfort", "cheer", "calm"]
        },
        {
          words:["diligence"],
          sentences:["Thorough and careful effort"],          
          synonyms:["attentiveness", "assiduousness"],
          antonyms:["neglect", "inattention"]
        },
        {
          words:["contort"],
          sentences:["To twist or bend in an abnormal way"],          
          synonyms:["distort", "deform"],
          antonyms:["straighten", "uncoil"]
        },
        {
          words:["ostentatious"],
          sentences:["Excessively grand or luxurious, usually designed to impress"],          
          synonyms:["pretentious", "flamboyant", "extravagant"],
          antonyms:["understated", "modest", "conservative"]
        },
        {
          words:["barren"],
          sentences:["Having a dry and bare landscape that is unable to support life"],          
          synonyms:["desolate", "arid"],
          antonyms:["fertile", "lush"]
        },
        {
          words:["thwart"],
          sentences:["To stop someone succeeding at something"],          
          synonyms:["defeat", "hinder", "foil", "prevent"],
          antonyms:["aid", "help", "support"]
        },
        {
          words:["exquisite"],
          sentences:["Particularly beautiful or fine"],          
          synonyms:["gorgeous", "striking"],
          antonyms:["ugly", "imperfect", "unrefined"]
        },
        {
          words:["contradict"],
          sentences:["To suggest that something is wrong by offering an alternative idea or statement"],          
          synonyms:["refute", "dispute", "counter"],
          antonyms:["agree", "verify", "concur", "endorse"]
        },
        {
          words:["prominent"],
          sentences:["Important or significant", "Sticking out or standing out noticeably"],          
          synonyms:["leading", "distinguished", "notable", "obvious", "evident", "conspicuous"],
          antonyms:["Unimportant", "insignificant", "ordinary", "obscure", "inconspicuous"]
        },
        {
          words:["frugal"],
          sentences:["Careful not to spend much money or be wasteful in any way"],          
          synonyms:["thrifty", "economical"],
          antonyms:["wasteful", "extravagant", "lavish"]
        },
        {
          words:["discrepancy"],
          sentences:["A difference between things that should match"],          
          synonyms:["inconsistency", "disparity"],
          antonyms:["similarity", "resemblance"]
        },
        {
          words:["magnitude"],
          sentences:["Extreme size or scale"],          
          synonyms:["vastness", "immensity", "enormity", "importance", "weight", "eminence", "distinction"],
          antonyms:["smallness", "minuteness", "diminutiveness", "insignificance", "triviality"]
        },
        {
          words:["audition"],
          sentences:["A trial performance used to assess how suitable someone is for a role. E.g. in a play", "To take part in a trial performance to show how suitable you are for a role."],          
          synonyms:["reading", "tryout"],
          antonyms:[]
        }
      ],
      dictionarySelected: null,
      expectedResultAsValue: null,
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
      // eslint-disable-next-line no-undef
      tokenUrl: "https://olivermathapi.azurewebsites.net/api/token?code=C9h1wAidBXQfUAo9dYBaYgozqdLJdvmmEZqTiZJ2yqKuRl3QEowQaA==",
      previousPosition: -1,
      stars: 0,
      isMicrophoneEnabled: false,
      publicPath: process.env.BASE_URL
    };
  },
  computed: {
    hintWord() {
      var _hintWord = "";
      if (this.expectedResultAsValue != null && this.expectedResultAsValue.length > 0){
        var wordLength = this.expectedResultAsValue.length;
        const randomChar = Math.floor(Math.random() * wordLength);
        for (let index = 0; index < wordLength; index++) {
          if (index == randomChar || index == 0){
            _hintWord += this.expectedResultAsValue.charAt(index);
          } else {
            _hintWord += "_";
          }
          _hintWord += " ";
        }
      }

      return _hintWord;
    },
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
    }
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
            const random = Math.floor(Math.random() * self.dictionary.length);
            self.dictionarySelected = self.dictionary[random];

            if (self.selectedLevel == "word") {
              self.expectedResultAsValue = self.dictionarySelected.words[0];
              // apply the question based on the selected level.
              self.text = 'What word describes, "' + self.dictionarySelected.sentences[0] + '"?';
            }
            self.speak();
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
          var voices = this.synth.getVoices();
          console.log(voices);
          this.greetingSpeech.voice = voices[1];
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
    validateWord(word) {
      if (word == null || word == undefined || this.isResolved) {
        return;
      }

      if (word && word.length > 0){
        var cleanedWord = word.replace(/\W/g, "").toLowerCase().trim();

        if(this.selectedLevel=='word' && this.dictionarySelected.words.includes(cleanedWord)){
          //debugger;
          this.expectedResultAsValue = this.dictionarySelected.words[this.dictionarySelected.words.indexOf(cleanedWord)];
          this.isResolved = true;
        }
      }
      
      
      
      return;
      
    },
    validateSpeechRecording(recordedText, isFinalResult) {
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
        this.validateWord(recordedText);
      }

      // console.log('Correct anwser for:' + this.expectedResultAsNumber + ' => ' + recordedText + ' is ' + this.isResolved);

      if (this.isResolved){        
        this.stars++;
          localStorage.stars = this.stars;
          this.text =
            this.correct_phases[
              Math.floor(Math.random() * this.correct_phases.length)
            ] +
            ", " +
            this.encourage_phases[
              Math.floor(Math.random() * this.encourage_phases.length)
            ] +
            "; You earned " +
            this.stars +
            " star" +
            (this.stars == 1 ? "" : "s") +
            ".";
      } else if (isFinalResult == true) {
            this.text =
              this.incorrect_phases[
                Math.floor(Math.random() * this.incorrect_phases.length)
              ] +
              ", the correct answer is " +
              this.expectedResultAsValue +
              ".";
      }
      
      if (isFinalResult == true){
        this.speak();
        this.isPlayMode = true;
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
<style scoped>
.hintWord{
  text-align: center;
  font-size: 30px;
  padding: 40px;
  text-transform: capitalize;
}
</style>