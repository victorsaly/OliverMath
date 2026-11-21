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
 * Ask for the microphone and make sure a model for the language is installed.
 * @param {string} locale - e.g. 'en-GB'
 * @returns {Promise<{microphone: boolean, available: boolean, engine: string, reason: string}>}
 */
export async function prepareDeviceSpeech(locale) {
  try {
    return await DeviceSpeech.prepare({ locale });
  } catch (error) {
    console.warn('Device speech is not available:', error);
    return { microphone: false, available: false, engine: 'none', reason: 'plugin-error' };
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
