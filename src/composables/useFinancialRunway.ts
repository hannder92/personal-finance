import { computed, type ComputedRef } from 'vue'
import { calcFinancialRunway, type RunwayResult } from '@/lib/calculations/financial-runway'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'

export interface UseFinancialRunway {
  runway: ComputedRef<RunwayResult>
}

export function useFinancialRunway(): UseFinancialRunway {
  const { liquidAssets, monthlyLivingExpense } = useLiquidMetrics()

  const runway = computed(() =>
    calcFinancialRunway({
      liquidAssets: liquidAssets.value,
      monthlyLivingExpense: monthlyLivingExpense.value,
    })
  )

  return { runway }
}
