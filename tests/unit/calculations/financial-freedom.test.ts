import { describe, expect, it } from 'vitest'
import { calcFinancialFreedom } from '@/lib/calculations/financial-freedom'

describe('lib/calculations/financial-freedom', () => {
  it('TC-U-002 (AC-5.1–AC-5.4): living expense, target, months to FIRE', () => {
    const result = calcFinancialFreedom({
      monthlyLivingExpense: 4_000_000,
      liquidAssets: 50_000_000,
      monthlyFeasibleSavings: 500_000,
    })
    expect(result.monthlyLivingExpense).toBe(4_000_000)
    expect(result.liquidAssets).toBe(50_000_000)
    expect(result.targetPatrimony).toBe(4_000_000 * 12 * 25)
    expect(result.monthsToTarget).toBe(Math.ceil((4_000_000 * 12 * 25 - 50_000_000) / 500_000))
    expect(result.targetReached).toBe(false)
  })

  it('TC-U-002 (AC-5.4): target already reached', () => {
    const target = 4_000_000 * 12 * 25
    const result = calcFinancialFreedom({
      monthlyLivingExpense: 4_000_000,
      liquidAssets: target,
      monthlyFeasibleSavings: 500_000,
    })
    expect(result.targetReached).toBe(true)
    expect(result.monthsToTarget).toBeNull()
  })
})
