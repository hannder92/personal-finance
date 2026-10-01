import type { ComputedRef } from 'vue'
import { useBaseMetrics } from '@/composables/useBaseMetrics'

export interface UseLiquidMetrics {
  liquidAssets: ComputedRef<number>
  /** fixed + variable (no debt). */
  monthlyLivingExpense: ComputedRef<number>
  /** fixed + variable + debt obligations. */
  monthlyOutflow: ComputedRef<number>
}

export function useLiquidMetrics(): UseLiquidMetrics {
  const { liquidAssets, livingExpense, monthlyOutflow } = useBaseMetrics()
  return { liquidAssets, monthlyLivingExpense: livingExpense, monthlyOutflow }
}
