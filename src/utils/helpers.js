/**
 * Utility functions for the math game
 */

/**
 * Get a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random item from an array
 * @param {Array} arr - The array to pick from
 * @returns {*}
 */
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Calculate the expected result based on operator
 * @param {number} num1 - First number
 * @param {number} num2 - Second number
 * @param {string} operator - The operator (times, plus, minus, divide)
 * @returns {number}
 */
export function calculateResult(num1, num2, operator) {
  switch (operator) {
    case 'plus':
      return num1 + num2;
    case 'minus':
      return num1 - num2;
    case 'divide':
      return num1 / num2;
    case 'times':
    default:
      return num1 * num2;
  }
}

/**
 * Extract a number from a string (for speech recognition)
 * @param {string} text - The text to parse
 * @returns {number|null}
 */
export function extractNumber(text) {
  if (!text) return null;
  const match = String(text).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize text for display (prevent XSS)
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
export function sanitizeText(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Format stars count with proper pluralization
 * @param {number} count - Number of stars
 * @returns {string}
 */
export function formatStars(count) {
  return `${count} star${count === 1 ? '' : 's'}`;
}
