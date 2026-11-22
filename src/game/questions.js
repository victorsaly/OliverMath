/**
 * Choosing the next sum.
 *
 * Lived inside the game screen's Play handler, tangled with the microphone and
 * the robot's voice, where it could not be tested. It is a plain function now:
 * settings in, a sum out.
 */
import { OPERATORS, LEVELS, NUMBER_RANGES } from '@/config/gameConfig';
import { getRandomInt } from '@/utils/helpers';
import { getRecommendedDifficulty, getSpacedRepetitionProblem } from '@/services/historyService';

const SYMBOL_TO_OPERATOR = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divide' };

/** The right answer to a sum. */
export function answerTo(number1, number2, operator) {
  switch (operator) {
    case 'plus': return number1 + number2;
    case 'minus': return number1 - number2;
    case 'divide': return number1 / number2;
    default: return number1 * number2;
  }
}

/**
 * Two numbers for an operator at a level. Division is built backwards, from a
 * divisor and a whole-number answer, so it always comes out even.
 */
export function randomNumbers(operator, level) {
  const ranges = NUMBER_RANGES[operator]?.[level] || NUMBER_RANGES[OPERATORS.TIMES][LEVELS.BEGINNER];
  if (operator === 'divide') {
    const divisor = getRandomInt(ranges.min2, ranges.max2);
    const quotient = getRandomInt(ranges.min1, ranges.max1);
    return { number1: divisor * quotient, number2: divisor };
  }
  return {
    number1: getRandomInt(ranges.min1, ranges.max1),
    number2: getRandomInt(ranges.min2, ranges.max2)
  };
}

/**
 * @param {Object} settings
 * @param {string} settings.operator   - the kind of sum the child chose
 * @param {string} settings.level      - 'beginner' | 'medium' | 'expert' | 'auto'
 * @param {string} settings.autoLevel  - the level Auto is currently on
 * @param {string} settings.mode       - 'random' | 'weak_operators' | 'recent_failures'
 * @returns {{ number1: number, number2: number, operator: string, level: string,
 *             autoLevel: string, levelChange: 'up'|'down'|null }}
 *   `operator` can differ from the one chosen: the practice modes may bring
 *   back a sum, or a kind of sum, the child has been getting wrong.
 */
export function nextQuestion({ operator, level, autoLevel, mode }) {
  let effectiveLevel = level;
  let nextAutoLevel = autoLevel;
  let levelChange = null;

  if (level === 'auto') {
    const recommendation = getRecommendedDifficulty(operator, autoLevel);
    if (recommendation.recommended !== autoLevel) {
      nextAutoLevel = recommendation.recommended;
      levelChange = recommendation.reason === 'high_accuracy' ? 'up' : 'down';
    }
    effectiveLevel = nextAutoLevel;
  }

  const practice = mode !== 'random' ? getSpacedRepetitionProblem(operator, effectiveLevel, mode) : null;

  if (practice && practice.type === 'retry_failure') {
    // The exact sum that went wrong before.
    return {
      number1: practice.num1,
      number2: practice.num2,
      operator: SYMBOL_TO_OPERATOR[practice.operator] || operator,
      level: effectiveLevel,
      autoLevel: nextAutoLevel,
      levelChange
    };
  }

  const useOperator =
    practice && practice.type === 'weak_operator' ? SYMBOL_TO_OPERATOR[practice.operator] || operator : operator;

  return {
    ...randomNumbers(useOperator, effectiveLevel),
    operator: useOperator,
    level: effectiveLevel,
    autoLevel: nextAutoLevel,
    levelChange
  };
}
