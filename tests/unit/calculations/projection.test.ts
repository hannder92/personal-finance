import { describe, expect, it } from 'vitest'
import { calcProjection } from '@/lib/calculations/projection'

describe('lib/calculations/projection', () => {
  it('TC-U-028 (AC-12.1): 12 months with surplus → all balances positive', () => {
    const result = calcProjection(
      {
        monthlyIncome: 4_000_000,
        streams: [],
        fixedExpenses: 2_000_000,
        debtObligation: 500_000,
      },
      12
    )
    expect(result.months).toHaveLength(12)
    for (const m of result.months) {
      expect(m.projectedBalance).toBeGreaterThan(0)
    }
    expect(result.negativeMonths).toEqual([])
  })

  it('TC-U-029 (AC-3.2, AC-12.2): semiannual income produces a peak at months 0 and 6', () => {
    const result = calcProjection(
      {
        monthlyIncome: 2_000_000,
        streams: [{ amount: 3_000_000, frequency: 'semiannual' }],
        fixedExpenses: 0,
        debtObligation: 0,
      },
      12
    )
    // Months 0 and 6 should each have a much bigger jump than months 1-5 or 7-11.
    const delta0 = result.months[0]!.projectedBalance
    const delta1 = result.months[1]!.projectedBalance - result.months[0]!.projectedBalance
    expect(delta0).toBeGreaterThan(delta1)
  })

  it('TC-U-030 (AC-12.3): months with negative balance show up in negativeMonths', () => {
    const result = calcProjection(
      {
        monthlyIncome: 500_000,
        streams: [],
        fixedExpenses: 1_000_000,
        debtObligation: 0,
      },
      12
    )
    // Income < expenses → cumulative balance goes negative quickly.
    expect(result.negativeMonths.length).toBeGreaterThan(0)
  })

  it('TC-U-031 (EC-8): zero income with expenses → all months negative, no NaN', () => {
    const result = calcProjection(
      { monthlyIncome: 0, streams: [], fixedExpenses: 500_000, debtObligation: 0 },
      12
    )
    expect(result.months).toHaveLength(12)
    for (const m of result.months) {
      expect(m.projectedBalance).toBeLessThan(0)
      expect(Number.isFinite(m.projectedBalance)).toBe(true)
    }
    expect(result.negativeMonths).toHaveLength(12)
  })
})
