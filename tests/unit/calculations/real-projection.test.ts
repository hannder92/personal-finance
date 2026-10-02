// Feature: 20261002-proyecciones-reales · T-001
import { describe, expect, it } from 'vitest'
import { COLOMBIA_REFERENCE } from '@/lib/calculations/assumptions-reference'
import {
  inflateToMonth,
  isOptimisticRealRate,
  monthlyRate,
  monthsToReach,
  realRatePercent,
  requiredMonthlyFor,
} from '@/lib/calculations/real-projection'

const goal = { targetToday: 100_000_000, balance: 20_000_000, monthlyContrib: 1_500_000 }

describe('lib/calculations/real-projection (20261002-proyecciones-reales)', () => {
  it('R-1: monthly rate is the effective-annual equivalent', () => {
    expect(monthlyRate(0)).toBe(0)
    expect((1 + monthlyRate(12)) ** 12).toBeCloseTo(1.12, 12)
  })

  it('TC-U-001 (AC-1.4): real rate by Fisher and optimistic flag above 7%', () => {
    expect(realRatePercent(9, 5)).toBeCloseTo(3.8095, 4)
    expect(realRatePercent(13, 5)).toBeCloseTo(7.619, 3)
    expect(isOptimisticRealRate(9, 5)).toBe(false)
    expect(isOptimisticRealRate(13, 5)).toBe(true)
    expect(realRatePercent(3, 5)).toBeLessThan(0)
  })

  it('TC-U-002 (AC-3.2): 100M today at 5% inflation equals 127,628,156 in 60 months', () => {
    expect(Math.round(inflateToMonth(100_000_000, 60, 5))).toBe(127_628_156)
    expect(inflateToMonth(100_000_000, 60, 0)).toBe(100_000_000)
  })

  it('TC-U-003 (AC-3.3): months to reach with return, inflation only, and neutral', () => {
    expect(monthsToReach({ ...goal, annualReturnPercent: 9, inflationPercent: 5 })).toBe(53)
    expect(monthsToReach({ ...goal, annualReturnPercent: 0, inflationPercent: 5 })).toBe(79)
    expect(monthsToReach({ ...goal, annualReturnPercent: 0, inflationPercent: 0 })).toBe(54)
  })

  it('R-4/R-6: reached, no contribution, and unreachable cases', () => {
    expect(
      monthsToReach({ ...goal, balance: 100_000_000, annualReturnPercent: 9, inflationPercent: 5 })
    ).toBe(0)
    expect(
      monthsToReach({ ...goal, monthlyContrib: 0, annualReturnPercent: 0, inflationPercent: 0 })
    ).toBeNull()
    // Inflation outpaces flat contributions forever → unreachable within 100 years (EC-5).
    expect(
      monthsToReach({
        targetToday: 1_200_000_000,
        balance: 50_000_000,
        monthlyContrib: 2_000_000,
        annualReturnPercent: 0,
        inflationPercent: 5,
      })
    ).toBeNull()
  })

  it('TC-U-004 (AC-3.4): required monthly for 60 months', () => {
    const base = { targetToday: 100_000_000, balance: 20_000_000, months: 60 }
    expect(
      Math.round(requiredMonthlyFor({ ...base, annualReturnPercent: 9, inflationPercent: 5 }))
    ).toBe(1_296_025)
    expect(
      Math.round(requiredMonthlyFor({ ...base, annualReturnPercent: 0, inflationPercent: 5 }))
    ).toBe(1_793_803)
    expect(
      Math.round(requiredMonthlyFor({ ...base, annualReturnPercent: 0, inflationPercent: 0 }))
    ).toBe(1_333_333)
  })

  it('EC-3: required monthly with no months left is the full shortfall; never negative', () => {
    expect(
      requiredMonthlyFor({
        targetToday: 100,
        balance: 40,
        months: 0,
        annualReturnPercent: 9,
        inflationPercent: 5,
      })
    ).toBe(60)
    expect(
      requiredMonthlyFor({
        targetToday: 100,
        balance: 500,
        months: 12,
        annualReturnPercent: 9,
        inflationPercent: 5,
      })
    ).toBe(0)
  })

  it('TC-U-031 (AC-1.2): Colombia reference values', () => {
    expect(COLOMBIA_REFERENCE).toMatchObject({
      inflationPercent: 5,
      annualReturnPercent: 9,
      withdrawalRatePercent: 4,
      asOf: '2026-10',
    })
  })
})
