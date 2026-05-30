import { describe, expect, it } from 'vitest'
import { calcPassiveCoverage } from '@/lib/calculations/passive-coverage'

describe('lib/calculations/passive-coverage', () => {
  it('TC-U-005 (AC-4.1, AC-4.3): 30% coverage with 7M monthly gap', () => {
    const result = calcPassiveCoverage({
      monthlyPassive: 2_000_000,
      monthlyResidual: 1_000_000,
      monthlyLivingExpense: 10_000_000,
    })
    expect(result.coveragePercent).toBe(30)
    expect(result.monthlyGap).toBe(7_000_000)
    expect(result.isFullyCovered).toBe(false)
  })

  it('TC-U-005 (AC-4.2): fully covered when passive+residual ≥ living expense', () => {
    const result = calcPassiveCoverage({
      monthlyPassive: 8_000_000,
      monthlyResidual: 4_000_000,
      monthlyLivingExpense: 10_000_000,
    })
    expect(result.coveragePercent).toBe(120)
    expect(result.monthlyGap).toBe(0)
    expect(result.isFullyCovered).toBe(true)
  })

  it('TC-U-005 (AC-4.1): zero coverage when no passive or residual income', () => {
    const result = calcPassiveCoverage({
      monthlyPassive: 0,
      monthlyResidual: 0,
      monthlyLivingExpense: 10_000_000,
    })
    expect(result.coveragePercent).toBe(0)
    expect(result.monthlyGap).toBe(10_000_000)
    expect(result.isFullyCovered).toBe(false)
  })
})
