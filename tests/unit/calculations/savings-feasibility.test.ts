import { describe, expect, it } from 'vitest'
import { calcSavingsFeasibility } from '@/lib/calculations/savings-feasibility'

describe('lib/calculations/savings-feasibility', () => {
  it('TC-U-001 (AC-1.1, AC-1.2): objective, feasible, gap when rule not viable', () => {
    const result = calcSavingsFeasibility({
      netIncome: 10_000_000,
      savingsPercent: 20,
      freeForAllocation: 800_000,
    })
    expect(result.objective).toBe(2_000_000)
    expect(result.feasible).toBe(800_000)
    expect(result.gap).toBe(1_200_000)
    expect(result.isRuleViable).toBe(false)
  })

  it('TC-U-001 (AC-1.3): zero feasible when free for allocation is zero', () => {
    const result = calcSavingsFeasibility({
      netIncome: 5_000_000,
      savingsPercent: 20,
      freeForAllocation: 0,
    })
    expect(result.feasible).toBe(0)
    expect(result.gap).toBe(1_000_000)
    expect(result.isRuleViable).toBe(false)
  })
})
