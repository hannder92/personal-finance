// Spending pace vs previous month (US-2, 20260609-dashboard-fintech-redesign).
// Compares how much of last month's variable total has been spent against how
// much of the current month has elapsed. "Tie goes to the user": equal pace is
// reported as 'below' (green) per AC-2.3 ("menor o igual").

export interface SpendingPaceInput {
  currentVariableSpent: number
  /** Previous month's variable total; null when there is no closed month. */
  previousVariableTotal: number | null
  dayOfMonth: number
  daysInMonth: number
}

export interface SpendingPaceResult {
  status: 'ahead' | 'below' | 'none'
  /** % of last month's total already spent (integer, 0 when no history). */
  spentPct: number
  /** % of the current month elapsed (integer). */
  elapsedPct: number
}

export function calcSpendingPace(input: SpendingPaceInput): SpendingPaceResult {
  const { currentVariableSpent, previousVariableTotal, dayOfMonth, daysInMonth } = input

  const elapsedPct = Math.round((dayOfMonth / daysInMonth) * 100)

  if (previousVariableTotal === null || previousVariableTotal <= 0) {
    return { status: 'none', spentPct: 0, elapsedPct }
  }

  const spentPct = Math.round((currentVariableSpent / previousVariableTotal) * 100)
  return {
    status: spentPct > elapsedPct ? 'ahead' : 'below',
    spentPct,
    elapsedPct,
  }
}
