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
  // Muting silences the ambient bed too, not just the effects.
  applyMusicGain(0.4);
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
  applyMusicGain(0.4);
}

/* ---------------------------------------------------------------------------
 * Ambient background music
 *
 * Synthesised rather than streamed: the app already generates every other sound
 * with oscillators, and a music file would mean shipping (and licensing) an
 * asset plus a download that fails offline. This is a slow four-chord pad with
 * a sparse bell on top - deliberately unobtrusive, because it plays underneath
 * a voice game for a child.
 * ------------------------------------------------------------------------ */

// A minor-ish progression, low and wide. Frequencies in Hz.
const PAD_CHORDS = [
  [146.83, 220.0, 293.66],
  [164.81, 246.94, 329.63],
  [110.0, 164.81, 220.0],
  [130.81, 196.0, 261.63]
];

const BELL_NOTES = [587.33, 659.25, 783.99, 880.0];

let musicGain = null;
let musicTimer = null;
let musicStep = 0;
let musicWanted = false;
let musicDucked = false;

function musicTargetGain() {
  if (!musicWanted || isMuted) return 0;
  // Ducked almost to nothing while the robot is talking or the microphone is
  // open: music coming out of the speaker is picked straight back up by the mic
  // and degrades recognition.
  return musicDucked ? 0.012 : 0.075;
}

function applyMusicGain(seconds = 1.2) {
  if (!musicGain || !audioContext) return;
  const now = audioContext.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(musicTargetGain(), now + seconds);
}

function scheduleMusicBar() {
  if (!audioContext || !musicGain) return;

  const chord = PAD_CHORDS[musicStep % PAD_CHORDS.length];
  const now = audioContext.currentTime;
  const barLength = 6;

  chord.forEach((freq) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Long fade in and out so chords overlap instead of pulsing.
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 2.2);
    gain.gain.linearRampToValueAtTime(0, now + barLength + 1.4);

    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(now);
    osc.stop(now + barLength + 1.6);
  });

  // One bell every other bar, so it never becomes a pattern to follow.
  if (musicStep % 2 === 1) {
    const note = BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)];
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.value = note;
    const at = now + 1.5;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.1, at + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0005, at + 2.6);
    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(at);
    osc.stop(at + 2.7);
  }

  musicStep++;
  musicTimer = setTimeout(scheduleMusicBar, barLength * 1000);
}

/**
 * Start the ambient bed. Must be called from a user gesture - browsers will not
 * let an AudioContext start on its own, which is also why this is not kicked
 * off on mount.
 */
export async function startMusic() {
  initAudio();
  await resumeContext();
  if (musicWanted) return;

  musicWanted = true;
  if (!musicGain) {
    musicGain = audioContext.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(audioContext.destination);
  }
  applyMusicGain(2.5);
  if (!musicTimer) scheduleMusicBar();
}

export function stopMusic() {
  musicWanted = false;
  applyMusicGain(0.8);
  clearTimeout(musicTimer);
  musicTimer = null;
}

/**
 * Pull the music down while the robot speaks or listens, and bring it back
 * afterwards.
 */
export function duckMusic(ducked) {
  if (musicDucked === ducked) return;
  musicDucked = ducked;
  applyMusicGain(ducked ? 0.25 : 1.4);
}

export function isMusicPlaying() {
  return musicWanted;
}
