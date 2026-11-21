/**
 * The robot's voice and ears.
 *
 * The game screen used to hold all of this itself: the Azure SDK, the browser's
 * fallback voice, the phone's own recogniser, the lip-sync analysis and the
 * bookkeeping to stop them treading on each other. It now asks for four things
 * and does not care which engine answers:
 *
 *   warmUp()               fetch what the first Play will need, quietly
 *   prepare(locale)        make sure it is possible to listen
 *   speak(text, locale)    say a line; resolves 'finished' or 'stopped'
 *   listen(locale, onPartial)   hear one answer; resolves with the text
 *   stopSpeaking() / stopListening()
 *
 * Two engines implement it. In a browser: Azure Speech, with the browser's own
 * voice as a fallback. In the iOS and Android apps: the models built into the
 * phone, so nothing a child says leaves the device.
 */
import { getSpeechToken, getCachedAudio } from '@/services/apiService';
import {
  isNativeApp,
  prepareDeviceSpeech,
  deviceMicrophoneStatus,
  openDeviceSettings,
  listenOnDevice,
  stopDeviceListening,
  speakOnDevice,
  stopDeviceSpeaking
} from '@/services/deviceSpeech';

export { isNativeApp, openDeviceSettings };

/**
 * @typedef {Object} Readiness
 * @property {boolean} ready   - true when the engine can listen
 * @property {string}  reason  - why not: 'microphone-denied', 'model-not-installed',
 *                               'service-unreachable', 'declined', ...
 */

// The Azure Speech SDK is 455KB and is not needed until the child taps Play.
// Loaded on demand, and left out of the store apps' bundle entirely.
let speechSdk = null;
async function loadSpeechSdk() {
  if (import.meta.env.VITE_NATIVE_BUILD) return null;
  if (!speechSdk) {
    speechSdk = await import('microsoft-cognitiveservices-speech-sdk');
  }
  return speechSdk;
}

/**
 * Measures how loud the robot's voice is, many times a second, so its mouth
 * and the glow at the screen's edge can move with it.
 */
function createLevelMeter(onLevel) {
  let context = null;
  let analyser = null;
  let source = null;
  let frame = null;
  let bins = null;
  let from = 0;
  let to = 0;

  function tick() {
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    const end = Math.min(to, bins.length);
    for (let i = from; i < end; i++) sum += bins[i];
    const count = end - from;
    // The range a voice occupies, lifted a little so quiet speech still shows.
    onLevel(Math.min(1, ((count > 0 ? sum / count : 0) / 128) * 1.5));
    frame = requestAnimationFrame(tick);
  }

  return {
    start(audioElement) {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        bins = new Uint8Array(analyser.frequencyBinCount);
        const hertzPerBin = context.sampleRate / analyser.fftSize;
        from = Math.floor(80 / hertzPerBin);
        to = Math.floor(3000 / hertzPerBin);
      }
      if (source) {
        try {
          source.disconnect();
        } catch {
          // Already disconnected.
        }
      }
      try {
        source = context.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(context.destination);
      } catch (error) {
        // An element can only be connected once; a cached line is reused.
        console.warn('Audio source already connected:', error.message);
      }
      if (context.state === 'suspended') context.resume();
      cancelAnimationFrame(frame);
      tick();
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = null;
      onLevel(0);
    }
  };
}

/**
 * Browser engine: Azure Speech for both directions, the browser's own voice
 * when Azure's cannot be reached.
 */
