import { describe, it, expect, beforeEach } from 'vitest'
import { nextQuestion, randomNumbers, answerTo } from '@/game/questions'
import { NUMBER_RANGES } from '@/config/gameConfig'

describe('choosing a sum', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps both numbers inside the range for the level', () => {
    for (const level of ['beginner', 'medium', 'expert']) {
      const range = NUMBER_RANGES.times[level]
      for (let i = 0; i < 200; i++) {
        const { number1, number2 } = randomNumbers('times', level)
        expect(number1).toBeGreaterThanOrEqual(range.min1)
        expect(number1).toBeLessThanOrEqual(range.max1)
        expect(number2).toBeGreaterThanOrEqual(range.min2)
        expect(number2).toBeLessThanOrEqual(range.max2)
      }
    }
  })

  it('only asks divisions that come out as a whole number', () => {
    for (const level of ['beginner', 'medium', 'expert']) {
      for (let i = 0; i < 200; i++) {
        const { number1, number2 } = randomNumbers('divide', level)
        expect(number2).toBeGreaterThan(0)
        expect(Number.isInteger(answerTo(number1, number2, 'divide'))).toBe(true)
      }
    }
  })

  it('works out the answer for each kind of sum', () => {
    expect(answerTo(7, 8, 'times')).toBe(56)
    expect(answerTo(7, 8, 'plus')).toBe(15)
    expect(answerTo(8, 7, 'minus')).toBe(1)
    expect(answerTo(56, 8, 'divide')).toBe(7)
  })

  it('asks the chosen kind of sum at the chosen level in random mode', () => {
    const question = nextQuestion({ operator: 'plus', level: 'medium', autoLevel: 'medium', mode: 'random' })
    expect(question.operator).toBe('plus')
    expect(question.level).toBe('medium')
    expect(question.levelChange).toBe(null)
  })

  it('uses the Auto level when the level is Auto', () => {
    const question = nextQuestion({ operator: 'times', level: 'auto', autoLevel: 'beginner', mode: 'random' })
    expect(['beginner', 'medium', 'expert']).toContain(question.level)
    expect(question.autoLevel).toBe(question.level)
  })
})
