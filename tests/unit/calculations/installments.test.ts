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
