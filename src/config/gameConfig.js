/**
 * Game configuration constants
 */

export const OPERATORS = {
  TIMES: 'times',
  PLUS: 'plus',
  MINUS: 'minus'
};

export const LEVELS = {
  BEGINNER: 'beginner',
  MEDIUM: 'medium',
  EXPERT: 'expert'
};

export const OPERATOR_SYMBOLS = {
  [OPERATORS.TIMES]: '×',
  [OPERATORS.PLUS]: '+',
  [OPERATORS.MINUS]: '−'
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
    "Fantastic!"
  ],
  CORRECT: [
    "That's correct",
    "That's right",
    "Exactly!",
    "Flawless",
    "Perfect"
  ],
  INCORRECT: [
    "Not quite",
    "Maybe next time",
    "I'm sure you can get the next one right",
    "Incorrect",
    "Close, but not quite"
  ]
};

/**
 * API configuration
 */
export const API_CONFIG = {
  TIMEOUT_MS: 10000,
  TTS_VOICE: 'en-US-AnaNeural',
  TTS_STYLE: 'friendly',
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
