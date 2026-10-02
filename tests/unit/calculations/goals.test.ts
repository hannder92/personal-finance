import { describe, expect, it } from 'vitest'
import { calcGoalETA, calcRequiredMonthly, monthsUntil } from '@/lib/calculations/goals'

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

// Feature: 20261002-proyecciones-reales · T-003
describe('lib/calculations/goals — real projections', () => {
  const now = new Date(2026, 9, 2)
  const goal = {
    target: 100_000_000,
    saved: 20_000_000,
    monthlyContrib: 1_500_000,
    targetDate: '2031-10-15',
  }
  const invested = { annualReturnPercent: 9, inflationPercent: 5 }
  const inflationOnly = { annualReturnPercent: 0, inflationPercent: 5 }

  it('TC-U-003 (AC-3.3): ETA months with return, inflation only and neutral', () => {
    expect(calcGoalETA(goal, now, invested).months).toBe(53)
    expect(calcGoalETA(goal, now, inflationOnly).months).toBe(79)
    expect(calcGoalETA(goal, now).months).toBe(54)
  })

  it('TC-U-005 (AC-3.5): on track when invested, behind schedule otherwise', () => {
    expect(calcGoalETA(goal, now, invested).behindSchedule).toBe(false)
    expect(calcGoalETA(goal, now, inflationOnly).behindSchedule).toBe(true)
  })

  it('TC-U-004 (AC-3.4): required monthly honours assumptions', () => {
    expect(Math.round(calcRequiredMonthly(goal, now, invested))).toBe(1_296_025)
    expect(Math.round(calcRequiredMonthly(goal, now, inflationOnly))).toBe(1_793_803)
    expect(Math.round(calcRequiredMonthly(goal, now))).toBe(1_333_333)
  })

  it('TC-U-002 (AC-3.2): monthsUntil uses the calendar month difference', () => {
    expect(monthsUntil('2031-10-15', now)).toBe(60)
    expect(monthsUntil('2026-08-01', now)).toBe(-2)
  })

  it('EC-5: unreachable goal has infinite ETA and no date', () => {
    const eta = calcGoalETA(
      { target: 1_200_000_000, saved: 50_000_000, monthlyContrib: 2_000_000, targetDate: null },
      now,
      inflationOnly
    )
    expect(eta.months).toBe(Number.POSITIVE_INFINITY)
    expect(eta.estimatedDate).toBeNull()
  })
})
