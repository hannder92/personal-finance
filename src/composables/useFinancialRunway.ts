import { computed, type ComputedRef } from 'vue'
import { calcFinancialRunway, type RunwayResult } from '@/lib/calculations/financial-runway'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'

export interface UseFinancialRunway {
  runway: ComputedRef<RunwayResult>
}

export function useFinancialRunway(): UseFinancialRunway {
  const { liquidAssets, monthlyOutflow } = useLiquidMetrics()

  // Runway counts debt payments too: they must be paid while living off savings.
  const runway = computed(() =>
    calcFinancialRunway({
      liquidAssets: liquidAssets.value,
      monthlyLivingExpense: monthlyOutflow.value,
    })
  )

  return { runway }
}
