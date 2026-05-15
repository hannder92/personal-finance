import { calcDebtTimeline, type Debt } from './amortization'

export function calcDTI(monthlyDebtObligations: number, totalMonthlyIncome: number): number {
  if (totalMonthlyIncome <= 0) return 0
  return (monthlyDebtObligations / totalMonthlyIncome) * 100
}

export function calcDebtFreeDate(debts: ReadonlyArray<Debt>): Date | null {
  if (debts.length === 0) return null
  const maxMonths = debts
    .map((d) => calcDebtTimeline(d).months)
    .reduce((acc, m) => (Number.isFinite(m) && m > acc ? m : acc), 0)
  if (!Number.isFinite(maxMonths) || maxMonths <= 0) return null
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + maxMonths, now.getDate())
}

export function calcFreeForAllocation(
  totalIncome: number,
  fixedExpenses: number,
  debtObligations: number
): number {
  return totalIncome - fixedExpenses - debtObligations
}
