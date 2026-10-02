import { monthsToReach, requiredMonthlyFor } from './real-projection'

export interface FinancialFreedomInputs {
  monthlyLivingExpense: number
  liquidAssets: number
  monthlyFeasibleSavings: number
  /** Annual safe withdrawal rate in %. Default 4 (25× annual spending). */
  withdrawalRatePercent?: number
  /** Expected effective annual return in %. Default 0. */
  annualReturnPercent?: number
  /** Expected annual inflation in %. Default 0. */
  inflationPercent?: number
  /** Horizon (years) for the required monthly contribution. Default 20. */
  desiredYears?: number
}

export interface FinancialFreedomResult {
  monthlyLivingExpense: number
  liquidAssets: number
  /** Capital needed, in today's pesos. */
  targetPatrimony: number
  progressPercent: number
  /** Months to reach the target with the assumptions; null when reached or unreachable. */
  monthsToTarget: number | null
  /** Same projection with a 0% return (benefit comparison); null when unreachable. */
  monthsWithoutReturn: number | null
  targetReached: boolean
  desiredYears: number
  /** Flat monthly contribution that reaches the target in `desiredYears`. */
  requiredMonthlyForDesired: number
  /** True when the current feasible savings already cover the required contribution. */
  currentSavingsSuffices: boolean
}

export const DEFAULT_WITHDRAWAL_RATE_PERCENT = 4
export const DEFAULT_FI_DESIRED_YEARS = 20

export function calcFinancialFreedom(inputs: FinancialFreedomInputs): FinancialFreedomResult {
  const { monthlyLivingExpense, liquidAssets, monthlyFeasibleSavings } = inputs
  const withdrawal = inputs.withdrawalRatePercent ?? DEFAULT_WITHDRAWAL_RATE_PERCENT
  const annualReturnPercent = inputs.annualReturnPercent ?? 0
  const inflationPercent = inputs.inflationPercent ?? 0
  const desiredYears = inputs.desiredYears ?? DEFAULT_FI_DESIRED_YEARS

  // × 100 / rate keeps 4% exactly equal to the historical × 12 × 25.
  const targetPatrimony = (monthlyLivingExpense * 12 * 100) / withdrawal
  const progressPercent =
    targetPatrimony > 0 ? Math.min(100, (liquidAssets / targetPatrimony) * 100) : 0
  const targetReached = liquidAssets >= targetPatrimony

  const reach = {
    targetToday: targetPatrimony,
    balance: liquidAssets,
    monthlyContrib: Math.max(0, monthlyFeasibleSavings),
    inflationPercent,
  }
  const monthsToTarget = targetReached ? null : monthsToReach({ ...reach, annualReturnPercent })
  const monthsWithoutReturn = targetReached
    ? null
    : monthsToReach({ ...reach, annualReturnPercent: 0 })

  const requiredMonthlyForDesired = targetReached
    ? 0
    : requiredMonthlyFor({
        targetToday: targetPatrimony,
        balance: liquidAssets,
        months: desiredYears * 12,
        annualReturnPercent,
        inflationPercent,
      })

  return {
    monthlyLivingExpense,
    liquidAssets,
    targetPatrimony,
    progressPercent,
    monthsToTarget,
    monthsWithoutReturn,
    targetReached,
    desiredYears,
    requiredMonthlyForDesired,
    currentSavingsSuffices: monthlyFeasibleSavings >= requiredMonthlyForDesired,
  }
}
