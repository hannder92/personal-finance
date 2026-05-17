// Tests for lib/calculations/savings-projection.
// Feature: 20260515-fix-calculos-financieros · Covers AC-8.1, AC-8.2, AC-8.6, EC-8, EC-10.
// The lib stubs (from T-001) return empty arrays. Every assertion below FAILS — confirmed RED.
// Full impl lands in T-018.

import { describe, expect, it } from 'vitest'
import {
  calcCompoundGrowth,
  calcHypotheticalSavings,
} from '@/lib/calculations/savings-projection'

describe('lib/calculations/savings-projection — calcHypotheticalSavings', () => {
  it('TC-U-017 (AC-8.1): linear accumulation — netIncome × rate% × month', () => {
    // 10M × 20% × 12 = 24M at month 12; per-month increment = 2M.
    const result = calcHypotheticalSavings({
      netIncome: 10_000_000,
      savingsRatePercent: 20,
      monthsAhead: 12,
    })
    expect(result).toHaveLength(12)
    expect(result[0]).toEqual({ month: 0, cumulativeAmount: 2_000_000 })
    expect(result[5]).toEqual({ month: 5, cumulativeAmount: 12_000_000 })
    expect(result[11]).toEqual({ month: 11, cumulativeAmount: 24_000_000 })
  })

  it('TC-U-017 (AC-8.1): output is monotonically non-decreasing', () => {
    const result = calcHypotheticalSavings({
      netIncome: 5_000_000,
      savingsRatePercent: 10,
      monthsAhead: 6,
    })
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.cumulativeAmount).toBeGreaterThanOrEqual(result[i - 1]!.cumulativeAmount)
    }
  })

  it('TC-U-017 (EC): monthsAhead = 0 returns empty array', () => {
    const result = calcHypotheticalSavings({
      netIncome: 10_000_000,
      savingsRatePercent: 20,
      monthsAhead: 0,
    })
    expect(result).toEqual([])
  })

  it('TC-U-017 (EC): negative netIncome → clamped to 0, no negative accumulation', () => {
    const result = calcHypotheticalSavings({
      netIncome: -5_000_000,
      savingsRatePercent: 20,
      monthsAhead: 3,
    })
    expect(result).toHaveLength(3)
    for (const point of result) {
      expect(point.cumulativeAmount).toBe(0)
    }
  })
})

describe('lib/calculations/savings-projection — calcCompoundGrowth', () => {
  it('TC-U-018 (AC-8.2): single asset @ 12% EA grows ≈ 11.2M from 10M over 12 months', () => {
    const result = calcCompoundGrowth(
      [{ balance: 10_000_000, annualRatePercent: 12 }],
      12
    )
    expect(result).toHaveLength(12)
    // Final month should be approximately 10M × (1.12)^1 = 11.2M (within 1% tolerance).
    expect(result[11]!.totalValue).toBeGreaterThan(11_100_000)
    expect(result[11]!.totalValue).toBeLessThan(11_300_000)
  })

  it('TC-U-019 (AC-8.6): month 12 value > initial balance when rate > 0', () => {
    const initial = 5_000_000
    const result = calcCompoundGrowth([{ balance: initial, annualRatePercent: 8 }], 12)
    expect(result[11]!.totalValue).toBeGreaterThan(initial)
  })

  it('TC-U-024 (EC-8): rate = 0% → flat line (totalValue stays at initial)', () => {
    const result = calcCompoundGrowth(
      [{ balance: 5_000_000, annualRatePercent: 0 }],
      12
    )
    expect(result).toHaveLength(12)
    for (const point of result) {
      expect(point.totalValue).toBe(5_000_000)
    }
  })

  it('TC-U-018 (EC): empty assets array → flat zero series for 12 months', () => {
    const result = calcCompoundGrowth([], 12)
    expect(result).toHaveLength(12)
    for (const point of result) {
      expect(point.totalValue).toBe(0)
    }
  })

  it('TC-U-018 (EC): monthsAhead = 0 returns empty array', () => {
    const result = calcCompoundGrowth([{ balance: 10_000_000, annualRatePercent: 12 }], 0)
    expect(result).toEqual([])
  })

  it('TC-U-018 (EC-10): mixed assets — one at 0%, one at 10% — total growth comes from non-zero asset only', () => {
    // Asset A: 5M @ 0% → stays at 5M.
    // Asset B: 5M @ 10% → grows to ≈ 5.5M at month 12.
    // Combined month-12 total: ≈ 10.5M (within 1% tolerance).
    const result = calcCompoundGrowth(
      [
        { balance: 5_000_000, annualRatePercent: 0 },
        { balance: 5_000_000, annualRatePercent: 10 },
      ],
      12
    )
    expect(result[0]!.totalValue).toBeGreaterThanOrEqual(10_000_000) // month 0 close to initial
    expect(result[11]!.totalValue).toBeGreaterThan(10_400_000)
    expect(result[11]!.totalValue).toBeLessThan(10_600_000)
  })
})
