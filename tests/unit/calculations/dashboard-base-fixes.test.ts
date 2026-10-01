// Regression tests for revision-calculos.md items 4, 8, 9, 16 (lib layer).
import { describe, expect, it } from 'vitest'
import {
  calcCardObligation,
  calcTotalDebtObligation,
  isInstallmentActive,
} from '@/lib/calculations/installments'
import { calcFreeForAllocation } from '@/lib/calculations/dti'
import { getProjectionMonthsForStream } from '@/lib/calculations/frequency'
import { calcProjection } from '@/lib/calculations/projection'
import { calcHealthScore, healthLevel, labelFor } from '@/lib/calculations/health-score'

const OCTOBER = 9
const JANUARY = 0

describe('installments — paid plans stop counting', () => {
  it('fully paid plan is inactive and excluded from card obligation', () => {
    expect(isInstallmentActive({ total: 600_000, installments: 6, paid: 6 })).toBe(false)
    expect(
      calcCardObligation({
        minPayment: 100_000,
        installmentsList: [
          { total: 600_000, installments: 6, paid: 6 }, // done → 0
          { total: 300_000, installments: 3, paid: 1 }, // active → 100K
        ],
      })
    ).toBe(200_000)
  })

  it('overpaid counter (paid > installments) is also excluded', () => {
    expect(isInstallmentActive({ total: 600_000, installments: 6, paid: 7 })).toBe(false)
  })

  it('calcTotalDebtObligation sums cards (active plans only) and loans', () => {
    expect(
      calcTotalDebtObligation([
        {
          type: 'card',
          minPayment: 150_000,
          installments: [
            { total: 1_200_000, installments: 12, paid: 12 },
            { total: 1_200_000, installments: 12, paid: 3 },
          ],
        },
        { type: 'loan', minPayment: 400_000 },
      ])
    ).toBe(150_000 + 100_000 + 400_000)
  })
})

describe('calcFreeForAllocation — variable spending', () => {
  it('subtracts the variable budget', () => {
    expect(calcFreeForAllocation(5_000_000, 1_500_000, 500_000, 800_000)).toBe(2_200_000)
  })
})

describe('prima placement (June and December)', () => {
  const prima = { amount: 2_000_000, frequency: 'semiannual' as const, isPrima: true }

  it('starting in October, prima lands on December (2) and June (8)', () => {
    expect(getProjectionMonthsForStream(prima, 0, 12, OCTOBER)).toEqual([2, 8])
  })

  it('starting in January, prima lands on June (5) and December (11)', () => {
    expect(getProjectionMonthsForStream(prima, 0, 12, JANUARY)).toEqual([5, 11])
  })

  it('non-prima semiannual stream keeps the generic cadence', () => {
    const bonus = { amount: 2_000_000, frequency: 'semiannual' as const }
    expect(getProjectionMonthsForStream(bonus, 0, 12, OCTOBER)).toEqual([0, 6])
  })

  it('calcProjection credits prima in December, not in the current month', () => {
    const { months } = calcProjection(
      {
        monthlyIncome: 1_000_000,
        streams: [prima],
        fixedExpenses: 0,
        debtObligation: 0,
        startCalendarMonth: OCTOBER,
      },
      12
    )
    expect(months[0]!.projectedBalance).toBe(1_000_000) // October: salary only
    expect(months[2]!.projectedBalance - months[1]!.projectedBalance).toBe(3_000_000) // December
  })

  it('calcProjection subtracts variable expenses every month', () => {
    const { months } = calcProjection(
      {
        monthlyIncome: 3_000_000,
        streams: [],
        fixedExpenses: 1_000_000,
        debtObligation: 500_000,
        variableExpenses: 700_000,
      },
      2
    )
    expect(months.map((m) => m.projectedBalance)).toEqual([800_000, 1_600_000])
  })
})

describe('health label cutoffs — one source of truth', () => {
  it('a 65 is "good" and maps to the ok level', () => {
    expect(labelFor(65)).toBe('good')
    expect(healthLevel(65)).toBe('ok')
  })

  it('regular → warn, at-risk/critical → danger', () => {
    expect(healthLevel(55)).toBe('warn')
    expect(healthLevel(40)).toBe('danger')
    expect(healthLevel(10)).toBe('danger')
  })

  it('overall level matches calcHealthScore label', () => {
    const r = calcHealthScore({ dti: 25, emergencyMonths: 4, housingRatio: 35, savingsRate: 12 })
    expect(healthLevel(r.score)).toBe(
      r.label === 'good' || r.label === 'excellent'
        ? 'ok'
        : r.label === 'regular'
          ? 'warn'
          : 'danger'
    )
  })
})
