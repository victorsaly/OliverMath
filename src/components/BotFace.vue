<template>
    <div id="bot" :class="[botState, mouthClass]">
      <p class="bubble speech">
        {{text}}
      </p>
      <div id="head">
        <div id="left-ear">
          <div id="left-ear-inner"></div>
        </div>
        <div id="face">
          <div id="eyebrows">
            <div id="left-eyebrow"></div>
            <div id="right-eyebrow"></div>
          </div>
          <div id="eyes">
            <div id="left-eye">
              <div id="left-pupil"></div>
            </div>
            <div id="right-eye">
              <div id="right-pupil"></div>
            </div>
          </div>
          <div id="cheeks">
            <div id="left-cheek"></div>
            <div id="right-cheek"></div>
          </div>
          <div id="mouth" :style="mouthStyle"></div>
        </div>
        <div id="right-ear">
          <div id="right-ear-inner"></div>
        </div>
      </div>
    </div>
   
</template>
<script>
export default {
  name: 'BotFace',
  props: {
    botState: {
      type: String,
      default:'neutral'
    },
    text: {
      type: String,
      default:''
    },
    isPlayMode:{
      type: Boolean,
      default: true
    },
    // Audio amplitude for lip sync (0-1)
    audioLevel: {
      type: Number,
      default: 0
    }
  },
  computed: {
    // Determine mouth shape class based on audio level
    mouthClass() {
      if (this.botState !== 'speaking' || this.audioLevel === 0) {
        return '';
      }
      // Map audio level to mouth shapes
      if (this.audioLevel > 0.7) return 'mouth-wide';
      if (this.audioLevel > 0.4) return 'mouth-medium';
      if (this.audioLevel > 0.15) return 'mouth-small';
      return 'mouth-closed';
    },
    // Dynamic mouth style for smooth transitions
    mouthStyle() {
      if (this.botState !== 'speaking') {
        return {};
      }
      
      const level = Math.min(this.audioLevel, 1);
      const baseHeight = 4;
      const maxHeight = 12;
      const height = baseHeight + (level * (maxHeight - baseHeight));
      
      const baseWidth = 10;
      const maxWidth = 25;
      const width = baseWidth + (level * (maxWidth - baseWidth));
      
      return {
        width: `${width}%`,
        height: `${height}%`,
        left: `${50 - width/2}%`,
        borderRadius: level > 0.3 ? '50%' : '0.5em',
        transition: 'all 0.05s ease-out'
      };
    }
  }
}
</script>
<style scoped>

