/**
 * Problem History Service
 * Tracks and stores problem history for review
 */

const HISTORY_KEY = 'olivermath_problem_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Get problem history from localStorage
 * @returns {Array} Array of problem records
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a problem to history
 * @param {Object} problem - Problem record to add
 * @param {string} problem.question - The math question asked
 * @param {number} problem.num1 - First number
 * @param {string} problem.operator - Operator symbol
 * @param {number} problem.num2 - Second number
 * @param {number} problem.correctAnswer - The correct answer
 * @param {string} problem.userAnswer - What the user said
 * @param {number|null} problem.interpretedAnswer - Interpreted numeric answer
 * @param {boolean} problem.isCorrect - Whether the answer was correct
 * @param {string} problem.difficulty - Difficulty level
 * @param {number} problem.timestamp - When the problem was answered
 */
export function addToHistory(problem) {
  try {
    const history = getHistory();
    
    // Add new problem at the beginning
    history.unshift({
      id: Date.now(),
      question: problem.question,
      num1: problem.num1,
      operator: problem.operator,
      num2: problem.num2,
      correctAnswer: problem.correctAnswer,
      userAnswer: problem.userAnswer || '',
      interpretedAnswer: problem.interpretedAnswer,
      isCorrect: problem.isCorrect,
      difficulty: problem.difficulty,
      timestamp: problem.timestamp || Date.now(),
    });
    
    // Keep only the last MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    return true;
  } catch {
    console.error('Failed to save problem to history');
    return false;
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get history statistics
 * @returns {Object} Statistics about problem history
 */
export function getHistoryStats() {
  const history = getHistory();
  
  if (history.length === 0) {
    return {
      total: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      byOperator: {},
      byDifficulty: {},
    };
  }
  
  const correct = history.filter((p) => p.isCorrect).length;
  const incorrect = history.length - correct;
  
  // Group by operator
  const byOperator = {};
  history.forEach((p) => {
    if (!byOperator[p.operator]) {
      byOperator[p.operator] = { total: 0, correct: 0 };
    }
    byOperator[p.operator].total++;
    if (p.isCorrect) byOperator[p.operator].correct++;
  });
  
  // Group by difficulty
  const byDifficulty = {};
  history.forEach((p) => {
    if (!byDifficulty[p.difficulty]) {
      byDifficulty[p.difficulty] = { total: 0, correct: 0 };
    }
    byDifficulty[p.difficulty].total++;
    if (p.isCorrect) byDifficulty[p.difficulty].correct++;
  });
  
  return {
    total: history.length,
    correct,
    incorrect,
    accuracy: Math.round((correct / history.length) * 100),
    byOperator,
    byDifficulty,
  };
}

/**
 * Get recent incorrect problems for practice
 * @param {number} limit - Number of problems to return
 * @returns {Array} Array of incorrect problems
 */
export function getIncorrectProblems(limit = 10) {
  const history = getHistory();
  return history.filter((p) => !p.isCorrect).slice(0, limit);
}

/**
 * Format timestamp to readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date/time string
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Get operator display symbol
 * @param {string} operator - Operator key
 * @returns {string} Display symbol
 */
export function getOperatorSymbol(operator) {
  const symbols = {
    '+': '+',
    '-': '−',
    '×': '×',
    '÷': '÷',
    '*': '×',
    '/': '÷',
  };
  return symbols[operator] || operator;
}
/**
 * Filter history by operator
 * @param {string} operator - Operator to filter by
 * @returns {Array} Filtered problems
 */
export function getHistoryByOperator(operator) {
  if (!operator) return getHistory();
  const history = getHistory();
  return history.filter((p) => p.operator === operator);
}

/**
 * Filter history by difficulty
 * @param {string} difficulty - Difficulty to filter by
 * @returns {Array} Filtered problems
 */
export function getHistoryByDifficulty(difficulty) {
  if (!difficulty) return getHistory();
  const history = getHistory();
  return history.filter((p) => p.difficulty === difficulty);
}

/**
 * Filter history by status (correct/incorrect)
 * @param {string} status - 'correct', 'incorrect', or null for all
 * @returns {Array} Filtered problems
 */
export function getHistoryByStatus(status) {
  const history = getHistory();
  if (status === 'correct') return history.filter((p) => p.isCorrect);
  if (status === 'incorrect') return history.filter((p) => !p.isCorrect);
  return history;
}

/**
 * Get performance stats for a specific operator
 * @param {string} operator - Operator to analyze
 * @returns {Object} Performance metrics
 */
export function getOperatorStats(operator) {
  const filtered = getHistoryByOperator(operator);
  if (filtered.length === 0) {
    return { operator, total: 0, correct: 0, accuracy: 0 };
  }
  const correct = filtered.filter((p) => p.isCorrect).length;
  return {
    operator,
    total: filtered.length,
    correct,
    accuracy: Math.round((correct / filtered.length) * 100),
  };
}

/**
 * Get performance stats for a specific difficulty
 * @param {string} difficulty - Difficulty to analyze
 * @returns {Object} Performance metrics
 */
export function getDifficultyStats(difficulty) {
  const filtered = getHistoryByDifficulty(difficulty);
  if (filtered.length === 0) {
    return { difficulty, total: 0, correct: 0, accuracy: 0 };
  }
  const correct = filtered.filter((p) => p.isCorrect).length;
  return {
    difficulty,
    total: filtered.length,
    correct,
    accuracy: Math.round((correct / filtered.length) * 100),
  };
}

/**
 * Get all operators with their stats
 * @returns {Array} Array of operator stats
 */
export function getAllOperatorStats() {
  const history = getHistory();
  const operators = new Set(history.map((p) => p.operator));
  return Array.from(operators).map((op) => getOperatorStats(op));
}

/**
 * Get all difficulties with their stats
 * @returns {Array} Array of difficulty stats
 */
export function getAllDifficultyStats() {
  const history = getHistory();
  const difficulties = new Set(history.map((p) => p.difficulty));
  return Array.from(difficulties).map((diff) => getDifficultyStats(diff));
}

/**
 * Get combined stats for multiple filters
 * @param {Object} filters - Filter options
 * @param {string} filters.operator - Filter by operator
 * @param {string} filters.difficulty - Filter by difficulty
 * @param {string} filters.status - Filter by status (correct/incorrect)
 * @returns {Object} Combined stats
 */
export function getFilteredStats(filters = {}) {
  let filtered = getHistory();
  
  if (filters.operator) {
    filtered = filtered.filter((p) => p.operator === filters.operator);
  }
  
  if (filters.difficulty) {
    filtered = filtered.filter((p) => p.difficulty === filters.difficulty);
  }
  
  if (filters.status === 'correct') {
    filtered = filtered.filter((p) => p.isCorrect);
  } else if (filters.status === 'incorrect') {
    filtered = filtered.filter((p) => !p.isCorrect);
  }
  
  if (filtered.length === 0) {
    return { total: 0, correct: 0, accuracy: 0, data: [] };
  }
  
  const correct = filtered.filter((p) => p.isCorrect).length;
  return {
    total: filtered.length,
    correct,
    incorrect: filtered.length - correct,
    accuracy: Math.round((correct / filtered.length) * 100),
    data: filtered,
  };
}

/**
 * Get weak operators (lowest accuracy)
 * @param {number} minAttempts - Minimum attempts to qualify as weak
 * @returns {Array} Array of operators sorted by accuracy (worst first)
 */
export function getWeakOperators(minAttempts = 3) {
  const stats = getAllOperatorStats();
  return stats
    .filter((op) => op.total >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Get recent failures (last 7 days)
 * @returns {Array} Array of incorrect problems from past 7 days
 */
export function getRecentFailures() {
  const history = getHistory();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((p) => !p.isCorrect && p.timestamp > sevenDaysAgo);
}

/**
 * Get recent session accuracy for adaptive difficulty
 * @param {string} operator - Current operator
 * @param {string} difficulty - Current difficulty level
 * @param {number} recentCount - Number of recent problems to consider
 * @returns {Object} { accuracy, total, shouldEscalate, shouldDeescalate }
 */
export function getRecentSessionAccuracy(operator, difficulty, recentCount = 10) {
  const history = getHistory();
  const operatorSymbol = {
    'plus': '+', 'minus': '−', 'times': '×', 'divide': '÷'
  }[operator] || operator;
  
  const recent = history
    .filter((p) => p.operator === operatorSymbol && p.difficulty === difficulty)
    .slice(0, recentCount);
  
  if (recent.length < 5) {
    return { accuracy: 0, total: recent.length, shouldEscalate: false, shouldDeescalate: false };
  }
  
  const correct = recent.filter((p) => p.isCorrect).length;
  const accuracy = Math.round((correct / recent.length) * 100);
  
  return {
    accuracy,
    total: recent.length,
    shouldEscalate: accuracy >= 90,
    shouldDeescalate: accuracy < 60,
  };
}

/**
 * Get recommended difficulty based on recent performance
 * @param {string} operator - Current operator
 * @param {string} currentDifficulty - Current difficulty level
 * @returns {Object} { recommended, reason }
 */
export function getRecommendedDifficulty(operator, currentDifficulty) {
  const session = getRecentSessionAccuracy(operator, currentDifficulty);
  const levels = ['beginner', 'medium', 'expert'];
  const currentIndex = levels.indexOf(currentDifficulty);
  
  if (session.shouldEscalate && currentIndex < levels.length - 1) {
    return {
      recommended: levels[currentIndex + 1],
      reason: 'high_accuracy',
      accuracy: session.accuracy,
    };
  }
  
  if (session.shouldDeescalate && currentIndex > 0) {
    return {
      recommended: levels[currentIndex - 1],
      reason: 'low_accuracy',
      accuracy: session.accuracy,
    };
  }
  
  return {
    recommended: currentDifficulty,
    reason: 'optimal',
    accuracy: session.accuracy,
  };
}

/**
 * Get a problem using spaced repetition algorithm
 * @param {string} selectedOperator - User-selected operator or null for any
 * @param {string} selectedDifficulty - User-selected difficulty
 * @returns {Object|null} { type, problem, operator, difficulty } or null for random
 */
export function getSpacedRepetitionProblem(selectedOperator, selectedDifficulty) {
  const random = Math.random() * 100;
  
  // 70% random problems, 20% recent failures, 10% weak operators
  if (random < 70) {
    return null; // Use random generation
  }
  
  if (random < 90) {
    // 20% - Retry recent failure
    const failures = getRecentFailures();
    if (failures.length > 0) {
      const problem = failures[Math.floor(Math.random() * failures.length)];
      return {
        type: 'retry_failure',
        num1: problem.num1,
        num2: problem.num2,
        operator: problem.operator,
        difficulty: problem.difficulty,
      };
    }
  }
  
  // 10% - Practice weak operator
  const weakOps = getWeakOperators(5);
  if (weakOps.length > 0) {
    const weakest = weakOps[0];
    return {
      type: 'weak_operator',
      operator: weakest.operator,
      difficulty: selectedDifficulty,
      generateNew: true,
    };
  }
  
  return null; // Fall back to random
}