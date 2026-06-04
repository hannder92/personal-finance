import { describe, expect, it } from 'vitest'
import { calcLiquidAssetsTotal, calcMonthlyLivingExpense } from '@/lib/calculations/liquid-metrics'

describe('lib/calculations/liquid-metrics', () => {
  it('TC-U-001 (AC-1.2): calcMonthlyLivingExpense sums fixed and variable spent', () => {
    expect(calcMonthlyLivingExpense(3_000_000, 2_000_000)).toBe(5_000_000)
  })

  it('TC-U-002 (AC-1.3, AC-2.2, AC-6.6): calcLiquidAssetsTotal includes cash, savings, investment only', () => {
    const total = calcLiquidAssetsTotal([
      { type: 'cash', value: 0 },
      { type: 'savings', value: 0 },
      { type: 'investment', value: 50_000_000 },
      { type: 'property', value: 1_000_000 },
    ])
    expect(total).toBe(50_000_000)
  })

  it('TC-U-002 (AC-1.3): illiquid asset types are excluded from liquid total', () => {
    const total = calcLiquidAssetsTotal([
      { type: 'cash', value: 10_000_000 },
      { type: 'property', value: 100_000_000 },
      { type: 'vehicle', value: 20_000_000 },
    ])
    expect(total).toBe(10_000_000)
  })
})
