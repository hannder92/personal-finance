// Projection assumptions (20261002-proyecciones-reales): inflation, expected return
// (the shared projection rate, OQ-4), withdrawal rate and the FI horizon.

import { computed } from 'vue'
import { isOptimisticRealRate, realRatePercent } from '@/lib/calculations/real-projection'
import { COLOMBIA_REFERENCE } from '@/lib/calculations/assumptions-reference'
import { useSettingsStore } from '@/stores/settingsStore'

export function useAssumptions() {
  const settings = useSettingsStore()

  const inflationPercent = computed(() => settings.state.inflationPercent ?? 0)
  const annualReturnPercent = computed(() => settings.state.projectionAnnualRatePercent ?? 0)
  const withdrawalRatePercent = computed(() => settings.state.withdrawalRatePercent ?? 4)
  const fiDesiredYears = computed(() => settings.state.fiDesiredYears ?? 20)

  const realRate = computed(() =>
    realRatePercent(annualReturnPercent.value, inflationPercent.value)
  )
  const optimistic = computed(() =>
    isOptimisticRealRate(annualReturnPercent.value, inflationPercent.value)
  )

  return {
    inflationPercent,
    annualReturnPercent,
    withdrawalRatePercent,
    fiDesiredYears,
    realRate,
    optimistic,
    reference: COLOMBIA_REFERENCE,
  }
}
