/**
 * Sound service for game audio effects
 * Uses Web Audio API oscillators to generate sounds - no external files needed
 */

// Audio context for low-latency playback
let audioContext = null;
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
 * Resume audio context (required after user interaction)
 */
async function resumeContext() {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

/**
 * Preload sounds (no-op now since we generate sounds)
 */
export async function preloadSounds() {
  initAudio();
  // No files to preload - we generate sounds dynamically
  return Promise.resolve();
}

/**
 * Play a melody (sequence of tones)
 * @param {Array<{freq: number, duration: number}>} notes - Array of notes
 * @param {number} volume - Volume level
 */
function playMelody(notes, volume = 0.3) {
  if (isMuted || !audioContext) return;
  
  resumeContext();
  
  let time = audioContext.currentTime;
  
  notes.forEach(({ freq, duration, type = 'sine' }) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.01);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, time + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(time);
    oscillator.stop(time + duration);
    
    time += duration * 0.9; // Slight overlap
  });
}

/**
 * Play correct answer sound - pleasant ascending chime
 * @param {number} streak - Current streak count
 */
export function playCorrectSound(streak = 0) {
  initAudio();
  
  if (streak >= 5) {
    // Streak celebration - triumphant melody
    playMelody([
      { freq: 523.25, duration: 0.1 },  // C5
      { freq: 659.25, duration: 0.1 },  // E5
      { freq: 783.99, duration: 0.1 },  // G5
      { freq: 1046.50, duration: 0.25 }, // C6
    ], 0.4);
  } else if (streak >= 3) {
    // Good streak - happy double chime
    playMelody([
      { freq: 523.25, duration: 0.1 },  // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.2 },  // G5
    ], 0.35);
  } else {
    // Single correct - simple pleasant ding
    playMelody([
      { freq: 523.25, duration: 0.08 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
    ], 0.3);
  }
}

/**
 * Play incorrect answer sound - gentle descending tone
 */
export function playIncorrectSound() {
  initAudio();
  
  // Gentle "oops" sound - descending minor third
  playMelody([
    { freq: 392.00, duration: 0.15, type: 'triangle' }, // G4
    { freq: 329.63, duration: 0.2, type: 'triangle' },  // E4
  ], 0.25);
}

/**
 * Play level up sound - triumphant fanfare
 */
export function playLevelUpSound() {
  initAudio();
  
  playMelody([
    { freq: 392.00, duration: 0.1 },  // G4
    { freq: 493.88, duration: 0.1 },  // B4
    { freq: 587.33, duration: 0.1 },  // D5
    { freq: 783.99, duration: 0.15 }, // G5
    { freq: 987.77, duration: 0.25 }, // B5
  ], 0.4);
}

/**
 * Toggle mute state
 * @returns {boolean} New mute state
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
export function setMuteState(muted) {
  isMuted = muted;
}
