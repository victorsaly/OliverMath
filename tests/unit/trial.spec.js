import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { FREE_SUMS_PER_DAY, sumsLeftToday, sumsUsedToday, countSum, wasUnlocked, rememberUnlocked } from '@/game/trial'

describe('the free version', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 22, 9, 0, 0))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts the day with all its free sums', () => {
    expect(sumsUsedToday()).toBe(0)
    expect(sumsLeftToday()).toBe(FREE_SUMS_PER_DAY)
  })

  it('counts each marked sum and never goes below zero', () => {
    for (let i = 1; i <= FREE_SUMS_PER_DAY; i++) {
      expect(countSum()).toBe(FREE_SUMS_PER_DAY - i)
    }
    expect(sumsLeftToday()).toBe(0)
    expect(countSum()).toBe(0)
  })

  it('gives a fresh set the next day', () => {
    for (let i = 0; i < FREE_SUMS_PER_DAY; i++) countSum()
    expect(sumsLeftToday()).toBe(0)
    vi.setSystemTime(new Date(2026, 10, 23, 7, 30, 0))
    expect(sumsLeftToday()).toBe(FREE_SUMS_PER_DAY)
  })

  it('does not reset at midnight UTC for a child who is not in that time zone', () => {
    vi.setSystemTime(new Date(2026, 10, 22, 23, 50, 0))
    countSum()
    vi.setSystemTime(new Date(2026, 10, 22, 23, 59, 0))
    expect(sumsUsedToday()).toBe(1)
  })

  it('remembers that the full game was unlocked', () => {
    expect(wasUnlocked()).toBe(false)
    rememberUnlocked(true)
    expect(wasUnlocked()).toBe(true)
    rememberUnlocked(false)
    expect(wasUnlocked()).toBe(false)
  })
})
