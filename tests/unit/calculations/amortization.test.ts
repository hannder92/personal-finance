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

// Tests for feature spec 20260515-fix-calculos-financieros.
// AC-4.1: APR field is TEA (Tasa Efectiva Anual, Colombian standard).
// Correct monthly rate = (1 + TEA)^(1/12) − 1, NOT TEA/12.
// The current implementation uses TEA/12, so the TC-U-008 cases RED until T-017 lands.
describe('lib/calculations/amortization — fix-calculos-financieros', () => {
  it('TC-U-008 (AC-4.1): TEA 30% case 1 — fewer months than TNA/12 baseline', () => {
    // balance 2M, TEA 30%, minPayment 100K:
    //   correct TEM = (1.30)^(1/12) − 1 ≈ 0.022104 → ~26.7 → ceil 27 months
    //   wrong TNA   = 0.30/12 = 0.025            → ~28.1 → ceil 29 months
    const card: CardDebt = {
      type: 'card',
      balance: 2_000_000,
      apr: 30,
      minPayment: 100_000,
    }
    const result = calcDebtTimeline(card)
    expect(result.months).toBe(27)
    // totalInterest = months × payment − balance = 27 × 100K − 2M = 700K under TEA.
    expect(result.totalInterest).toBe(700_000)
  })

  it('TC-U-008 (AC-4.1): TEA 30% case 2 — bigger balance, still fewer months than TNA', () => {
    // balance 5M, TEA 30%, minPayment 400K:
    //   correct TEM ≈ 0.022104 → ~14.8 → ceil 15
    //   wrong TNA   = 0.025    → ~15.2 → ceil 16
    const card: CardDebt = {
      type: 'card',
      balance: 5_000_000,
      apr: 30,
      minPayment: 400_000,
    }
    const result = calcDebtTimeline(card)
    expect(result.months).toBe(15)
  })

  it('TC-U-011 (AC-4.4): payment < monthly interest → indefinite (Infinity)', () => {
    // balance 5M, TEA 36%, minPayment 100K:
    //   TEM = (1.36)^(1/12) − 1 ≈ 0.02596 → monthly interest = 5M × 0.02596 = 129,800
    //   minPayment 100K < 129,800 → POSITIVE_INFINITY
    const card: CardDebt = {
      type: 'card',
      balance: 5_000_000,
      apr: 36,
      minPayment: 100_000,
    }
    const result = calcDebtTimeline(card)
    expect(result.months).toBe(Number.POSITIVE_INFINITY)
  })

  it('TC-U-023 (EC-6): APR=0 falls back to simple division (finite, no NaN)', () => {
    const card: CardDebt = {
      type: 'card',
      balance: 1_200_000,
      apr: 0,
      minPayment: 100_000,
    }
    const result = calcDebtTimeline(card)
    expect(result.months).toBe(12)
    expect(result.totalInterest).toBe(0)
  })
})