function createWebSpeech({ onLevel }) {
  const meter = createLevelMeter(onLevel);
  let token = null;
  let region = null;
  let microphoneAllowed = false;

  // The line being spoken. Each speak() gets its own; finishing or stopping
  // it settles that line's promise exactly once.
  let line = null;
  let recogniser = null;

  function settle(result) {
    const current = line;
    line = null;
    meter.stop();
    if (current) current.resolve(result);
  }

  function stopSpeaking() {
    if (!line) return;
    const current = line;
    if (current.audio) {
      current.audio.onended = null;
      current.audio.onerror = null;
      current.audio.pause();
      current.audio.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    settle('stopped');
  }

  /** The browser's own voice, in the chosen language. */
  function speakWithBrowser(text, locale, current) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      if (line === current) settle('finished');
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    // A cancelled line still reports that it ended. Only the current one may
    // settle.
    const done = () => {
      if (line === current) settle('finished');
    };
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
  }

  async function fetchToken() {
    if (token) return true;
    try {
      const reply = await getSpeechToken();
      token = reply.token;
      region = reply.region;
      return true;
    } catch (error) {
      console.warn('Speech service not reachable:', error);
      return false;
    }
  }

  return {
    /**
     * Fetches the token and the SDK while the child is still looking at the
     * home screen, so the first Play does not wait for them. Asks for nothing
     * and shows nothing.
     */
    warmUp() {
      fetchToken();
      loadSpeechSdk().catch(() => {});
    },

    /**
     * A token for Azure Speech and permission to use the microphone. The
     * permission is asked for on the first Play rather than when the page
     * loads, so the browser's question arrives when it makes sense.
     * @returns {Promise<Readiness>}
     */
    async prepare() {
      if (!(await fetchToken())) return { ready: false, reason: 'service-unreachable' };
      await loadSpeechSdk();
      if (!microphoneAllowed) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          // Only the permission was wanted; the recogniser opens its own.
          stream.getTracks().forEach((track) => track.stop());
          microphoneAllowed = true;
        } catch {
          return { ready: false, reason: 'microphone-denied' };
        }
      }
      return { ready: true, reason: '' };
    },

    /**
     * @returns {Promise<'finished'|'stopped'>} 'stopped' when cut short by
     *   stopSpeaking() or by the next line.
     */
    speak(text, locale) {
      stopSpeaking();
      return new Promise((resolve) => {
        const current = { resolve, audio: null };
        line = current;
        getCachedAudio(text, locale)
          .then((audio) => {
            if (line !== current) return;
            current.audio = audio;
            audio.crossOrigin = 'anonymous';
            audio.onplay = () => meter.start(audio);
            audio.onended = () => {
              if (line === current) settle('finished');
            };
            audio.onerror = () => {
              if (line !== current) return;
              current.audio = null;
              speakWithBrowser(text, locale, current);
            };
            return audio.play();
          })
          .catch((error) => {
            if (line !== current) return;
            console.warn('Azure voice unavailable, using the browser voice:', error);
            current.audio = null;
            speakWithBrowser(text, locale, current);
          });
      });
    },

    stopSpeaking,

    /**
     * Opens the microphone for one answer.
     * @returns {Promise<string>} what was heard; '' for silence or when stopped
     */
    async listen(locale, onPartial) {
      const sdk = await loadSpeechSdk();
      const config = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      config.speechRecognitionLanguage = locale;
      const mine = new sdk.SpeechRecognizer(config, sdk.AudioConfig.fromDefaultMicrophoneInput());
      recogniser = mine;

      mine.recognizing = (sender, event) => {
        if (onPartial) onPartial(event.result.text || '');
      };

      return new Promise((resolve, reject) => {
        const release = () => {
          if (recogniser === mine) recogniser = null;
          try {
            mine.close();
          } catch {
            // Already closed by stopListening().
          }
        };
        mine.recognizeOnceAsync(
          (result) => {
            release();
            resolve(result.text || '');
          },
          (error) => {
            const stoppedOnPurpose = recogniser !== mine;
            release();
            // Closing the recogniser to end a turn reports as an error.
            if (stoppedOnPurpose) resolve('');
            else reject(new Error(String(error)));
          }
        );
      });
    },

    stopListening() {
      const current = recogniser;
      recogniser = null;
      if (!current) return;
      try {
        current.close();
      } catch (error) {
        console.warn('Could not close the speech recogniser:', error);
      }
    }
  };
}

/**
 * App engine: the phone's own models, through the DeviceSpeech plugin.
 */
function createDeviceSpeech({ onLevel }) {
  let preparedLocale = null;

  return {
    /** Nothing to fetch: the models are on the phone. */
    warmUp() {},

    /**
     * @param {string} locale
     * @param {Object} [hooks]
     * @param {() => Promise<boolean>} [hooks.beforePrompt] - called before the
     *   system asks for the microphone for the first time; resolve false to
     *   skip asking (the child plays with the number pad instead)
     * @param {() => void} [hooks.onDownloading] - the phone is fetching the
     *   speech model for this language
     * @returns {Promise<Readiness>}
     */
    async prepare(locale, hooks = {}) {
      if (preparedLocale === locale) return { ready: true, reason: '' };
      if ((await deviceMicrophoneStatus()) === 'prompt' && hooks.beforePrompt) {
        if (!(await hooks.beforePrompt())) return { ready: false, reason: 'declined' };
      }
      const status = await prepareDeviceSpeech(locale, hooks.onDownloading);
      const ready = status.microphone && status.available;
      preparedLocale = ready ? locale : null;
      return { ready, reason: status.reason || '' };
    },

    async speak(text, locale) {
      // The system voice gives no level to follow; the mouth animates on its
      // own while the line is spoken.
      onLevel(0);
      try {
        const result = await speakOnDevice(text, locale);
        return result && result.completed === false ? 'stopped' : 'finished';
      } catch (error) {
        // The words are on screen, so the game carries on without a voice.
        console.warn('Device voice failed:', error);
        return 'finished';
      }
    },

    stopSpeaking() {
      stopDeviceSpeaking();
    },

    listen(locale, onPartial) {
      return listenOnDevice(locale, onPartial);
    },

    stopListening() {
      stopDeviceListening();
    },

    /** Forget the prepared language, so the next prepare() asks again. */
    reset() {
      preparedLocale = null;
    }
  };
}

/**
 * @param {Object} options
 * @param {(level: number) => void} options.onLevel - 0 to 1, the loudness of
 *   the robot's voice right now
 */
export function createSpeech({ onLevel = () => {} } = {}) {
  const engine = isNativeApp ? createDeviceSpeech({ onLevel }) : createWebSpeech({ onLevel });
  if (!engine.reset) engine.reset = () => {};
  return engine;
}
