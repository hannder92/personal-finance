import { describe, expect, it } from 'vitest'
import { calcDTI, calcDebtFreeDate, calcFreeForAllocation } from '@/lib/calculations/dti'
import type { CardDebt } from '@/lib/calculations/amortization'

describe('lib/calculations/dti', () => {
  describe('calcDTI', () => {
    it('TC-U-015 (AC-5.6): typical DTI returns percentage', () => {
      expect(calcDTI(800_000, 4_000_000)).toBe(20)
    })

    it('TC-U-016 (EC-2): DTI > 100% is finite, not clamped', () => {
      const result = calcDTI(5_000_000, 3_000_000)
      expect(result).toBeGreaterThan(100)
      expect(Number.isFinite(result)).toBe(true)
    })

    it('AC-5.6: zero income returns 0 (no divide-by-zero)', () => {
      expect(calcDTI(500_000, 0)).toBe(0)
    })
  })

  describe('calcDebtFreeDate', () => {
    it('TC-U-050 (AC-5.6): returns date of last debt to pay off (max timeline)', () => {
      const cards: CardDebt[] = [
        { type: 'card', balance: 1_000_000, apr: 0, minPayment: 100_000 }, // 10 months
        { type: 'card', balance: 2_000_000, apr: 0, minPayment: 100_000 }, // 20 months
      ]
      const result = calcDebtFreeDate(cards)
      expect(result).toBeInstanceOf(Date)
      const monthsFromNow =
        ((result as Date).getFullYear() - new Date().getFullYear()) * 12 +
        ((result as Date).getMonth() - new Date().getMonth())
      expect(monthsFromNow).toBe(20)
    })

    it('AC-5.6: empty debts returns null', () => {
      expect(calcDebtFreeDate([])).toBeNull()
    })
  })

  describe('calcFreeForAllocation', () => {
    it('TC-U-057 (AC-10.1): income minus fixed expenses minus debt obligations', () => {
      expect(calcFreeForAllocation(4_000_000, 1_500_000, 500_000)).toBe(2_000_000)
    })

    it('AC-10.1: result can be negative when obligations exceed income', () => {
      expect(calcFreeForAllocation(1_000_000, 800_000, 500_000)).toBe(-300_000)
    })
  })
})
