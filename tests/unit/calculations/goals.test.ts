import { describe, expect, it } from 'vitest'
import { calcGoalETA, calcRequiredMonthly } from '@/lib/calculations/goals'

describe('lib/calculations/goals', () => {
  describe('calcGoalETA', () => {
    it('TC-U-019 (AC-7.1): months = (target - saved) / monthlyContrib', () => {
      const result = calcGoalETA({
        target: 6_000_000,
        saved: 1_000_000,
        monthlyContrib: 500_000,
      })
      expect(result.months).toBe(10)
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.overdue).toBe(false)
    })

    it('TC-U-021 (EC-3): targetDate in the past → overdue=true, estimatedDate non-null', () => {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const result = calcGoalETA({
        target: 1_000_000,
        saved: 0,
        monthlyContrib: 100_000,
        targetDate: oneMonthAgo.toISOString().slice(0, 10),
      })
      expect(result.overdue).toBe(true)
      expect(result.estimatedDate).not.toBeNull()
    })

    it('AC-7.1: already saved equals target → months=0, overdue=false', () => {
      const result = calcGoalETA({
        target: 1_000_000,
        saved: 1_000_000,
        monthlyContrib: 100_000,
      })
      expect(result.months).toBe(0)
      expect(result.overdue).toBe(false)
    })

    it('AC-7.1: zero monthlyContrib with shortfall returns Infinity (no NaN)', () => {
      const result = calcGoalETA({
        target: 1_000_000,
        saved: 0,
        monthlyContrib: 0,
      })
      expect(result.months).toBe(Number.POSITIVE_INFINITY)
      expect(result.estimatedDate).toBeNull()
    })
  })

  describe('calcRequiredMonthly', () => {
    it('TC-U-020 (AC-7.2): required monthly to reach target by targetDate', () => {
      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
      const result = calcRequiredMonthly({
        target: 3_000_000,
        saved: 0,
        monthlyContrib: 0,
        targetDate: sixMonthsFromNow.toISOString().slice(0, 10),
      })
      // 3M / 6 months = 500K. Allow ±1 month variance for date-boundary edge cases.
      expect(result).toBeGreaterThanOrEqual(428_571) // 3M / 7
      expect(result).toBeLessThanOrEqual(600_000) // 3M / 5
    })
  })
})
