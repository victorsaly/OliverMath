/**
 * Sound service for game audio effects
 * Uses Web Audio API for low-latency sound playback
 */

const BASE_URL = import.meta.env.BASE_URL || '/';

// Sound URLs - using free sound effects
const SOUND_URLS = {
  correct: `${BASE_URL}assets/sound/correct.mp3`,
  incorrect: `${BASE_URL}assets/sound/incorrect.mp3`,
  streak: `${BASE_URL}assets/sound/streak.mp3`,
  levelUp: `${BASE_URL}assets/sound/levelup.mp3`,
  laugh: `${BASE_URL}assets/sound/laugh.wav`,
};

// Audio context for low-latency playback
let audioContext = null;
const audioBuffers = new Map();
let isMuted = false;

/**
 * Initialize the audio context
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Preload all sound effects
 */
export async function preloadSounds() {
  initAudio();
  
  const loadPromises = Object.entries(SOUND_URLS).map(async ([name, url]) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Sound file not found: ${url}`);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error.message);
    }
  });
  
  await Promise.allSettled(loadPromises);
}

/**
 * Play a sound effect
 * @param {string} soundName - Name of the sound to play
 * @param {number} volume - Volume level (0-1)
 */
export function playSound(soundName, volume = 0.5) {
  if (isMuted || !audioContext) return;
  
  const buffer = audioBuffers.get(soundName);
  if (!buffer) {
    // Fallback to HTML Audio for sounds not preloaded
    const url = SOUND_URLS[soundName];
    if (url) {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {});
    }
    return;
  }
  
  // Resume context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  
  source.buffer = buffer;
  gainNode.gain.value = volume;
  
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  source.start(0);
}

/**
 * Play correct answer sound
 * @param {number} streak - Current streak count
 */
export function playCorrectSound(streak = 0) {
  if (streak >= 5) {
    playSound('streak', 0.6);
  } else {
    playSound('correct', 0.5);
  }
}

/**
 * Play incorrect answer sound
 */
export function playIncorrectSound() {
  playSound('incorrect', 0.4);
}

/**
 * Play level up sound
 */
export function playLevelUpSound() {
  playSound('levelUp', 0.6);
}

/**
 * Toggle mute state
 * @returns {boolean} - New mute state
 */
export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

/**
 * Get current mute state
 * @returns {boolean}
 */
export function getMuteState() {
  return isMuted;
}

/**
 * Set mute state
 * @param {boolean} muted
 */
export function setMuted(muted) {
  isMuted = muted;
}