p.bubble {
	position: relative;
	width: min(300px, 80vw);
	text-align: center;
	margin: 5px auto 30px;
	background-color: #fff;
  color: #428cff;
	border: 6px solid var(--ion-color-primary, #3880ff);
	border-radius: 24px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	padding: 16px 20px;
  font-size: clamp(16px, 4vw, 20px);
  line-height: 1.4;
  vertical-align: middle;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

div.broken p.bubble {
  border-color: var(--ion-color-danger, #eb445a);
  color: var(--ion-color-danger, #eb445a);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

p.thought {
	width: min(300px, 80vw);
	border-radius: 200px;
	padding: 30px;	
}

p.bubble:before,
p.bubble:after {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
}

p.speech:before {
	left: 30px;
	bottom: -40px;
	border: 20px solid;
	border-color: var(--ion-color-primary, #3880ff) transparent transparent var(--ion-color-primary, #3880ff);
}

div.broken p.speech:before {
	left: 30px;
	bottom: -40px;
	border: 20px solid;
	border-color: var(--ion-color-danger, #eb445a) transparent transparent var(--ion-color-danger, #eb445a);
}


p.speech:after {
	left: 36px;
	bottom: -24px;
	border: 14px solid;
	border-color: #fff transparent transparent #fff;
}

p.thought:before,
p.thought:after {
	left: 10px;
	bottom: -30px;
	width: 40px;
	height: 40px;
	background-color: #fff;
	border: 8px solid #333;
	-webkit-border-radius: 28px;
	-moz-border-radius: 28px;
	border-radius: 28px;
}

p.thought:after {
	width: 20px;
	height: 20px;
	left: 5px;
	bottom: -40px;
	-webkit-border-radius: 18px;
	-moz-border-radius: 18px;
	border-radius: 18px;
}

/* BOT */

#bot
{
  position: relative;
  padding: 16px;
  padding-top: 0;
  text-align: center;
  width: min(24em, 90vw);
  height: auto;
  min-width: 10em;
  min-height: 10em;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#head
{
  position: relative;
  display: block;
  width: min(200px, 60vw);
  height: min(200px, 60vw);
  margin-top: 16px;
}

#face
{
  position: absolute;
  margin-left: 0%;
  margin-right: 0%;
  width: 100%;
  height: 100%;
  border: 0.4em solid #ccc;
  border-radius: 1.5em;
  background-color: #000;
  /*border : 1px solid red;*/
}

#left-ear, #right-ear
{
  position: absolute;
  top: 30%;
  width: 6%;
  height: 25%;
  border: 0.15em solid #FFF;
  background-color: lightgray;
  border-radius: 0.1em;
}

#left-ear
{
  left: -6%;
}

#right-ear
{
  right: -6%;
}

#left-ear-inner, #right-ear-inner
{
  position: absolute;
  top: 20%;
  width: 100%;
  height: 60%;
  background-color: lightgray;
  border-radius: 0.1em;
}

#left-ear-inner
{
  left: -150%;
}

#right-ear-inner
{
  right: -150%;
}

#eyes
{
  position: absolute;
  width: 70%;
  height: 20%;
  margin-left: 16%; /* 16 */
  margin-top: 20%; /* 20 */
  /*border : 1px solid #428cff;*/
}

#left-eye, #right-eye
{
  position: absolute;
  width: 35%;
  height: 100%;
  background-color: #428cff;
  border-radius: 0.5em;
  /*border: 0.15em solid #FFF;*/
  overflow: hidden;
}

#left-pupil, #right-pupil
{
  position: absolute;
  width: 40%;
  height: 40%;
  background-color: #1a1a2e;
  border-radius: 50%;
  top: 30%;
  left: 30%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

 #right-eye
{
  right: 0%;
}

/* Eyebrows */
#eyebrows
{
  position: absolute;
  width: 70%;
  height: 8%;
  margin-left: 16%;
  margin-top: 10%;
}

#left-eyebrow, #right-eyebrow
{
  position: absolute;
  width: 30%;
  height: 100%;
  background-color: #ccc;
  border-radius: 0.3em;
  transition: all 0.3s ease;
  opacity: 0;
}

#right-eyebrow
{
  right: 5%;
}

#left-eyebrow
{
  left: 5%;
}

/* Cheeks */
#cheeks
{
  position: absolute;
  width: 100%;
  height: 15%;
  bottom: 30%;
}

#left-cheek, #right-cheek
{
  position: absolute;
  width: 15%;
  height: 100%;
  background-color: #ffb6c1;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

#left-cheek
{
  left: 5%;
}

#right-cheek
{
  right: 5%;
}

#mouth
{
  position: absolute;
  width: 30%;
  height: 4%;
  border-left: 0.2em solid #FFF;
  border-right: 0.2em solid #FFF;
  border-bottom: 0.2em solid #FFF;
  border-top: 0.0em solid #FFF;
  border-radius: 0.5em;
  left: 35%;
  bottom: 20%;
}

/* Animations */
#bot.neutral #left-eye, #bot.neutral #right-eye
{
   animation: blink-eyes 3s infinite ease-in alternate;
   animation-delay: 2s;
}

#bot.neutral #left-ear-inner
{
   animation: move-left-ear-inner 5.0s infinite ease alternate;
}

#bot.neutral #right-ear-inner
{
   animation: move-right-ear-inner 5.0s infinite ease alternate;
}

@keyframes blink-eyes {
  0%   { height: 10%; margin-top: 10%}
  10% { height: 100%; margin-top: 0%}
  100% { height: 100%; margin-top: 0%}
}

/* Speaking */
#bot.speaking #mouth
{
   border-top: 0.2em solid #FFF;
   background-color: #FFF;
   /* Remove animation - now controlled dynamically via audioLevel prop */
}

/* Mouth shapes for lip sync - fallback when no audio analysis */
#bot.speaking.mouth-closed #mouth {
  width: 15%;
  height: 4%;
  left: 42.5%;
  border-radius: 0.5em;
}

#bot.speaking.mouth-small #mouth {
  width: 15%;
  height: 6%;
  left: 42.5%;
  border-radius: 0.6em;
}

#bot.speaking.mouth-medium #mouth {
  width: 20%;
  height: 9%;
  left: 40%;
  border-radius: 50%;
}

#bot.speaking.mouth-wide #mouth {
  width: 25%;
  height: 12%;
  left: 37.5%;
  border-radius: 50%;
}

/* Waiting (Thinking) */
#bot.thinking #eyes
{
   animation: glance-eyes 8s infinite ease-in-out;
   animation-delay: 2s;
}

#bot.thinking #mouth
{
   animation: pinch-mouth 6.0s infinite ease alternate;
   animation-delay: 4s;
}

#bot.thinking #left-ear-inner
{
   animation: move-left-ear-inner 6.0s infinite ease alternate;
   animation-delay: 4s;
}

#bot.thinking #right-ear-inner
{
   animation: move-right-ear-inner 6.0s infinite ease alternate;
   animation-delay: 4s;
}

@keyframes glance-eyes {
  0%  { margin-left: 16%; }
  10% { margin-left: 6%; }
  40% { margin-left: 6%; }
  60% { margin-left: 24%; }
  70% { margin-left: 24%; }
  80% { margin-left: 16%; }
  100% { margin-left: 16%; }
}

@keyframes pinch-mouth {
  0%   { width: 30%; left: 35%; }
  48%  { width: 30%; left: 35%; }
  50%  { width: 10%; left: 45%; }
  52%  { width: 30%; left: 35%; }
  100% { width: 30%; left: 35%;}
}

@keyframes move-left-ear-inner {
  0%   { left: -150%; }
  48%  { left: -150%; }
  50%  { left: -100%; }
  52%  { left: -150%; }
  100% { left: -150%; }
}

@keyframes move-right-ear-inner {
  0%   { right: -150%; }
  48%  { right: -150%; }
  50%  { right: -100%; }
  52%  { right: -150%; }
  100% { right: -150%; }
}

/* Listening */
#bot.listening #left-eye, #bot.listening #right-eye
{
  background-color: lightgreen;
  border-radius: 1em;
  transition : border-radius 0.25s linear;
  animation: none;
}

#bot.listening #left-ear, #bot.listening #right-ear,
#bot.listening #left-ear-inner, #bot.listening #right-ear-inner
{
  background-color: lightgreen;
}

#bot.listening #face, 
#bot.listening #left-ear, #bot.listening #right-ear
{
   border-color: lightgreen;
   transition : border-color 0.25s linear;
}

#bot.listening #left-ear-inner,
#bot.listening #right-ear-inner
{
  /*outline: 0.4em dotted lightgreen;*/
  animation: border-bump 0.4s infinite ease alternate;
  animation-delay: 0.5s;
}

@keyframes border-bump {
  0% {
    outline: 0.4em dotted lightgreen;
  }
  
  100% {
    outline: 0.2em dotted black;
  }
}

/* laughing */
#bot.laughing #left-eye, #bot.laughing #right-eye
{
  background-color: lightgreen;
  border-radius: 1em;
  height: 35% !important;
  transition : border-radius 0.25s linear;
  animation: blink-eyes 1s infinite ease-in alternate;
}

#bot.laughing
{
  animation: MoveUpDown 0.3s infinite ease-in alternate;
}

#bot.laughing #mouth
{
  border: 0.5em solid #FFF;
  width: 30%;
  left: 35%;
}

@keyframes MoveUpDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

#bot.laughing #left-ear, #bot.laughing #right-ear,
#bot.laughing #left-ear-inner, #bot.laughing #right-ear-inner
{
  background-color: lightgreen;
}

#bot.laughing #face, 
#bot.laughing #left-ear, #bot.laughing #right-ear
{
   border-color: lightgreen;
   transition : border-color 0.25s linear;
}

#bot.laughing #left-ear-inner,
#bot.laughing #right-ear-inner
{
  /*outline: 0.4em dotted lightgreen;*/
  animation: border-bump 0.4s infinite ease alternate;
  animation-delay: 0.5s;
}

@keyframes border-bump {
  0% {
    outline: 0.4em dotted lightgreen;
  }
  
  100% {
    outline: 0.2em dotted black;
  }
}


/* Broken */


#bot.broken #left-eye, #bot.broken #right-eye
{
  background-color:darkred;
  border-radius: 0;
  transition : border-radius 0.25s linear;
}

#bot.broken #left-ear, #bot.broken #right-ear,
#bot.broken #left-ear-inner, #bot.broken #right-ear-inner
{
  background-color: darkred;
}

#bot.broken #face, 
#bot.broken #left-ear, #bot.broken #right-ear
{
   border-color: darkred;
   transition : border-color 0.25s linear;
}

#bot.broken #mouth
{
  border: 0.1em solid darkred;
  background: darkred;
  width: 30%;
  left: 35%;
}



/* Computing */
#bot.computing #left-eye, #bot.computing #right-eye
{
  height: 100%;
  width: 25%;
  border-radius: 100%;
  transition : all 0.25s linear;
  border: 0.3em dashed black;
  animation-delay: 0.5s;
  background-color: #99FFFF;
}

#bot.computing #left-eye
{
  animation: border-dance 1s infinite linear reverse;
}

#bot.computing #right-eye
{
  animation: border-dance 1s infinite linear;
}

#bot.computing #face, 
#bot.computing #left-ear, #bot.computing #right-ear,
#bot.computing #left-ear-inner, #bot.computing #right-ear-inner
{
   border-color: #99FFFF;
   transition : border-color 0.25s linear;
}

#bot.computing #left-ear, #bot.computing #right-ear,
#bot.computing #left-ear-inner, #bot.computing #right-ear-inner
{
   background-color: #99FFFF;
   transition : background-color 0.25s linear;
   animation: none;
}

#bot.computing #mouth
{
  border: 0.5em solid #FFF;
  width: 10%;
  left: 45%;
}

@keyframes border-dance {
  100% { 
      transform: rotateZ(360deg); 
    }
}

/* ========== HAPPY (Correct Answer) ========== */
#bot.happy #left-eye, #bot.happy #right-eye
{
  background-color: #ffd700;
  border-radius: 50%;
  height: 100%;
  animation: happy-eyes 0.5s ease-in-out;
}

#bot.happy #left-cheek, #bot.happy #right-cheek
{
  opacity: 0.7;
  animation: blush 0.5s ease-in-out;
}

#bot.happy #mouth
{
  border: 0.4em solid #FFF;
  border-top: none;
  width: 40%;
  height: 20%;
  left: 30%;
  border-radius: 0 0 2em 2em;
}

#bot.happy #face, 
#bot.happy #left-ear, #bot.happy #right-ear
{
  border-color: #ffd700;
  transition: border-color 0.25s linear;
}

#bot.happy #left-ear, #bot.happy #right-ear,
#bot.happy #left-ear-inner, #bot.happy #right-ear-inner
{
  background-color: #ffd700;
}

#bot.happy
{
  animation: celebrate 0.5s ease-in-out;
}

@keyframes happy-eyes {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes blush {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 0.7; transform: scale(1); }
}

@keyframes celebrate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* ========== SAD (Wrong Answer) ========== */
#bot.sad #left-eye, #bot.sad #right-eye
{
  background-color: #87ceeb;
  height: 80%;
  margin-top: 10%;
}

#bot.sad #left-eyebrow, #bot.sad #right-eyebrow
{
  opacity: 1;
  background-color: #87ceeb;
}

#bot.sad #left-eyebrow
{
  transform: rotate(-15deg);
}

#bot.sad #right-eyebrow
{
  transform: rotate(15deg);
}

#bot.sad #mouth
{
  border: 0.3em solid #FFF;
  border-bottom: none;
  width: 30%;
  height: 15%;
  left: 35%;
  bottom: 15%;
  border-radius: 2em 2em 0 0;
}

#bot.sad #face, 
#bot.sad #left-ear, #bot.sad #right-ear
{
  border-color: #87ceeb;
  transition: border-color 0.25s linear;
}

#bot.sad #left-ear, #bot.sad #right-ear,
#bot.sad #left-ear-inner, #bot.sad #right-ear-inner
{
  background-color: #87ceeb;
}

#bot.sad
{
  animation: droop 1s ease-in-out;
}

@keyframes droop {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

/* ========== EXCITED ========== */
#bot.excited #left-eye, #bot.excited #right-eye
{
  background-color: #ff69b4;
  border-radius: 50%;
  animation: sparkle 0.3s infinite alternate;
}

#bot.excited #left-pupil, #bot.excited #right-pupil
{
  opacity: 1;
  animation: pupil-dance 0.5s infinite alternate;
}

#bot.excited #left-cheek, #bot.excited #right-cheek
{
  opacity: 0.8;
}

#bot.excited #mouth
{
  border: 0.5em solid #FFF;
  width: 35%;
  height: 25%;
  left: 32%;
  border-radius: 50%;
  animation: excited-mouth 0.3s infinite alternate;
}

#bot.excited #face, 
#bot.excited #left-ear, #bot.excited #right-ear
{
  border-color: #ff69b4;
}

#bot.excited #left-ear, #bot.excited #right-ear,
#bot.excited #left-ear-inner, #bot.excited #right-ear-inner
{
  background-color: #ff69b4;
  animation: ear-wiggle 0.2s infinite alternate;
}

#bot.excited
{
  animation: bounce 0.3s infinite alternate;
}

@keyframes sparkle {
  0% { box-shadow: 0 0 5px #fff; }
  100% { box-shadow: 0 0 15px #ff69b4; }
}

@keyframes pupil-dance {
  0% { transform: translateY(-20%); }
  100% { transform: translateY(20%); }
}

@keyframes excited-mouth {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

@keyframes ear-wiggle {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

/* ========== SLEEPY ========== */
#bot.sleepy #left-eye, #bot.sleepy #right-eye
{
  background-color: #9370db;
  height: 30%;
  margin-top: 35%;
  border-radius: 0.3em;
  animation: sleepy-blink 3s infinite ease-in-out;
}

#bot.sleepy #mouth
{
  width: 20%;
  height: 15%;
  left: 40%;
  border: 0.3em solid #FFF;
  border-radius: 50%;
  animation: yawn 4s infinite ease-in-out;
}

#bot.sleepy #face, 
#bot.sleepy #left-ear, #bot.sleepy #right-ear
{
  border-color: #9370db;
}

#bot.sleepy #left-ear, #bot.sleepy #right-ear,
#bot.sleepy #left-ear-inner, #bot.sleepy #right-ear-inner
{
  background-color: #9370db;
}

#bot.sleepy
{
  animation: sway 3s infinite ease-in-out;
}

@keyframes sleepy-blink {
  0%, 90%, 100% { height: 30%; }
  95% { height: 5%; }
}

@keyframes yawn {
  0%, 70%, 100% { width: 20%; height: 15%; }
  80%, 90% { width: 30%; height: 25%; }
}

@keyframes sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3deg); }
}

/* ========== CONFUSED ========== */
#bot.confused #left-eye
{
  background-color: #dda0dd;
  width: 30%;
  height: 100%;
}

#bot.confused #right-eye
{
  background-color: #dda0dd;
  width: 40%;
  height: 80%;
  margin-top: 10%;
}

#bot.confused #left-eyebrow
{
  opacity: 1;
  background-color: #dda0dd;
  transform: rotate(20deg);
}

#bot.confused #right-eyebrow
{
  opacity: 1;
  background-color: #dda0dd;
  transform: rotate(-10deg);
}

#bot.confused #eyes
{
  animation: confused-look 2s infinite ease-in-out;
}

#bot.confused #mouth
{
  width: 25%;
  left: 40%;
  border: 0.3em solid #FFF;
  border-radius: 0.5em;
  transform: rotate(15deg);
}

#bot.confused #face, 
#bot.confused #left-ear, #bot.confused #right-ear
{
  border-color: #dda0dd;
}

#bot.confused #left-ear, #bot.confused #right-ear,
#bot.confused #left-ear-inner, #bot.confused #right-ear-inner
{
  background-color: #dda0dd;
}

@keyframes confused-look {
  0%, 100% { margin-left: 16%; }
  30% { margin-left: 10%; }
  70% { margin-left: 22%; }
}

/* ========== SURPRISED ========== */
#bot.surprised #left-eye, #bot.surprised #right-eye
{
  background-color: #00ced1;
  border-radius: 50%;
  height: 120%;
  width: 40%;
  animation: pop-eyes 0.3s ease-out;
}

#bot.surprised #left-pupil, #bot.surprised #right-pupil
{
  opacity: 1;
  width: 30%;
  height: 30%;
}

#bot.surprised #left-eyebrow, #bot.surprised #right-eyebrow
{
  opacity: 1;
  background-color: #00ced1;
  transform: translateY(-50%);
}

#bot.surprised #mouth
{
  width: 20%;
  height: 20%;
  left: 40%;
  border: 0.4em solid #FFF;
  border-radius: 50%;
}

#bot.surprised #face, 
#bot.surprised #left-ear, #bot.surprised #right-ear
{
  border-color: #00ced1;
}

#bot.surprised #left-ear, #bot.surprised #right-ear,
#bot.surprised #left-ear-inner, #bot.surprised #right-ear-inner
{
  background-color: #00ced1;
}

@keyframes pop-eyes {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ========== PROUD ========== */
#bot.proud #left-eye, #bot.proud #right-eye
{
  background-color: #ffa500;
  height: 60%;
  margin-top: 20%;
  border-radius: 0.3em 0.3em 0.5em 0.5em;
}

#bot.proud #left-eyebrow, #bot.proud #right-eyebrow
{
  opacity: 1;
  background-color: #ffa500;
  height: 120%;
}

#bot.proud #left-eyebrow
{
  transform: rotate(-10deg) translateY(-30%);
}

#bot.proud #right-eyebrow
{
  transform: rotate(10deg) translateY(-30%);
}

#bot.proud #mouth
{
  border: 0.3em solid #FFF;
  border-top: none;
  width: 35%;
  height: 15%;
  left: 32%;
  border-radius: 0 0 1.5em 1.5em;
}

#bot.proud #face, 
#bot.proud #left-ear, #bot.proud #right-ear
{
  border-color: #ffa500;
}

#bot.proud #left-ear, #bot.proud #right-ear,
#bot.proud #left-ear-inner, #bot.proud #right-ear-inner
{
  background-color: #ffa500;
}

#bot.proud
{
  animation: stand-tall 1s ease-in-out;
}

@keyframes stand-tall {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  p.bubble {
    background-color: var(--ion-color-step-100, #1e1e1e);
    color: var(--ion-color-primary, #428cff);
    border-color: var(--ion-color-primary, #428cff);
  }
  
  p.speech:after {
    border-color: var(--ion-color-step-100, #1e1e1e) transparent transparent var(--ion-color-step-100, #1e1e1e);
  }
}

/* Responsive adjustments */
@media (max-width: 400px) {
  p.bubble {
    padding: 12px 16px;
    min-height: 80px;
    border-width: 4px;
    border-radius: 20px;
  }
  
  p.speech:before {
    border-width: 16px;
    bottom: -32px;
  }
  
  p.speech:after {
    border-width: 10px;
    bottom: -18px;
    left: 34px;
  }
  
  #head {
    width: min(160px, 55vw);
    height: min(160px, 55vw);
  }
}
</style>