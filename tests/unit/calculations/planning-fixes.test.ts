// Regression tests for the calculation review (notes/revision-calculos.md).
import { describe, expect, it } from 'vitest'
import { calcDebtTimeline } from '@/lib/calculations/amortization'
import { calcDebtFreeDate, calcDebtFreeOutlook } from '@/lib/calculations/dti'
import { getProjectionMonthsForStream, PRIMA_PAYMENT_MONTHS } from '@/lib/calculations/frequency'
import { calcGoalETA, calcRequiredMonthly, parseLocalDate } from '@/lib/calculations/goals'
import {
  calcCardObligation,
  calcInstallmentMonthly,
  calcTotalDebtObligation,
} from '@/lib/calculations/installments'
import { calcMonthlyOutflow, calcVariableMonthly } from '@/lib/calculations/liquid-metrics'
import { calcProjection } from '@/lib/calculations/projection'
import { calcContributionGrowth } from '@/lib/calculations/savings-projection'

const NOW = new Date(2026, 9, 1) // 1 Oct 2026

describe('installments — paid-off installments stop counting', () => {
  it('returns 0 when every installment is paid', () => {
    expect(calcInstallmentMonthly({ total: 1_200_000, installments: 12, paid: 12 })).toBe(0)
  })

  it('card obligation adds only the open installments', () => {
    const card = {
      minPayment: 100_000,
      installmentsList: [
        { total: 1_200_000, installments: 12, paid: 12 },
        { total: 600_000, installments: 6, paid: 2 },
      ],
    }
    expect(calcCardObligation(card)).toBe(200_000)
  })

  it('total obligation mixes cards and loans', () => {
    const total = calcTotalDebtObligation([
      { type: 'card', minPayment: 100_000, installments: [] },
      { type: 'loan', minPayment: 500_000 },
    ])
    expect(total).toBe(600_000)
  })
})

describe('amortization — loans and never-ending cards', () => {
  it('a loan with remaining installments ends after those installments', () => {
    const t = calcDebtTimeline({
      type: 'loan',
      balance: 9_000_000,
      apr: 20,
      minPayment: 500_000,
      remainingInstallments: 24,
    })
    expect(t.months).toBe(24)
    expect(t.totalInterest).toBe(24 * 500_000 - 9_000_000)
  })

  it('a card whose payment does not cover interest never ends', () => {
    const t = calcDebtTimeline({ type: 'card', balance: 10_000_000, apr: 30, minPayment: 100_000 })
    expect(t.months).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('debt-free outlook', () => {
  it('is "never" when one debt cannot be paid off, instead of a misleading date', () => {
    const outlook = calcDebtFreeOutlook(
      [
        { type: 'card', balance: 1_000_000, apr: 30, minPayment: 500_000 },
        { type: 'card', balance: 10_000_000, apr: 30, minPayment: 100_000 },
      ],
      NOW
    )
    expect(outlook.kind).toBe('never')
    expect(
      calcDebtFreeDate([{ type: 'card', balance: 10_000_000, apr: 30, minPayment: 100_000 }], NOW)
    ).toBeNull()
  })

  it('is "none" without balances', () => {
    expect(
      calcDebtFreeOutlook([{ type: 'card', balance: 0, apr: 30, minPayment: 0 }], NOW).kind
    ).toBe('none')
  })

  it('returns the first day of the payoff month', () => {
    const outlook = calcDebtFreeOutlook(
      [
        {
          type: 'loan',
          balance: 1_000_000,
          apr: 0,
          minPayment: 100_000,
          remainingInstallments: 10,
        },
      ],
      NOW
    )
    expect(outlook).toEqual({ kind: 'date', date: new Date(2027, 7, 1), months: 10 })
  })
})

describe('prima placed on June and December', () => {
  it('starting in October, prima falls on months 2 (Dec) and 8 (Jun)', () => {
    const months = getProjectionMonthsForStream(
      { amount: 1, frequency: 'semiannual', paymentMonths: PRIMA_PAYMENT_MONTHS },
      0,
      12,
      9
    )
    expect(months).toEqual([2, 8])
  })

  it('projection subtracts variable spending each month', () => {
    const p = calcProjection(
      {
        monthlyIncome: 5_000_000,
        streams: [],
        fixedExpenses: 2_000_000,
        debtObligation: 0,
        variableExpenses: 1_000_000,
      },
      3
    )
    expect(p.months.map((m) => m.projectedBalance)).toEqual([2_000_000, 4_000_000, 6_000_000])
  })
})

describe('goals — local dates and schedule', () => {
  it('parses YYYY-MM-DD as a local date (no UTC day shift)', () => {
    const d = parseLocalDate('2027-03-31')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2027, 2, 31])
  })

  it('flags a goal that will finish after its target date', () => {
    const eta = calcGoalETA(
      { target: 12_000_000, saved: 0, monthlyContrib: 500_000, targetDate: '2027-06-30' },
      NOW
    )
    expect(eta.months).toBe(24)
    expect(eta.behindSchedule).toBe(true)
    expect(eta.overdue).toBe(false)
    expect(eta.estimatedDate).toEqual(new Date(2028, 9, 1))
  })

  it('a completed goal is never overdue', () => {
    const eta = calcGoalETA(
      { target: 1_000_000, saved: 1_000_000, monthlyContrib: 0, targetDate: '2020-01-01' },
      NOW
    )
    expect(eta.overdue).toBe(false)
  })

  it('required monthly = shortfall / months left', () => {
    expect(
      calcRequiredMonthly(
        { target: 12_000_000, saved: 0, monthlyContrib: 0, targetDate: '2027-10-01' },
        NOW
      )
    ).toBe(1_000_000)
  })
})

describe('variable spending and outflow', () => {
  it('counts the budget while the month is open and the real spend when it exceeds it', () => {
    expect(
      calcVariableMonthly([
        { budget: 1_000_000, spent: 200_000 },
        { budget: 500_000, spent: 800_000 },
      ])
    ).toBe(1_800_000)
  })

  it('outflow = fixed + variable + debt', () => {
    expect(calcMonthlyOutflow(2, 3, 4)).toBe(9)
  })
})

describe('calcContributionGrowth', () => {
  it('without returns both curves match', () => {
    const pts = calcContributionGrowth({
      startingBalance: 1_000,
      monthlyContribution: 100,
      annualRatePercent: 0,
      monthsAhead: 3,
    })
    expect(pts.map((p) => p.contributed)).toEqual([1_100, 1_200, 1_300])
    expect(pts.map((p) => p.withReturns)).toEqual([1_100, 1_200, 1_300])
  })

  it('with returns the compound curve is above contributions only', () => {
    const pts = calcContributionGrowth({
      startingBalance: 10_000_000,
      monthlyContribution: 1_000_000,
      annualRatePercent: 12,
      monthsAhead: 12,
    })
    const last = pts.at(-1)!
    expect(last.contributed).toBe(22_000_000)
    expect(last.withReturns).toBeGreaterThan(last.contributed)
  })

  it('returns [] for a non-positive horizon', () => {
    expect(
      calcContributionGrowth({
        startingBalance: 1,
        monthlyContribution: 1,
        annualRatePercent: 0,
        monthsAhead: 0,
      })
    ).toEqual([])
  })
})
