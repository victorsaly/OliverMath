(function(){var e={379:function(e,t,n){var i={"./ion-action-sheet.entry.js":[8451,8451],"./ion-alert.entry.js":[8550,8550],"./ion-app_8.entry.js":[1006,1006],"./ion-avatar_3.entry.js":[9169,9169],"./ion-back-button.entry.js":[9112,9112],"./ion-backdrop.entry.js":[9389,9389],"./ion-button_2.entry.js":[7733,7733],"./ion-card_5.entry.js":[2011,2011],"./ion-checkbox.entry.js":[3562,3562],"./ion-chip.entry.js":[2185,2185],"./ion-col_3.entry.js":[7478,7478],"./ion-datetime_3.entry.js":[9440,9440],"./ion-fab_3.entry.js":[6608,6608],"./ion-img.entry.js":[8014,8014],"./ion-infinite-scroll_2.entry.js":[6270,6270],"./ion-input.entry.js":[2865,2865],"./ion-item-option_3.entry.js":[964,964],"./ion-item_8.entry.js":[7419,7419],"./ion-loading.entry.js":[9740,9740],"./ion-menu_3.entry.js":[9936,9936],"./ion-modal.entry.js":[3731,3731],"./ion-nav_2.entry.js":[4288,4288],"./ion-popover.entry.js":[6560,6560],"./ion-progress-bar.entry.js":[5051,5051],"./ion-radio_2.entry.js":[2932,2932],"./ion-range.entry.js":[6074,6074],"./ion-refresher_2.entry.js":[8290,8290],"./ion-reorder_2.entry.js":[3479,3479],"./ion-ripple-effect.entry.js":[4905,4905],"./ion-route_4.entry.js":[5095,5095],"./ion-searchbar.entry.js":[7421,2880],"./ion-segment_2.entry.js":[3806,3806],"./ion-select_3.entry.js":[6306,7421],"./ion-slide_2.entry.js":[4208,4208],"./ion-spinner.entry.js":[3046,3046],"./ion-split-pane.entry.js":[4774,4774],"./ion-tab-bar_2.entry.js":[3196,3196],"./ion-tab_2.entry.js":[3965,3965],"./ion-text.entry.js":[2516,2516],"./ion-textarea.entry.js":[2117,2117],"./ion-toast.entry.js":[4617,4617],"./ion-toggle.entry.js":[9125,9125],"./ion-virtual-scroll.entry.js":[9480,9480]};function o(e){if(!n.o(i,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=i[e],o=t[0];return n.e(t[1]).then((function(){return n(o)}))}o.keys=function(){return Object.keys(i)},o.id=379,e.exports=o},1246:function(e,t,n){"use strict";var i=n(9963),o=n(6252);function r(e,t,n,i,r,s){const a=(0,o.up)("ion-router-outlet"),c=(0,o.up)("ion-app");return(0,o.wg)(),(0,o.j4)(c,null,{default:(0,o.w5)((()=>[(0,o.Wm)(a)])),_:1})}var s=n(4800),a=(0,o.aZ)({name:"App",components:{IonApp:s.dr,IonRouterOutlet:s.jP}}),c=n(3744);const u=(0,c.Z)(a,[["render",r]]);var l=u,d=n(1089),h=n(3577);const p=(0,o.Uk)("Math Game V1.0.7"),f=(0,o.Uk)("Level"),g=(0,o.Uk)("Beginners"),v=(0,o.Uk)("Medium"),m=(0,o.Uk)("Expert"),b=(0,o.Uk)("Operator"),y=(0,o.Uk)("> "),w=(0,o.Uk)("multiply (x)"),_=(0,o.Uk)("Addition (+)"),k=(0,o.Uk)("Substraction (-)"),j=(0,o.Uk)("Play Math");function M(e,t,n,i,r,s){const a=(0,o.up)("ion-title"),c=(0,o.up)("ion-icon"),u=(0,o.up)("ion-label"),l=(0,o.up)("ion-chip"),d=(0,o.up)("ion-toolbar"),M=(0,o.up)("ion-header"),x=(0,o.up)("ion-select-option"),O=(0,o.up)("ion-select"),S=(0,o.up)("ion-item"),T=(0,o.up)("BotFace"),C=(0,o.up)("ion-content"),R=(0,o.up)("ion-button"),E=(0,o.up)("ion-footer"),I=(0,o.up)("ion-page");return(0,o.wg)(),(0,o.j4)(I,null,{default:(0,o.w5)((()=>[(0,o.Wm)(M,null,{default:(0,o.w5)((()=>[(0,o.Wm)(d,null,{default:(0,o.w5)((()=>[(0,o.Wm)(a,null,{default:(0,o.w5)((()=>[p])),_:1}),(0,o.Wm)(l,{slot:"end"},{default:(0,o.w5)((()=>[(0,o.Wm)(c,{icon:i.star,color:"dark"},null,8,["icon"]),(0,o.Wm)(u,null,{default:(0,o.w5)((()=>[(0,o.Uk)((0,h.zw)(r.stars),1)])),_:1})])),_:1})])),_:1})])),_:1}),(0,o.Wm)(S,null,{default:(0,o.w5)((()=>[(0,o.Wm)(u,null,{default:(0,o.w5)((()=>[f])),_:1}),(0,o.Wm)(O,{interface:"popover",value:r.selectedLevel,onIonChange:t[0]||(t[0]=e=>r.selectedLevel=e.target.value)},{default:(0,o.w5)((()=>[(0,o.Wm)(x,{value:"beginner"},{default:(0,o.w5)((()=>[g])),_:1}),(0,o.Wm)(x,{value:"medium"},{default:(0,o.w5)((()=>[v])),_:1}),(0,o.Wm)(x,{value:"expert"},{default:(0,o.w5)((()=>[m])),_:1})])),_:1},8,["value"])])),_:1}),(0,o.Wm)(S,null,{default:(0,o.w5)((()=>[(0,o.Wm)(u,null,{default:(0,o.w5)((()=>[b])),_:1}),(0,o.Wm)(O,{interface:"popover",value:r.selectedOperator,onIonChange:t[1]||(t[1]=e=>{r.selectedOperator=e.target.value,s.askQuestion})},{default:(0,o.w5)((()=>[y,(0,o.Wm)(x,{value:"times"},{default:(0,o.w5)((()=>[w])),_:1}),(0,o.Wm)(x,{value:"plus"},{default:(0,o.w5)((()=>[_])),_:1}),(0,o.Wm)(x,{value:"minus"},{default:(0,o.w5)((()=>[k])),_:1})])),_:1},8,["value"])])),_:1}),(0,o.Wm)(C,{fullscreen:!0},{default:(0,o.w5)((()=>[(0,o.Wm)(T,{botState:s.botState,isPlayMode:r.isPlayMode,text:r.speech_phrases,onAsk_question:s.askQuestion},null,8,["botState","isPlayMode","text","onAsk_question"])])),_:1}),(0,o.Wm)(E,{"no-padding":""},{default:(0,o.w5)((()=>[r.isPlayMode&&"broken"!=s.botState?((0,o.wg)(),(0,o.j4)(R,{key:0,expand:"full",onClick:s.askQuestion},{default:(0,o.w5)((()=>[j])),_:1},8,["onClick"])):(0,o.kq)("",!0)])),_:1})])),_:1})}const x={class:"bubble speech"},O=(0,o.uE)('<div id="head" data-v-10695c54><div id="left-ear" data-v-10695c54><div id="left-ear-inner" data-v-10695c54></div></div><div id="face" data-v-10695c54><div id="eyes" data-v-10695c54><div id="left-eye" data-v-10695c54></div><div id="right-eye" data-v-10695c54></div></div><div id="mouth" data-v-10695c54></div></div><div id="right-ear" data-v-10695c54><div id="right-ear-inner" data-v-10695c54></div></div></div>',1);function S(e,t,n,i,r,s){return(0,o.wg)(),(0,o.iD)("div",{id:"bot",class:(0,h.C_)(n.botState)},[(0,o._)("p",x,(0,h.zw)(n.text),1),O],2)}var T={name:"BotFace",props:{botState:{type:String,default:"neutral"},text:{type:String,default:""},isPlayMode:{type:Boolean,default:!0}}};const C=(0,c.Z)(T,[["render",S],["__scopeId","data-v-10695c54"]]);var R=C,E=n(4526),I=n(7345),W=n(6836),L=n(9669),P=n.n(L),U=n(8903),A={name:"Math",components:{BotFace:R,IonHeader:s.Gu,IonToolbar:s.sr,IonTitle:s.wd,IonContent:s.W2,IonPage:s._i,IonChip:s.hM,IonLabel:s.Q$,IonIcon:s.gu,IonItem:s.Ie,IonSelect:s.t9,IonSelectOption:s.n0,IonButton:s.YG,IonFooter:s.fr},data(){return{typeText:[],isLoading:!0,isTalking:!1,isListening:!1,isComputing:!1,isError:!1,isQuery:!1,isPlayMode:!0,isResolved:!1,text:"",selectedLevel:"beginner",selectedOperator:"times",speech_phrases:"Click play, listen the question and respond back by talking your answer.",synth:window.speechSynthesis,encourage_phases:["Well done!","Great work!","Good job!","Keep up the good work!","You've really got this!"],correct_phases:["That's correct","That's right","That's true","Flawless","Perfect"],incorrect_phases:["Not quite","Maybe next time","I'm sure you can get the next one right","Incorrect"],voiceList:[],greetingSpeech:new window.SpeechSynthesisUtterance,audioConfig:null,speechConfig:null,speechRecognizer:null,speechRecording:null,number1:2,number2:3,token:null,tokenUrl:"https://olivermathapi.azurewebsites.net/api/token?code=C9h1wAidBXQfUAo9dYBaYgozqdLJdvmmEZqTiZJ2yqKuRl3QEowQaA==",previousPosition:-1,stars:0,isMicrophoneEnabled:!1}},computed:{botState(){return this.isError?"broken":this.isTalking?"speaking":this.isListening?"listening":this.isComputing?"computing":"thinking"},expectedResultAsNumber(){return"plus"==this.selectedOperator?this.number1+this.number2:"minus"==this.selectedOperator?this.number1-this.number2:this.number1*this.number2}},methods:{keyDownHandler(e){let t=1*e.key;!isNaN(parseFloat(t))&&isFinite(t)&&(this.typeText.push(t),this.timeout&&clearTimeout(this.timeout),this.timeout=setTimeout((()=>{if(this.typeText.length>0){var e=this.typeText.join("");this.showToast("Your writing response is : "+e,"secondary"),this.validateWord(e),this.typeText=[]}}),400))},async showToast(e,t){const n=await s.Mn.create({message:e,duration:5e3,color:t,translucent:!0});return n.present()},async enableMicrophone(){var e=this;this.isMicrophoneEnabled||(e.speech_phrases="enabling microphone..",e.isMicrophoneEnabled=!0,await navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then((function(t){e.audioConfig=E.rU.fromMicrophoneInput(t.id),e.speech_phrases="microphone enabled"})).catch((function(){e.speech_phrases="microphone disabled",e.isError=!0,e.showToast("Microphone disabled","danger"),e.isMicrophoneEnabled=!1})))},async askQuestion(){this.audioConfig=E.rU.fromDefaultMicrophoneInput(),this.isResolved=!1;var e=this;this.isComputing=!0,await this.enableMicrophone().then((function(){if(e.isMicrophoneEnabled){e.isComputing=!1,e.isQuery=!0,e.isPlayMode=!1,e.speech_phrases="";var t=1,n=12,i=1,o=12;"plus"==e.selectedOperator&&(n=50,o=50,"medium"==e.selectedLevel&&(n=100,o=100),"expert"==e.selectedLevel&&(n=1e3,o=1e3)),"minus"==e.selectedOperator&&(t=10,n=20,i=1,o=10,"medium"==e.selectedLevel&&(t=20,n=100,i=1,o=20),"expert"==e.selectedLevel&&(t=100,n=500,i=1,o=100)),"times"==e.selectedOperator&&("medium"==e.selectedLevel&&(t=3,n=12,i=3,o=12),"expert"==e.selectedLevel&&(t=5,n=20,i=5,o=20)),e.number1=e.getRandomInt(t,n),e.number2=e.getRandomInt(i,o),e.text="What's "+e.number1+" "+e.selectedOperator+" "+e.number2+"?",e.speak()}else e.speech_phrases="microphone not available",e.isError=!0,e.showToast("Microphone not available","danger")})).catch((function(t){console.log("internal server error",t),e.isError=!0,e.text="internal error",e.showToast(e.text)}))},speak(){this.synth.speaking||(this.greetingSpeech.text=this.text,this.greetingSpeech.volume<0&&(this.speech_phrases=this.text),this.synth.speak(this.greetingSpeech))},listen(){this.showToast("Connecting...","warning"),this.isComputing=!0,this.isListening=!1;var e=I.c.fromAuthorizationToken(this.token,"uksouth");e.speechRecognitionLanguage="en-GB",this.speechConfig=e,this.speechRecording=new W.F(this.speechConfig,this.audioConfig),this.listenForSpeechRecordingEvents()},listenForSpeechRecordingEvents(){const e=this;this.speechRecording.speechStartDetected=function(){console.log("speechStartDetected"),e.showToast("I'm Listening","success"),e.isListening=!0,e.isComputing=!1},this.speechRecording.recognizing=function(t,n){window.console.log("recognizing ",n.result.text),e.validateSpeechRecording(n.result.text,!1)},this.speechRecording.recognizeOnceAsync((function(t){e.validateSpeechRecording(t.text,!0),e.isListening=!1,e.isComputing=!1,e.speechRecording.close(),e.speechRecording=null}),(function(t){console.log("err recognizeOnceAsync",t),e.showToast("Unable to connect to the server.","danger"),e.isListening=!1,e.isComputing=!1,e.isQuery=!1,e.isError=!0,e.text="Unable to recognized the voice. Internal error",e.showToast(e.text),e.speechRecording.close(),e.speechRecording=null}))},listenForSpeechEvents(){this.greetingSpeech.onstart=()=>{this.isTalking=!0},this.greetingSpeech.onend=()=>{this.isTalking=!1,this.isQuery&&(this.isQuery=!1,this.listen())},this.greetingSpeech.onerror=e=>{console.log("error",e)},this.greetingSpeech.onboundary=e=>{if("word"==e.name){var t=this.getWordAt(this.text,e.charIndex).toLowerCase();"times"==t&&(t="x"),"plus"==t&&(t="+"),"minus"==t&&(t="-"),this.speech_phrases+=t+" "}}},validateWord(e){if(null!=e&&void 0!=e&&!this.isResolved){var t=e.match(/\d+/);if(t){var n=String(this.expectedResultAsNumber)==String(e.match(/\d+/)[0]);!this.isResolved&&n&&(this.isResolved=!0)}}},validateSpeechRecording(e,t){let n=void 0==e;e=String(void 0==e?"(silent)":e),n&&this.typeText.length>=0||(this.showToast("Your response is : "+e,"secondary"),this.validateWord(e)),console.log("Correct anwser for:"+this.expectedResultAsNumber+" => "+e+" is "+this.isResolved),this.isResolved?(this.stars++,localStorage.stars=this.stars,this.text=this.correct_phases[Math.floor(Math.random()*this.correct_phases.length)]+", "+this.encourage_phases[Math.floor(Math.random()*this.encourage_phases.length)]+"; You earned "+this.stars+" star"+(1==this.stars?"":"s")+"."):1==t&&(this.text=this.incorrect_phases[Math.floor(Math.random()*this.incorrect_phases.length)]+", the correct answer is "+this.expectedResultAsNumber+"."),1==t&&(this.speak(),this.isPlayMode=!0)},getWordAt(e,t){if(e=String(e),t=Number(t)>>>0,this.previousPosition==t)return this.isTalking=!1,"";this.previousPosition=t;var n=e.slice(0,t+1).search(/\S+$/),i=e.slice(t).search(/\s/);return i<0?(this.isQuery||(this.isPlayMode=!0),this.isTalking=!1,e.slice(n)):e.slice(n,i+t)},getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}},mounted(){var e=this;navigator.mediaDevices.getUserMedia({audio:!0}).then((function(){e.isMicrophoneEnabled=!0})).catch((function(){console.log("No mic for you!")})),this.listenForSpeechEvents(),localStorage.stars&&(this.stars=localStorage.stars),P().get(this.tokenUrl).then((e=>{this.token=e.data})).catch((()=>{this.isError=!0,this.speech_phrases="Server is unavailable.",this.showToast(this.speech_phrases,"danger")}))},setup(){return{star:U.h_b}},created(){window.addEventListener("keydown",this.keyDownHandler)},unmounted(){window.removeEventListener("keydown",this.keyDownHandler)}};const F=(0,c.Z)(A,[["render",M]]);var N=F;const Q=[{path:"/",name:"Home",component:N}],z=(0,d.p7)({history:(0,d.PO)("/OliverMath/"),routes:Q});var D=z;const B=(0,i.ri)(l).use(s.oX).use(D);D.isReady().then((()=>{B.mount("#app")}))},3339:function(){},3108:function(){},8275:function(){},2505:function(){},146:function(){},173:function(){},1137:function(){},592:function(){}},t={};function n(i){var o=t[i];if(void 0!==o)return o.exports;var r=t[i]={exports:{}};return e[i](r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,i,o,r){if(!i){var s=1/0;for(l=0;l<e.length;l++){i=e[l][0],o=e[l][1],r=e[l][2];for(var a=!0,c=0;c<i.length;c++)(!1&r||s>=r)&&Object.keys(n.O).every((function(e){return n.O[e](i[c])}))?i.splice(c--,1):(a=!1,r<s&&(s=r));if(a){e.splice(l--,1);var u=o();void 0!==u&&(t=u)}}return t}r=r||0;for(var l=e.length;l>0&&e[l-1][2]>r;l--)e[l]=e[l-1];e[l]=[i,o,r]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){var e,t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__};n.t=function(i,o){if(1&o&&(i=this(i)),8&o)return i;if("object"===typeof i&&i){if(4&o&&i.__esModule)return i;if(16&o&&"function"===typeof i.then)return i}var r=Object.create(null);n.r(r);var s={};e=e||[null,t({}),t([]),t(t)];for(var a=2&o&&i;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((function(e){s[e]=function(){return i[e]}}));return s["default"]=function(){return i},n.d(r,s),r}}(),function(){n.d=function(e,t){for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,i){return n.f[i](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+({2214:"polyfills-core-js",6748:"polyfills-dom"}[e]||e)+"."+{964:"ab107c4a",1006:"bc4433f8",2011:"ca670435",2117:"ba080cf0",2185:"83122cc5",2214:"2547a73f",2516:"a87b02ff",2865:"31fdbffc",2877:"43219d76",2880:"0803793d",2932:"a989827f",3046:"403479c2",3196:"b90736a2",3479:"3be80b34",3562:"dc59b229",3731:"c10afe73",3806:"dcd847b7",3954:"7168a0ed",3965:"c435f287",4208:"651f7e45",4288:"e1bcfc8c",4543:"03229769",4617:"04143661",4630:"57809d78",4774:"a5d88ab9",4905:"6033596d",5051:"e874e45d",5095:"618623a4",5999:"e3886d90",6048:"232069bf",6074:"afeb492d",6270:"9f60b966",6560:"97af14fb",6608:"506f0d2b",6748:"f99980bb",7419:"61d86d1a",7421:"8e641845",7478:"a6f3f0fe",7733:"71141259",7896:"cdb88172",8014:"92e73399",8290:"36182b5a",8451:"11ee4881",8493:"1d36952d",8550:"301cb334",9097:"8de70b51",9112:"00c3a96a",9125:"975a5d27",9169:"91ca6938",9389:"a993f58a",9440:"cfd747d8",9480:"85f19ddb",9740:"a5f9a49f",9936:"48080ac6"}[e]+".js"}}(),function(){n.miniCssF=function(e){}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="OliverMath:";n.l=function(i,o,r,s){if(e[i])e[i].push(o);else{var a,c;if(void 0!==r)for(var u=document.getElementsByTagName("script"),l=0;l<u.length;l++){var d=u[l];if(d.getAttribute("src")==i||d.getAttribute("data-webpack")==t+r){a=d;break}}a||(c=!0,a=document.createElement("script"),a.charset="utf-8",a.timeout=120,n.nc&&a.setAttribute("nonce",n.nc),a.setAttribute("data-webpack",t+r),a.src=i),e[i]=[o];var h=function(t,n){a.onerror=a.onload=null,clearTimeout(p);var o=e[i];if(delete e[i],a.parentNode&&a.parentNode.removeChild(a),o&&o.forEach((function(e){return e(n)})),t)return t(n)},p=setTimeout(h.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=h.bind(null,a.onerror),a.onload=h.bind(null,a.onload),c&&document.head.appendChild(a)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="/OliverMath/"}(),function(){var e={2143:0};n.f.j=function(t,i){var o=n.o(e,t)?e[t]:void 0;if(0!==o)if(o)i.push(o[2]);else{var r=new Promise((function(n,i){o=e[t]=[n,i]}));i.push(o[2]=r);var s=n.p+n.u(t),a=new Error,c=function(i){if(n.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var r=i&&("load"===i.type?"missing":i.type),s=i&&i.target&&i.target.src;a.message="Loading chunk "+t+" failed.\n("+r+": "+s+")",a.name="ChunkLoadError",a.type=r,a.request=s,o[1](a)}};n.l(s,c,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,i){var o,r,s=i[0],a=i[1],c=i[2],u=0;if(s.some((function(t){return 0!==e[t]}))){for(o in a)n.o(a,o)&&(n.m[o]=a[o]);if(c)var l=c(n)}for(t&&t(i);u<s.length;u++)r=s[u],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(l)},i=self["webpackChunkOliverMath"]=self["webpackChunkOliverMath"]||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))}();var i=n.O(void 0,[4998],(function(){return n(1246)}));i=n.O(i)})();
//# sourceMappingURL=app.4f7eaf94.js.map