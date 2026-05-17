import { describe, expect, it } from 'vitest'
import { calcCardObligation, calcInstallmentMonthly } from '@/lib/calculations/installments'

describe('lib/calculations/installments', () => {
  it('TC-U-017 (AC-6.1): monthly = total / installments', () => {
    expect(calcInstallmentMonthly({ total: 1_200_000, installments: 12 })).toBe(100_000)
  })

  it('TC-U-018 (AC-6.2): card obligation = minPayment + sum of installment monthlies', () => {
    expect(
      calcCardObligation({
        minPayment: 100_000,
        installmentsList: [{ total: 600_000, installments: 6 }],
      })
    ).toBe(200_000)
  })

  it('AC-6.2: card obligation with multiple installments sums all', () => {
    expect(
      calcCardObligation({
        minPayment: 50_000,
        installmentsList: [
          { total: 600_000, installments: 6 }, // 100K
          { total: 300_000, installments: 3 }, // 100K
        ],
      })
    ).toBe(250_000)
  })

  it('AC-6.2: card obligation with no installments equals minPayment', () => {
    expect(
      calcCardObligation({
        minPayment: 100_000,
        installmentsList: [],
      })
    ).toBe(100_000)
  })

  it('AC-6.1: zero installments count returns 0 (no NaN)', () => {
    const result = calcInstallmentMonthly({ total: 1_000_000, installments: 0 })
    expect(result).toBe(0)
    expect(Number.isFinite(result)).toBe(true)
  })
})

// Tests for feature spec 20260515-fix-calculos-financieros.
// Lib functions are already correct; the real bug (DTI ignores installments)
// lives at the composable/view layer (T-023 useDTI + T-028 DashboardView).
// These tests capture the spec's exact scenario for regression coverage.
describe('lib/calculations/installments — fix-calculos-financieros', () => {
  it('TC-U-009 (AC-4.2): card with one installment plan — min 200K + (600K/3) = 400K', () => {
    expect(
      calcCardObligation({
        minPayment: 200_000,
        installmentsList: [{ total: 600_000, installments: 3, paid: 0 }],
      })
    ).toBe(400_000)
  })

  it('TC-U-009 (AC-4.2): card with empty installmentsList → result === minPayment', () => {
    expect(
      calcCardObligation({
        minPayment: 350_000,
        installmentsList: [],
      })
    ).toBe(350_000)
  })
})
