/**
 * Game configuration constants
 */

export const OPERATORS = {
  TIMES: 'times',
  PLUS: 'plus',
  MINUS: 'minus',
  DIVIDE: 'divide'
};

export const LEVELS = {
  BEGINNER: 'beginner',
  MEDIUM: 'medium',
  EXPERT: 'expert'
};

export const OPERATOR_SYMBOLS = {
  [OPERATORS.TIMES]: '×',
  [OPERATORS.PLUS]: '+',
  [OPERATORS.MINUS]: '−',
  [OPERATORS.DIVIDE]: '÷'
};

/**
 * Number ranges for each operator and difficulty level
 */
export const NUMBER_RANGES = {
  [OPERATORS.TIMES]: {
    [LEVELS.BEGINNER]: { min1: 1, max1: 12, min2: 1, max2: 12 },
    [LEVELS.MEDIUM]: { min1: 3, max1: 12, min2: 3, max2: 12 },
    [LEVELS.EXPERT]: { min1: 5, max1: 20, min2: 5, max2: 20 }
  },
  [OPERATORS.PLUS]: {
    [LEVELS.BEGINNER]: { min1: 1, max1: 50, min2: 1, max2: 50 },
    [LEVELS.MEDIUM]: { min1: 1, max1: 100, min2: 1, max2: 100 },
    [LEVELS.EXPERT]: { min1: 1, max1: 1000, min2: 1, max2: 1000 }
  },
  [OPERATORS.MINUS]: {
    [LEVELS.BEGINNER]: { min1: 10, max1: 20, min2: 1, max2: 10 },
    [LEVELS.MEDIUM]: { min1: 20, max1: 100, min2: 1, max2: 20 },
    [LEVELS.EXPERT]: { min1: 100, max1: 500, min2: 1, max2: 100 }
  },
  [OPERATORS.DIVIDE]: {
    // Division uses multiplier ranges to ensure whole number results
    [LEVELS.BEGINNER]: { min1: 1, max1: 10, min2: 1, max2: 10 },
    [LEVELS.MEDIUM]: { min1: 2, max1: 12, min2: 2, max2: 12 },
    [LEVELS.EXPERT]: { min1: 3, max1: 15, min2: 3, max2: 15 }
  }
};

/**
 * Feedback phrases
 */
export const PHRASES = {
  ENCOURAGEMENT: [
    "Well done!",
    "Great work!",
    "Good job!",
    "Keep up the good work!",
    "You've really got this!",
    "Amazing!",
    "Fantastic!",
    "Superb!",
    "Brilliant!",
    "Excellent work!"
  ],
  CORRECT: [
    "That's correct",
    "That's right",
    "Exactly!",
    "Flawless",
    "Perfect",
    "Spot on!",
    "Nailed it!",
    "You got it!"
  ],
  INCORRECT: [
    "Not quite",
    "Maybe next time",
    "I'm sure you can get the next one right",
    "Incorrect",
    "Close, but not quite",
    "Almost there!",
    "Give it another try!"
  ],
  STREAK: [
    "You're on fire!",
    "Unstoppable!",
    "What a streak!",
    "Math genius!",
    "Incredible run!"
  ],
  HINTS: [
    "Take your time!",
    "Think step by step.",
    "You can do this!"
  ]
};

/**
 * API configuration
 */
export const API_CONFIG = {
  TIMEOUT_MS: 10000,
  TTS_VOICE: 'en-GB-RyanNeural',
  TTS_STYLE: 'default',
  SPEECH_LANGUAGE: 'en-GB'
};

/**
 * UI configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  TYPING_DEBOUNCE_MS: 400,
  LAUGH_DURATION_MS: 1500
};

/**
 * Scoring configuration
 */
export const SCORING = {
  BASE_POINTS: 1,
  STREAK_BONUS_THRESHOLD: 3,
  STREAK_BONUS_MULTIPLIER: 0.5, // Extra 50% per streak level
  MAX_STREAK_BONUS: 3, // Cap at 3x multiplier
  LEVEL_MULTIPLIER: {
    [LEVELS.BEGINNER]: 1,
    [LEVELS.MEDIUM]: 1.5,
    [LEVELS.EXPERT]: 2
  }
};

/**
 * Sound effect types
 */
export const SOUNDS = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  STREAK: 'streak',
  MILESTONE: 'milestone'
};
