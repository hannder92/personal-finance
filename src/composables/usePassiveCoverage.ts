import { computed, type ComputedRef } from 'vue'
import {
  calcPassiveCoverage,
  type PassiveCoverageResult,
} from '@/lib/calculations/passive-coverage'
import { useIncomeMix } from '@/composables/useIncomeMix'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'

export interface UsePassiveCoverage {
  coverage: ComputedRef<PassiveCoverageResult>
}

export function usePassiveCoverage(): UsePassiveCoverage {
  const { mix } = useIncomeMix()
  const { monthlyLivingExpense } = useLiquidMetrics()

  const coverage = computed(() =>
    calcPassiveCoverage({
      monthlyPassive: mix.value.passive,
      monthlyResidual: mix.value.residual,
      monthlyLivingExpense: monthlyLivingExpense.value,
    })
  )

  return { coverage }
}
