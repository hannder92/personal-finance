import { describe, expect, it } from 'vitest'
import { calcMonthlyEquivalent, getProjectionMonthsForStream } from '@/lib/calculations/frequency'

describe('lib/calculations/frequency', () => {
  describe('calcMonthlyEquivalent', () => {
    it('TC-U-005 (AC-3.1): monthly stream returns its amount unchanged', () => {
      expect(calcMonthlyEquivalent({ amount: 3_000_000, frequency: 'monthly' })).toBe(3_000_000)
    })

    it('TC-U-006 (AC-3.1): semiannual 6M → monthly equivalent 1M', () => {
      expect(calcMonthlyEquivalent({ amount: 6_000_000, frequency: 'semiannual' })).toBe(1_000_000)
    })

    it('AC-3.1: quarterly 3M → monthly equivalent 1M', () => {
      expect(calcMonthlyEquivalent({ amount: 3_000_000, frequency: 'quarterly' })).toBe(1_000_000)
    })

    it('AC-3.1: annual 12M → monthly equivalent 1M', () => {
      expect(calcMonthlyEquivalent({ amount: 12_000_000, frequency: 'annual' })).toBe(1_000_000)
    })
  })

  describe('getProjectionMonthsForStream', () => {
    it('TC-U-007 (AC-3.2): quarterly over 12 months from index 0 returns [0, 3, 6, 9]', () => {
      const result = getProjectionMonthsForStream({ amount: 1, frequency: 'quarterly' }, 0, 12)
      expect(result).toEqual([0, 3, 6, 9])
    })

    it('AC-3.2: semiannual over 12 months from 0 returns [0, 6]', () => {
      expect(getProjectionMonthsForStream({ amount: 1, frequency: 'semiannual' }, 0, 12)).toEqual([
        0, 6,
      ])
    })

    it('AC-3.2: monthly over 12 months from 0 returns 12 consecutive indices', () => {
      expect(getProjectionMonthsForStream({ amount: 1, frequency: 'monthly' }, 0, 12)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      ])
    })

    it('AC-3.2: annual over 12 months from 0 returns [0]', () => {
      expect(getProjectionMonthsForStream({ amount: 1, frequency: 'annual' }, 0, 12)).toEqual([0])
    })
  })
})
