<template>
    <div id="bot" :class="botState">
      <p class="bubble speech">
        {{text}}
      </p>
      <div id="head">
        <div id="left-ear">
          <div id="left-ear-inner"></div>
        </div>
        <div id="face">
          <div id="eyes">
            <div id="left-eye"></div>
            <div id="right-eye"></div>
          </div>
          <div id="mouth"></div>
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
}

 #right-eye
{
  right: 0%;
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
   animation: speak-mouth 1.0s infinite ease alternate;
}

@keyframes speak-mouth {
  0%   { width: 10%; height: 4%; left: 45%;}
  25% { width: 30%; height: 10%; left: 35%;}
  50% { width: 6%; height: 4%; left: 47%;}
  75% { width: 40%; height: 8%; left: 30%;}
  100% { width: 30%; height: 4%; left: 35%;}
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