export type RunwayResult =
  | { kind: 'months'; value: number }
  | { kind: 'unavailable'; reason: 'no_liquid' | 'no_expense' }

export interface FinancialRunwayInputs {
  liquidAssets: number
  monthlyLivingExpense: number
}

export function calcFinancialRunway(inputs: FinancialRunwayInputs): RunwayResult {
  const { liquidAssets, monthlyLivingExpense } = inputs
  if (liquidAssets <= 0) return { kind: 'unavailable', reason: 'no_liquid' }
  if (monthlyLivingExpense <= 0) return { kind: 'unavailable', reason: 'no_expense' }
  return { kind: 'months', value: Math.floor(liquidAssets / monthlyLivingExpense) }
}
