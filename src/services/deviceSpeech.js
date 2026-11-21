/**
 * Speech on the device, for the iOS and Android apps.
 *
 * In a browser the game talks to Azure Speech. Inside the native app it uses
 * the models built into the phone instead, through the local `DeviceSpeech`
 * Capacitor plugin (native/device-speech): the child's voice never leaves the
 * device, there is nothing to pay per answer, and the game works offline.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const DeviceSpeech = registerPlugin('DeviceSpeech');

/** True inside the iOS or Android app, false in any browser. */
export const isNativeApp = Capacitor.isNativePlatform();

/**
 * Has the microphone been allowed, refused, or not asked about yet?
 * @returns {Promise<'granted'|'denied'|'prompt'>}
 */
export async function deviceMicrophoneStatus() {
  try {
    const { state } = await DeviceSpeech.microphoneStatus();
    return state || 'prompt';
  } catch (error) {
    console.warn('Could not read the microphone permission:', error);
    return 'prompt';
  }
}

/** Open this app's page in the phone's Settings. */
export function openDeviceSettings() {
  return DeviceSpeech.openSettings().catch(() => {});
}

/**
 * Ask for the microphone and make sure a model for the language is installed.
 * @param {string} locale - e.g. 'en-GB'
 * @param {() => void} [onDownloading] - called if the phone has to fetch the
 *   speech model for this language first, which can take a little while
 * @returns {Promise<{microphone: boolean, available: boolean, engine: string, reason: string}>}
 */
export async function prepareDeviceSpeech(locale, onDownloading) {
  let handle = null;
  try {
    handle = await DeviceSpeech.addListener('modelDownload', () => {
      if (onDownloading) onDownloading();
    });
    return await DeviceSpeech.prepare({ locale });
  } catch (error) {
    console.warn('Device speech is not available:', error);
    return { microphone: false, available: false, engine: 'none', reason: 'plugin-error' };
  } finally {
    if (handle) handle.remove();
  }
}

/**
 * Open the microphone for one answer.
 * @param {string} locale - e.g. 'en-GB'
 * @param {(text: string) => void} onPartial - called as the transcript grows
 * @returns {Promise<string>} what was heard; '' for silence
 */
export async function listenOnDevice(locale, onPartial) {
  const handle = await DeviceSpeech.addListener('partial', (event) => {
    if (onPartial) onPartial(event.text || '');
  });
  try {
    const { text } = await DeviceSpeech.listen({ locale });
    return text || '';
  } finally {
    handle.remove();
  }
}

/** End the current answer early. The pending listenOnDevice() resolves. */
export function stopDeviceListening() {
  return DeviceSpeech.stop().catch(() => {});
}

/**
 * Speak with the system voice. Resolves when it has finished or been stopped.
 * @param {string} text
 * @param {string} locale - e.g. 'en-GB'
 */
export function speakOnDevice(text, locale) {
  return DeviceSpeech.speak({ text, locale });
}

export function stopDeviceSpeaking() {
  return DeviceSpeech.stopSpeaking().catch(() => {});
}
