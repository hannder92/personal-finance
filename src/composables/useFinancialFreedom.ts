import { computed, type ComputedRef } from 'vue'
import {
  calcFinancialFreedom,
  type FinancialFreedomResult,
} from '@/lib/calculations/financial-freedom'
import { useAssumptions } from '@/composables/useAssumptions'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'

export type UseFinancialFreedom = {
  [K in keyof FinancialFreedomResult]: ComputedRef<FinancialFreedomResult[K]>
}

export function useFinancialFreedom(): UseFinancialFreedom {
  const { liquidAssets, monthlyLivingExpense } = useLiquidMetrics()
  const { feasible } = useSavingsFeasibility()
  const { annualReturnPercent, inflationPercent, withdrawalRatePercent, fiDesiredYears } =
    useAssumptions()

  const result = computed(() =>
    calcFinancialFreedom({
      monthlyLivingExpense: monthlyLivingExpense.value,
      liquidAssets: liquidAssets.value,
      monthlyFeasibleSavings: feasible.value,
      annualReturnPercent: annualReturnPercent.value,
      inflationPercent: inflationPercent.value,
      withdrawalRatePercent: withdrawalRatePercent.value,
      desiredYears: fiDesiredYears.value,
    })
  )

  return {
    monthlyLivingExpense: computed(() => result.value.monthlyLivingExpense),
    liquidAssets: computed(() => result.value.liquidAssets),
    targetPatrimony: computed(() => result.value.targetPatrimony),
    progressPercent: computed(() => result.value.progressPercent),
    monthsToTarget: computed(() => result.value.monthsToTarget),
    monthsWithoutReturn: computed(() => result.value.monthsWithoutReturn),
    targetReached: computed(() => result.value.targetReached),
    desiredYears: computed(() => result.value.desiredYears),
    requiredMonthlyForDesired: computed(() => result.value.requiredMonthlyForDesired),
    currentSavingsSuffices: computed(() => result.value.currentSavingsSuffices),
  }
}
