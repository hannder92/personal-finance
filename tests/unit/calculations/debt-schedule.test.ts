import { describe, expect, it } from 'vitest'
import { calcDebtSchedule, debtDueInMonth } from '@/lib/calculations/installments'
import { calcProjection } from '@/lib/calculations/projection'

describe('calcDebtSchedule', () => {
  const schedule = calcDebtSchedule([
    {
      type: 'card',
      minPayment: 300_000,
      installments: [
        { total: 1_200_000, installments: 12, paid: 9 }, // 3 cuotas of 100.000 left
        { total: 600_000, installments: 6, paid: 6 }, // paid off
      ],
    },
    { type: 'loan', minPayment: 500_000, remainingInstallments: 2 },
    { type: 'loan', minPayment: 700_000, remainingInstallments: 5, payrollDeducted: true },
  ])

  it('keeps each payment only while it has cuotas left', () => {
    expect(debtDueInMonth(schedule, 0)).toBe(300_000 + 100_000 + 500_000 + 700_000)
    expect(debtDueInMonth(schedule, 2)).toBe(300_000 + 100_000 + 700_000)
    expect(debtDueInMonth(schedule, 3)).toBe(300_000 + 700_000)
    expect(debtDueInMonth(schedule, 5)).toBe(300_000)
    expect(debtDueInMonth(schedule, 100)).toBe(300_000)
  })

  it('flags libranzas', () => {
    expect(schedule.filter((e) => e.payroll).map((e) => e.amount)).toEqual([700_000])
  })
})

describe('calcProjection with a debt schedule', () => {
  it('stops subtracting a loan after its last cuota', () => {
    const schedule = calcDebtSchedule([
      { type: 'loan', minPayment: 1_000_000, remainingInstallments: 3 },
    ])
    const { months } = calcProjection(
      {
        monthlyIncome: 2_000_000,
        streams: [],
        fixedExpenses: 0,
        debtObligation: 1_000_000,
        debtForMonth: (i) => debtDueInMonth(schedule, i),
      },
      5
    )
    expect(months.map((m) => m.projectedBalance)).toEqual([
      1_000_000, 2_000_000, 3_000_000, 5_000_000, 7_000_000,
    ])
  })
})
