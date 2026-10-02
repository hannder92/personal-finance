import { describe, expect, it } from 'vitest'
import {
  comparePrepaymentPlan,
  simulatePrepaymentPlan,
  sortDebtIds,
  type PrepaymentDebt,
  type PrepaymentPlanInput,
} from '@/lib/calculations/prepayment'

function monthlyRate(tea: number): number {
  return Math.pow(1 + tea / 100, 1 / 12) - 1
}

function cuota(balance: number, tea: number, n: number): number {
  const r = monthlyRate(tea)
  return (balance * r) / (1 - Math.pow(1 + r, -n))
}

const loan: PrepaymentDebt = {
  id: 'loan',
  balance: 50_000_000,
  apr: 22,
  payment: cuota(50_000_000, 22, 60),
  remainingInstallments: 60,
}

const card: PrepaymentDebt = {
  id: 'card',
  balance: 5_000_000,
  apr: 30,
  payment: 300_000,
}

function input(overrides: Partial<PrepaymentPlanInput> = {}): PrepaymentPlanInput {
  return {
    debts: [loan],
    extraMonthly: 0,
    lumpSums: [],
    order: 'avalanche',
    mode: 'term',
    startCalendarMonth: 0,
    ...overrides,
  }
}

describe('lib/calculations/prepayment', () => {
  it('pays a loan in exactly its remaining installments when the cuota is the annuity', () => {
    const result = simulatePrepaymentPlan(input())
    expect(result.months).toBe(60)
    const expectedInterest = loan.payment * 60 - loan.balance
    expect(Math.abs(result.totalInterest - expectedInterest)).toBeLessThan(5)
  })

  it('term mode: a monthly extra shortens the loan and cuts interest, keeping the cuota', () => {
    const result = comparePrepaymentPlan(input({ extraMonthly: 500_000 }))
    expect(result.baseline.months).toBe(60)
    expect(result.plan.months).toBeLessThan(60)
    expect(result.monthsSaved).toBe(result.baseline.months - result.plan.months)
    expect(result.interestSaved).toBeGreaterThan(0)
    expect(result.plan.cuotaByMonth[10]).toBeCloseTo(loan.payment, 6)
  })

  it('payment mode: an abono keeps the term and lowers the cuota from the next month', () => {
    // Start in October (9); the December (11) lump sum lands in simulation month 3.
    const result = comparePrepaymentPlan(
      input({
        mode: 'payment',
        startCalendarMonth: 9,
        lumpSums: [{ calendarMonth: 11, amount: 1_000_000 }],
      })
    )
    const cuotas = result.plan.cuotaByMonth
    expect(cuotas[2]).toBeCloseTo(loan.payment, 6)
    expect(cuotas[3]!).toBeLessThan(loan.payment)
    expect(result.plan.months).toBe(60)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('lump sums repeat every year in their calendar month', () => {
    const once = simulatePrepaymentPlan(
      input({ mode: 'payment', lumpSums: [{ calendarMonth: 0, amount: 1_000_000 }] })
    )
    // January = months 1, 13, 25…: the cuota steps down right after each one.
    expect(once.cuotaByMonth[1]!).toBeLessThan(once.cuotaByMonth[0]!)
    expect(once.cuotaByMonth[12]).toBeCloseTo(once.cuotaByMonth[11]!, 6)
    expect(once.cuotaByMonth[13]!).toBeLessThan(once.cuotaByMonth[12]!)
  })

  it('avalanche sends the extra to the highest rate; snowball to the smallest balance', () => {
    const big = { id: 'big', balance: 20_000_000, apr: 30, payment: 800_000 }
    const small = { id: 'small', balance: 4_000_000, apr: 15, payment: 200_000 }
    expect(sortDebtIds([small, big], 'avalanche')).toEqual(['big', 'small'])
    expect(sortDebtIds([big, small], 'snowball')).toEqual(['small', 'big'])

    const base = { debts: [big, small], extraMonthly: 1_000_000 }
    const avalanche = simulatePrepaymentPlan(input({ ...base, order: 'avalanche' }))
    const snowball = simulatePrepaymentPlan(input({ ...base, order: 'snowball' }))
    const month = (r: typeof avalanche, id: string) => r.perDebt.find((d) => d.id === id)!.months
    expect(month(snowball, 'small')).toBeLessThan(month(avalanche, 'small'))
    expect(avalanche.totalInterest).toBeLessThan(snowball.totalInterest)
  })

  it('term mode rolls a finished debt cuota into the next one, even with no extra', () => {
    const result = comparePrepaymentPlan(input({ debts: [loan, card] }))
    const cardDone = result.plan.perDebt.find((d) => d.id === 'card')!.months
    expect(cardDone).toBeLessThan(60)
    expect(result.plan.months).toBeLessThan(result.baseline.months)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('payment mode does not roll freed cuotas over', () => {
    const result = comparePrepaymentPlan(input({ debts: [loan, card], mode: 'payment' }))
    expect(result.plan.months).toBe(result.baseline.months)
    expect(result.interestSaved).toBe(0)
  })

  it('reports a debt that never ends when the cuota does not cover the interest', () => {
    const stuck = { id: 'stuck', balance: 10_000_000, apr: 30, payment: 100_000 }
    const result = comparePrepaymentPlan(input({ debts: [stuck] }))
    expect(result.baseline.months).toBe(Number.POSITIVE_INFINITY)
    expect(result.baseline.totalInterest).toBe(Number.POSITIVE_INFINITY)
    expect(result.monthsSaved).toBe(0)
    expect(result.interestSaved).toBe(0)

    const rescued = comparePrepaymentPlan(input({ debts: [stuck], extraMonthly: 500_000 }))
    expect(Number.isFinite(rescued.plan.months)).toBe(true)
  })

  it('handles zero-rate debts and ignores paid-off debts and invalid amounts', () => {
    const zero = { id: 'zero', balance: 1_200_000, apr: 0, payment: 100_000 }
    const paid = { id: 'paid', balance: 0, apr: 25, payment: 100_000 }
    const result = simulatePrepaymentPlan(
      input({
        debts: [zero, paid],
        extraMonthly: -50_000,
        lumpSums: [{ calendarMonth: 0, amount: Number.NaN }],
      })
    )
    expect(result.months).toBe(12)
    expect(result.totalInterest).toBe(0)
    expect(result.perDebt.map((d) => d.id)).toEqual(['zero'])
  })

  it('returns an empty scenario when there are no debts', () => {
    const result = comparePrepaymentPlan(input({ debts: [] }))
    expect(result.plan).toEqual({ months: 0, totalInterest: 0, perDebt: [], cuotaByMonth: [] })
    expect(result.order).toEqual([])
  })
})
