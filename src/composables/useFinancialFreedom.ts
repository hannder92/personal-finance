import { computed, type ComputedRef } from 'vue'
import {
  calcFinancialFreedom,
  type FinancialFreedomResult,
} from '@/lib/calculations/financial-freedom'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'

export type UseFinancialFreedom = {
  [K in keyof FinancialFreedomResult]: ComputedRef<FinancialFreedomResult[K]>
}

export function useFinancialFreedom(): UseFinancialFreedom {
  const { liquidAssets, monthlyLivingExpense } = useLiquidMetrics()
  const { feasible } = useSavingsFeasibility()

  const result = computed(() =>
    calcFinancialFreedom({
      monthlyLivingExpense: monthlyLivingExpense.value,
      liquidAssets: liquidAssets.value,
      monthlyFeasibleSavings: feasible.value,
    })
  )

  return {
    monthlyLivingExpense: computed(() => result.value.monthlyLivingExpense),
    liquidAssets: computed(() => result.value.liquidAssets),
    targetPatrimony: computed(() => result.value.targetPatrimony),
    progressPercent: computed(() => result.value.progressPercent),
    monthsToTarget: computed(() => result.value.monthsToTarget),
    targetReached: computed(() => result.value.targetReached),
  }
}
