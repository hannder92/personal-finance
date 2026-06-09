// Monthly cash flow points for the dashboard bar chart (US-4).
// One income/expenses pair per closed month, capped to the 6 most recent,
// in chronological order. Expenses = fixed + variable + debt payments.

import type { Snapshot } from '@/lib/storage/schema'

export interface MonthlyFlowPoint {
  month: string
  income: number
  expenses: number
}

const MAX_MONTHS = 6

export function buildMonthlyFlow(snapshots: ReadonlyArray<Snapshot>): MonthlyFlowPoint[] {
  return [...snapshots]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-MAX_MONTHS)
    .map((s) => ({
      month: s.month,
      income: s.netIncome,
      expenses: s.totalFixedExpenses + s.totalVariableSpent + (s.debtPayments ?? 0),
    }))
}
