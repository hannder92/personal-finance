import { calcDebtTimeline, type Debt } from './amortization'

export function calcDTI(monthlyDebtObligations: number, totalMonthlyIncome: number): number {
  if (totalMonthlyIncome <= 0) return 0
  return (monthlyDebtObligations / totalMonthlyIncome) * 100
}

export type DebtFreeOutlook =
  | { kind: 'none' }
  | { kind: 'never' }
  | { kind: 'date'; date: Date; months: number }

// When the last debt is paid off. `never` when at least one debt's payment does not
// cover its monthly interest — returning a date would hide that debt.
export function calcDebtFreeOutlook(
  debts: ReadonlyArray<Debt>,
  now: Date = new Date()
): DebtFreeOutlook {
  const active = debts.filter((d) => d.balance > 0)
  if (active.length === 0) return { kind: 'none' }
  const months = active.map((d) => calcDebtTimeline(d).months)
  if (months.some((m) => !Number.isFinite(m))) return { kind: 'never' }
  const maxMonths = Math.max(...months)
  if (maxMonths <= 0) return { kind: 'none' }
  return {
    kind: 'date',
    date: new Date(now.getFullYear(), now.getMonth() + maxMonths, 1),
    months: maxMonths,
  }
}

export function calcDebtFreeDate(debts: ReadonlyArray<Debt>, now: Date = new Date()): Date | null {
  const outlook = calcDebtFreeOutlook(debts, now)
  return outlook.kind === 'date' ? outlook.date : null
}

export function calcFreeForAllocation(
  totalIncome: number,
  fixedExpenses: number,
  debtObligations: number
): number {
  return totalIncome - fixedExpenses - debtObligations
}
