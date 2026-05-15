import { describe, expect, it } from 'vitest'
import {
  calcDebtTimeline,
  calcExtraPaymentImpact,
  type CardDebt,
  type LoanDebt,
} from '@/lib/calculations/amortization'

describe('lib/calculations/amortization', () => {
  describe('calcDebtTimeline', () => {
    it('TC-U-009 (AC-5.1): card with positive APR returns finite months > 0 and totalInterest >= 0', () => {
      const card: CardDebt = {
        type: 'card',
        balance: 2_000_000,
        apr: 24,
        minPayment: 100_000,
      }
      const result = calcDebtTimeline(card)
      expect(result.type).toBe('card')
      expect(Number.isInteger(result.months)).toBe(true)
      expect(result.months).toBeGreaterThan(0)
      expect(Number.isFinite(result.months)).toBe(true)
      expect(result.totalInterest).toBeGreaterThanOrEqual(0)
    })

    it('TC-U-010 (AC-5.2): loan returns type=loan and preserves remainingInstallments', () => {
      const loan: LoanDebt = {
        type: 'loan',
        balance: 5_000_000,
        apr: 18,
        minPayment: 250_000,
        remainingInstallments: 24,
      }
      const result = calcDebtTimeline(loan)
      expect(result.type).toBe('loan')
      expect(result.remainingInstallments).toBe(24)
    })

    it('TC-U-012 (EC-10): card with APR=0 uses simple division, no NaN', () => {
      const card: CardDebt = {
        type: 'card',
        balance: 1_000_000,
        apr: 0,
        minPayment: 100_000,
      }
      const result = calcDebtTimeline(card)
      expect(result.months).toBe(10)
      expect(result.totalInterest).toBe(0)
      expect(Number.isFinite(result.months)).toBe(true)
    })
  })

  describe('calcExtraPaymentImpact', () => {
    it('TC-U-011 (AC-5.3): paying extra reduces months and total interest', () => {
      const card: CardDebt = {
        type: 'card',
        balance: 2_000_000,
        apr: 24,
        minPayment: 100_000,
      }
      const result = calcExtraPaymentImpact(card, 50_000)
      expect(result.monthsSaved).toBeGreaterThan(0)
      expect(result.interestSaved).toBeGreaterThan(0)
    })

    it('AC-5.3: zero extra payment yields zero savings', () => {
      const card: CardDebt = {
        type: 'card',
        balance: 2_000_000,
        apr: 24,
        minPayment: 100_000,
      }
      const result = calcExtraPaymentImpact(card, 0)
      expect(result.monthsSaved).toBe(0)
      expect(result.interestSaved).toBe(0)
    })
  })
})
