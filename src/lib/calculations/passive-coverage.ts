export interface PassiveCoverageResult {
  coveragePercent: number
  monthlyGap: number
  isFullyCovered: boolean
}

export interface PassiveCoverageInputs {
  monthlyPassive: number
  monthlyResidual: number
  monthlyLivingExpense: number
}

export function calcPassiveCoverage(inputs: PassiveCoverageInputs): PassiveCoverageResult {
  const { monthlyPassive, monthlyResidual, monthlyLivingExpense } = inputs
  if (monthlyLivingExpense <= 0) {
    return { coveragePercent: 0, monthlyGap: 0, isFullyCovered: false }
  }
  const flowIncome = monthlyPassive + monthlyResidual
  const coveragePercent = Math.round((flowIncome / monthlyLivingExpense) * 100)
  const isFullyCovered = flowIncome >= monthlyLivingExpense
  const monthlyGap = isFullyCovered ? 0 : monthlyLivingExpense - flowIncome
  return { coveragePercent, monthlyGap, isFullyCovered }
}
