export interface FinancialFreedomInputs {
  monthlyLivingExpense: number
  liquidAssets: number
  monthlyFeasibleSavings: number
}

export interface FinancialFreedomResult {
  monthlyLivingExpense: number
  liquidAssets: number
  targetPatrimony: number
  progressPercent: number
  monthsToTarget: number | null
  targetReached: boolean
}

export function calcFinancialFreedom(inputs: FinancialFreedomInputs): FinancialFreedomResult {
  const { monthlyLivingExpense, liquidAssets, monthlyFeasibleSavings } = inputs
  const targetPatrimony = monthlyLivingExpense * 12 * 25
  const progressPercent =
    targetPatrimony > 0 ? Math.min(100, (liquidAssets / targetPatrimony) * 100) : 0
  const targetReached = liquidAssets >= targetPatrimony
  let monthsToTarget: number | null = null
  if (!targetReached && monthlyFeasibleSavings > 0) {
    monthsToTarget = Math.ceil((targetPatrimony - liquidAssets) / monthlyFeasibleSavings)
  }
  return {
    monthlyLivingExpense,
    liquidAssets,
    targetPatrimony,
    progressPercent,
    monthsToTarget,
    targetReached,
  }
}
