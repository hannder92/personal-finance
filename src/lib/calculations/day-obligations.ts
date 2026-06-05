export type DayCoverageStatus = 'covered' | 'shortfall' | 'no_due_today' | 'no_liquid'

export interface DebtDueSlice {
  id: string
  name: string
  minPayment: number
  dueDate: string
}

export interface AgendaDayRow {
  offset: 0 | 1 | 2
  paymentCount: number
  totalMinPayment: number
}

export interface DebtDueInput {
  id: string
  name: string
  minPayment: number
  dueDate: string | null
  type: string
}

export function toLocalDateKey(reference: Date): string {
  const y = reference.getFullYear()
  const m = String(reference.getMonth() + 1).padStart(2, '0')
  const d = String(reference.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isDueOnLocalDay(dueDate: string, reference: Date): boolean {
  const normalized = dueDate.slice(0, 10)
  return normalized === toLocalDateKey(reference)
}

function addLocalDays(reference: Date, days: number): Date {
  const next = new Date(reference)
  next.setDate(next.getDate() + days)
  return next
}

export function listDebtsDueOnDay(
  debts: ReadonlyArray<DebtDueInput>,
  reference: Date
): DebtDueSlice[] {
  return debts
    .filter(
      (d): d is DebtDueInput & { dueDate: string } =>
        d.type === 'card' && d.dueDate != null && isDueOnLocalDay(d.dueDate, reference)
    )
    .map((d) => ({
      id: d.id,
      name: d.name,
      minPayment: d.minPayment,
      dueDate: d.dueDate,
    }))
}

export function sumMinPaymentsDueToday(
  debts: ReadonlyArray<DebtDueInput>,
  reference: Date
): number {
  return listDebtsDueOnDay(debts, reference).reduce((acc, d) => acc + d.minPayment, 0)
}

export function calcDayCoverage(params: { liquidTotal: number; dueTodayTotal: number }): {
  status: DayCoverageStatus
  shortfallAmount: number
} {
  const { liquidTotal, dueTodayTotal } = params
  if (dueTodayTotal <= 0) {
    return { status: 'no_due_today', shortfallAmount: 0 }
  }
  if (liquidTotal <= 0) {
    return { status: 'no_liquid', shortfallAmount: dueTodayTotal }
  }
  if (liquidTotal >= dueTodayTotal) {
    return { status: 'covered', shortfallAmount: 0 }
  }
  return { status: 'shortfall', shortfallAmount: dueTodayTotal - liquidTotal }
}

export function buildAgendaThreeDays(
  debts: ReadonlyArray<DebtDueInput>,
  reference: Date
): AgendaDayRow[] {
  return ([0, 1, 2] as const).map((offset) => {
    const day = addLocalDays(reference, offset)
    const due = listDebtsDueOnDay(debts, day)
    return {
      offset,
      paymentCount: due.length,
      totalMinPayment: due.reduce((acc, d) => acc + d.minPayment, 0),
    }
  })
}
