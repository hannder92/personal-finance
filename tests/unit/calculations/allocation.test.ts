import { describe, expect, it } from 'vitest'
import {
  calcAllocationAmounts,
  calcGoalExcess,
  calcSavingsComplement,
  calcSavingsRate,
  debtExceedsSavings,
} from '@/lib/calculations/allocation'

describe('lib/calculations/allocation', () => {
  it('TC-U-032 (AC-14.3): amounts derived from percentages × income', () => {
    expect(calcAllocationAmounts({ needs: 50, wants: 30, savings: 20 }, 4_000_000)).toEqual({
      needs: 2_000_000,
      wants: 1_200_000,
      savings: 800_000,
    })
  })

  it('TC-U-033 (AC-14.1): savings = 100 − needs − wants', () => {
    expect(calcSavingsComplement(50, 30)).toBe(20)
  })

  it('TC-U-052 (AC-14.1): savings rate = saved / income × 100', () => {
    expect(calcSavingsRate(4_000_000, 1_000_000)).toBe(25)
  })

  it('AC-14.1: savings rate handles zero income safely', () => {
    expect(calcSavingsRate(0, 100_000)).toBe(0)
  })

  it('TC-U-059 (AC-7.3, AC-14.4): goal excess = totalContrib − savingsBucket (when > 0)', () => {
    expect(calcGoalExcess(1_500_000, 800_000)).toBe(700_000)
  })

  it('AC-7.3: goal excess returns 0 when contrib fits within bucket', () => {
    expect(calcGoalExcess(500_000, 800_000)).toBe(0)
  })

  it('TC-U-060 (AC-14.4): debt exceeds savings → true when obligations > bucket', () => {
    expect(debtExceedsSavings(1_000_000, 800_000)).toBe(true)
    expect(debtExceedsSavings(500_000, 800_000)).toBe(false)
  })
})
