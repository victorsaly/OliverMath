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
  toastController 
} from "@ionic/vue";
import BotFace from "@/components/BotFace.vue";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from "microsoft-cognitiveservices-speech-sdk";
// eslint-disable-next-line no-unused-vars
// import axios from 'axios';
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
    IonIcon
  },
  data() {
    return {
      isLoading: true,
      isTalking: false,
      isListening: false,
      isQuery: false,
      isPlayMode:true,
      text: "",
      speech_phrases: "",
      synth: window.speechSynthesis,
      voiceList: [],
      greetingSpeech: new window.SpeechSynthesisUtterance(),
      audioConfig: null,
      speechConfig: null,
      speechRecognizer: null,
      speechRecording: null,
      number1 : 2,
      number2 : 3,
      // eslint-disable-next-line no-undef
      token: token,
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
      } else {
        return "thinking";
      }
    },
    expectedResultAsNumber() {
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
       this.number2 = this.getRandomInt(1, 12);
       this.number1 = this.getRandomInt(1, 12);
       this.text = "What's " + this.number1 + " times " + this.number2 + "?";
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
      this.isListening = true;
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
      this.listenForSpeechRecordingEvents();
    },
    /**
     * React to speech recording events
     */
    listenForSpeechRecordingEvents() {
      const self = this;
      this.speechRecording.recognizeOnceAsync(
        function (result) {
          // console.log(result);
          // console.log('result recognizeOnceAsync', result);
          self.validateSpeechRecording(result.text);
          self.isListening = false;
          self.speechRecording.close();
          self.speechRecording = null;
        },
        function (err) {
          console.log('err recognizeOnceAsync', err);
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
          var word = this.getWordAt(this.text, e.charIndex);
          // console.log(word);
          if (word == "times") {
            word = "x";
          }
          this.speech_phrases += word + " ";
        }
      };
    },
    validateSpeechRecording(recordedText) {
      // Perform type conversions.
      recordedText = String(recordedText);
      
      this.showToast("Your response is : " + recordedText);

      if (recordedText != undefined && recordedText.length > 0) {
            var recordedTextAsNumber = recordedText.match(/\d/g);
            if (recordedTextAsNumber != undefined && recordedTextAsNumber.length > 0) {
                recordedTextAsNumber = recordedTextAsNumber.join("") * 1;
            }
            if (recordedTextAsNumber == this.expectedResultAsNumber) {
                this.stars++;
                this.text = "Correct, well done!."
            } else {
                this.text ='Incorrect, the correct answer is ' + this.expectedResultAsNumber + ".";
            }
           
        }else{
                this.text ='Not answer found.';
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

    // wait for voices to load
    // I can't get FF to work without calling this first
    // Chrome works on the onvoiceschanged function
    this.voiceList = this.synth.getVoices();

    if (this.voiceList.length) {
      this.isLoading = false;
    }

    this.synth.onvoiceschanged = () => {
      this.voiceList = this.synth.getVoices();
      // give a bit of delay to show loading screen
      // just for the sake of it, I suppose. Not the best reason
      setTimeout(() => {
        this.isLoading = false;
      }, 800);
    };
    this.listenForSpeechEvents();


  //    axios
  //  .post(
  //    'https://uksouth.api.cognitive.microsoft.com/sts/v1.0/issueToken',
  //    null,
  //    {
  //      headers: {
  //        "Ocp-Apim-Subscription-Key": "a66a133c602c4a4c9a4eec0735090e2c",
  //        "Content-Type": "application/json",
  //      }
  //    }
  //  )
  //  .then((response) => {
  //    console.log("Status text: " + response.status);
  //    console.log("Status text: " + response.statusText);
  //    console.log(response.data);
  //    this.token = response.data;
  //  })
  //  .catch((err) => {
  //    throw err;
  //  });
  },
  setup() {
    return {
      star, 
    }
  }
};
</script>