import { describe, expect, it } from 'vitest'
import {
  buildAgendaThreeDays,
  calcDayCoverage,
  isDueOnLocalDay,
  listDebtsDueOnDay,
  sumMinPaymentsDueToday,
  toLocalDateKey,
} from '@/lib/calculations/day-obligations'

const TODAY = new Date(2026, 5, 4, 10, 0, 0)

describe('lib/calculations/day-obligations', () => {
  it('TC-U-010 (EC-1): isDueOnLocalDay matches local calendar day at night', () => {
    expect(isDueOnLocalDay('2026-06-04', new Date(2026, 5, 4, 23, 30, 0))).toBe(true)
    expect(isDueOnLocalDay('2026-06-05', TODAY)).toBe(false)
  })

  it('TC-U-011 (AC-1.1, EC-3): calcDayCoverage covered when liquid >= due', () => {
    expect(calcDayCoverage({ liquidTotal: 800_000, dueTodayTotal: 500_000 })).toEqual({
      status: 'covered',
      shortfallAmount: 0,
    })
    expect(calcDayCoverage({ liquidTotal: 500_000, dueTodayTotal: 500_000 })).toEqual({
      status: 'covered',
      shortfallAmount: 0,
    })
  })

  it('TC-U-011 (AC-1.2): calcDayCoverage shortfall with gap amount', () => {
    expect(calcDayCoverage({ liquidTotal: 400_000, dueTodayTotal: 600_000 })).toEqual({
      status: 'shortfall',
      shortfallAmount: 200_000,
    })
  })

  it('TC-U-011 (AC-1.3): calcDayCoverage no_due_today', () => {
    expect(calcDayCoverage({ liquidTotal: 1_000_000, dueTodayTotal: 0 })).toEqual({
      status: 'no_due_today',
      shortfallAmount: 0,
    })
  })

  it('TC-U-011 (AC-1.5): calcDayCoverage no_liquid when due > 0 and liquid 0', () => {
    expect(calcDayCoverage({ liquidTotal: 0, dueTodayTotal: 100_000 })).toEqual({
      status: 'no_liquid',
      shortfallAmount: 100_000,
    })
  })

  it('TC-U-012 (AC-2.1): listDebtsDueOnDay excludes tomorrow', () => {
    const debts = [
      {
        id: '1',
        name: 'A',
        minPayment: 200_000,
        dueDate: toLocalDateKey(TODAY),
        type: 'card',
      },
      {
        id: '2',
        name: 'B',
        minPayment: 150_000,
        dueDate: toLocalDateKey(TODAY),
        type: 'card',
      },
      {
        id: '3',
        name: 'C',
        minPayment: 99_000,
        dueDate: '2026-06-05',
        type: 'card',
      },
    ]
    expect(listDebtsDueOnDay(debts, TODAY)).toHaveLength(2)
    expect(sumMinPaymentsDueToday(debts, TODAY)).toBe(350_000)
  })

  it('TC-U-013 (AC-3.1, AC-3.2): buildAgendaThreeDays returns 3 rows', () => {
    const debts = [
      {
        id: '1',
        name: 'A',
        minPayment: 100_000,
        dueDate: '2026-06-05',
        type: 'card',
      },
    ]
    const rows = buildAgendaThreeDays(debts, TODAY)
    expect(rows).toHaveLength(3)
    expect(rows[1]?.paymentCount).toBe(1)
    expect(rows[1]?.totalMinPayment).toBe(100_000)
    expect(rows[2]?.paymentCount).toBe(0)
  })

  it('TC-U-014 (A-004): loans without dueDate are excluded', () => {
    const debts = [
      {
        id: 'l1',
        name: 'Loan',
        minPayment: 50_000,
        dueDate: null,
        type: 'loan',
      },
    ]
    expect(listDebtsDueOnDay(debts, TODAY)).toHaveLength(0)
  })
})
