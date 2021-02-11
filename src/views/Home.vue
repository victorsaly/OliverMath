<template>
  <ion-page>
     <ion-header>
      <ion-toolbar>
        <ion-title>Math Game</ion-title>
        <ion-chip slot="end">
          <ion-icon :icon="star" color="dark"></ion-icon>
          <ion-label>{{stars}}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    <ion-item>
          <ion-label>Level</ion-label>
          <ion-select interface="popover" :value="selectedLevel" @ionChange="selectedLevel=$event.target.value">
            <ion-select-option value="beginner">Beginners</ion-select-option>
            <ion-select-option value="medium">Medium</ion-select-option>
            <ion-select-option value="expert">Expert</ion-select-option>
          </ion-select>
    </ion-item>
    <ion-item>
          <ion-label>Operator</ion-label>
          <ion-select interface="popover" :value="selectedOperator" @ionChange="selectedOperator=$event.target.value; askQuestion">>
            <ion-select-option value="times">multiply (x)</ion-select-option>
            <ion-select-option value="plus">Addition (+)</ion-select-option>
            <ion-select-option value="minus">Substraction (-)</ion-select-option>
          </ion-select>
    </ion-item>
    <ion-content :fullscreen="true">
      <BotFace :botState="botState" :isPlayMode="isPlayMode" :text="speech_phrases" v-on:ask_question="askQuestion" />
    </ion-content>
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
  IonSelectOption
} from "@ionic/vue";
import BotFace from "@/components/BotFace.vue";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
  PhraseListGrammar
} from "microsoft-cognitiveservices-speech-sdk";
import axios from 'axios';
import { star } from 'ionicons/icons';
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
    IonSelectOption
  },
  data() {
    return {
      isLoading: true,
      isTalking: false,
      isListening: false,
      isComputing: false,
      isQuery: false,
      isPlayMode:true,
      text: "",
      selectedLevel:"beginner",
      selectedOperator:"times",
      speech_phrases: "",
      synth: window.speechSynthesis,
      encourage_phases:["Well done!","Great work!","Good job!", "Keep up the good work!", "You've really got this!"],
      correct_phases:["That's correct","That's right","That's true", "Flawless", "Perfect"],
      incorrect_phases:["Not quite","Maybe next try","I'm sure you can get the next one right", "Incorrect"],
      voiceList: [],
      greetingSpeech: new window.SpeechSynthesisUtterance(),
      audioConfig: null,
      speechConfig: null,
      speechRecognizer: null,
      speechRecording: null,
      number1 : 2,
      number2 : 3,
      // eslint-disable-next-line no-undef
      token: null,
      tokenUrl: process.env.VUE_APP_TOKEN_URL,
      previousPosition: -1,
      stars: 0,
    };
  },
  computed: {
    botState() {
      if (this.isTalking) {
        return "speaking";
      } else if (this.isListening) {
        return "listening";
      } else if (this.isComputing) {
        return "computing";
      }
      else {
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
    }
  },
  methods: {
    
    async showToast(text) {
      const toast = await toastController
        .create({
          message: text,
          duration: 50000,
          color: "secondary",
          translucent: true
        })
      return toast.present();
    },
    askQuestion(){
       this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
       this.isQuery = true;
       this.isPlayMode = false;
       this.speech_phrases = "";
       var min1 = 1;
       var max1 = 12;
       var min2 = 1;
       var max2 = 12;
       if (this.selectedOperator == "plus")
       {
         max1 = 50;
         max2 = 50;

         if (this.selectedLevel == "medium"){
            max1 = 100;
            max2 = 100;
         }

         if (this.selectedLevel == "expert"){
            max1 = 1000;
            max2 = 1000;
         }
            
       }

       if (this.selectedOperator == "minus")
       {
          min1 = 10;
          max1 = 20;
          min2 = 1;
          max2 = 10; 

          if (this.selectedLevel == "medium"){
            min1 = 20;
            max1 = 100;
            min2 = 1;
            max2 = 20;   
          }

         if (this.selectedLevel == "expert"){
            min1 = 100;
            max1 = 500;
            min2 = 1;
            max2 = 100;
         }
       }

       if (this.selectedOperator == "times")
       {
          
          if (this.selectedLevel == "medium"){
            min1 = 3;
            max1 = 12;
            min2 = 3;
            max2 = 12;  
          }

         if (this.selectedLevel == "expert"){
            min1 = 5;
            max1 = 20;
            min2 = 5;
            max2 = 20; 
         }
       }
       this.number1 = this.getRandomInt(min1, max1);
       this.number2 = this.getRandomInt(min2, max2);
       
       
       this.text = "What's " + this.number1 + " " + this.selectedOperator + " " + this.number2 + "?";
       this.speak();
    },
    /**
     * Shout at the user
     */
    speak() {
      this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();     
      // it should be 'craic', but it doesn't sound right
      this.greetingSpeech.text = this.text;
      // this.greetingSpeech.voice = this.voiceList.filter(s => s.name.includes('Male'))[0]
      this.synth.speak(this.greetingSpeech);
    },
    listen() {
      this.showToast("Connecting...", "warning");
      this.isComputing = true;
      this.isListening = false;
      this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
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

      var phraseListGrammar = PhraseListGrammar.fromRecognizer(this.speechRecording);
      phraseListGrammar.addPhrase(String(this.expectedResultAsNumber));
      this.listenForSpeechRecordingEvents();
    },
    /**
     * React to speech recording events
     */
    listenForSpeechRecordingEvents() {
      const self = this;

      // Signals that a new session has started with the speech service
      this.speechRecording.speechStartDetected = function () {
        console.log('speechStartDetected');
          self.showToast("I'm Listening", "success");
          self.isListening = true;
          self.isComputing = false;
      };
      
      this.speechRecording.recognizeOnceAsync(
        function (result) {
          self.validateSpeechRecording(result.text);
          self.isListening = false;
          self.isComputing = false;
          self.speechRecording.close();
          self.speechRecording = null;
        },
        function (err) {
          console.log('err recognizeOnceAsync', err);
          self.isListening = false;
          self.isComputing = false;
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
        // console.log(
        //   e.name + " onstart reached after " + e.elapsedTime + " milliseconds."
        // );
        this.isTalking = true;
      };

      this.greetingSpeech.onend = () => {
        // console.log(
        //   e.name + " onend reached after " + e.elapsedTime + " milliseconds."
        // );
        this.isTalking = false;   
        if (this.isQuery){
           this.isQuery = false;
           this.listen();
        }
      };

      this.greetingSpeech.onboundary = (e) => {
        // console.log('boundary', e);

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
    validateSpeechRecording(recordedText) {
      // Perform type conversions.
      recordedText = String(recordedText == undefined ? '(silent)' : recordedText);
      
      this.showToast("Your response is : " + recordedText, "secondary");

      if (recordedText != undefined && recordedText.length > 0) {
            var recordedTextAsNumber = recordedText.match(/\d/g);
            if (recordedTextAsNumber != undefined && recordedTextAsNumber.length > 0) {
                recordedTextAsNumber = recordedTextAsNumber.join("") * 1;
            }
            if (recordedTextAsNumber == this.expectedResultAsNumber) {
                this.stars++;
                localStorage.stars = this.stars;
                this.text = this.correct_phases[Math.floor(Math.random()*this.correct_phases.length)] + ", " + this.encourage_phases[Math.floor(Math.random()*this.encourage_phases.length)] + "; You earned " + this.stars + " star" + (this.stars == 1 ? "" : "s") + "."
            } else {
                this.text = this.incorrect_phases[Math.floor(Math.random()*this.incorrect_phases.length)] + ', the correct answer is ' + this.expectedResultAsNumber + ".";
            }
           
        }else{
                this.text ='Not answer found.';
                this.showToast("Not answer found.", "danger");
        }
        this.greetingSpeech.text = this.text;
        this.synth.speak(this.greetingSpeech);
    },
    getWordAt(str, pos) {
      // Perform type conversions.
      str = String(str);
      pos = Number(pos) >>> 0;

      // console.log('previousPosition', this.previousPosition)
      if (this.previousPosition == pos){
        this.isTalking = false;
        return "";
      }
      this.previousPosition = pos;

      // Search for the word's beginning and end.
      var left = str.slice(0, pos + 1).search(/\S+$/),
        right = str.slice(pos).search(/\s/);
      // The last word in the string is a special case.
      if (right < 0) {
        if (!this.isQuery){
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
    }
  },
  mounted() {

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function() {
        console.log('You let me use your mic!')
      })
      .catch(function() {
        console.log('No mic for you!')
      });

    
    this.listenForSpeechEvents();

    if (localStorage.stars) {
      this.stars = localStorage.stars;
    }

    axios.get(this.tokenUrl).then((response) => {      
        this.token = response.data;
    });
  },
  setup() {
    return {
      star, 
    }
  }
};
</script>