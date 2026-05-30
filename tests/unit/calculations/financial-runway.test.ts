import { describe, expect, it } from 'vitest'
import { calcFinancialRunway } from '@/lib/calculations/financial-runway'
import { calcLiquidAssetsTotal, calcMonthlyLivingExpense } from '@/lib/calculations/liquid-metrics'

describe('lib/calculations/financial-runway', () => {
  it('TC-U-001 (AC-1.1, AC-1.2): 30M liquid / 5M living expense → 6 months', () => {
    const result = calcFinancialRunway({
      liquidAssets: 30_000_000,
      monthlyLivingExpense: 5_000_000,
    })
    expect(result).toEqual({ kind: 'months', value: 6 })
  })

  it('TC-U-001 (AC-1.3): illiquid property excluded — 10M liquid / 2M expense → 5 months', () => {
    const liquid = calcLiquidAssetsTotal([
      { type: 'cash', value: 10_000_000 },
      { type: 'property', value: 100_000_000 },
    ])
    const living = calcMonthlyLivingExpense(2_000_000, 0)
    const result = calcFinancialRunway({
      liquidAssets: liquid,
      monthlyLivingExpense: living,
    })
    expect(result).toEqual({ kind: 'months', value: 5 })
  })

  it('TC-U-001 (AC-1.4): unavailable when liquid is zero', () => {
    const result = calcFinancialRunway({
      liquidAssets: 0,
      monthlyLivingExpense: 5_000_000,
    })
    expect(result).toEqual({ kind: 'unavailable', reason: 'no_liquid' })
  })

  it('TC-U-001 (AC-1.4): unavailable when living expense is zero', () => {
    const result = calcFinancialRunway({
      liquidAssets: 30_000_000,
      monthlyLivingExpense: 0,
    })
    expect(result).toEqual({ kind: 'unavailable', reason: 'no_expense' })
  })
})
