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

// Feature: 20261002-proyecciones-reales · T-003
describe('lib/calculations/financial-freedom — real projections', () => {
  const base = {
    monthlyLivingExpense: 4_000_000,
    liquidAssets: 50_000_000,
    monthlyFeasibleSavings: 2_000_000,
  }
  const assumptions = { annualReturnPercent: 9, inflationPercent: 5, withdrawalRatePercent: 4 }

  it('TC-U-010 (AC-2.1): capital needed follows the withdrawal rate', () => {
    expect(calcFinancialFreedom({ ...base, withdrawalRatePercent: 4 }).targetPatrimony).toBe(
      1_200_000_000
    )
    expect(
      Math.round(calcFinancialFreedom({ ...base, withdrawalRatePercent: 3.5 }).targetPatrimony)
    ).toBe(1_371_428_571)
  })

  it('TC-U-011 (AC-2.2): months with return and inflation; neutral equals legacy', () => {
    expect(calcFinancialFreedom({ ...base, ...assumptions }).monthsToTarget).toBe(430)
    expect(calcFinancialFreedom(base).monthsToTarget).toBe(575)
  })

  it('TC-U-012 (AC-2.3): required monthly for the desired horizon', () => {
    const r20 = calcFinancialFreedom({ ...base, ...assumptions, desiredYears: 20 })
    expect(Math.round(r20.requiredMonthlyForDesired)).toBe(4_545_244)
    expect(r20.currentSavingsSuffices).toBe(false)
    const r10 = calcFinancialFreedom({ ...base, ...assumptions, desiredYears: 10 })
    expect(Math.round(r10.requiredMonthlyForDesired)).toBe(9_679_098)
    const rich = calcFinancialFreedom({
      ...base,
      ...assumptions,
      monthlyFeasibleSavings: 5_000_000,
    })
    expect(rich.currentSavingsSuffices).toBe(true)
  })

  it('TC-U-013 (AC-2.4): months without return for the benefit comparison', () => {
    const r = calcFinancialFreedom({ ...base, ...assumptions })
    expect(r.monthsWithoutReturn).toBeNull()
    const noInflation = calcFinancialFreedom({
      ...base,
      annualReturnPercent: 9,
      inflationPercent: 0,
    })
    expect(noInflation.monthsToTarget).toBe(210)
    expect(noInflation.monthsWithoutReturn).toBe(575)
  })

  it('TC-U-014 (AC-2.6): unreachable without return when inflation outpaces savings', () => {
    const r = calcFinancialFreedom({ ...base, annualReturnPercent: 0, inflationPercent: 5 })
    expect(r.monthsToTarget).toBeNull()
    expect(r.targetReached).toBe(false)
    expect(r.requiredMonthlyForDesired).toBeGreaterThan(0)
  })
})
