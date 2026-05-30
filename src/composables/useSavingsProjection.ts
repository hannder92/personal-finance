// Bridges assets/income/allocation stores to lib/calculations/savings-projection.
// Compound series uses total liquid net worth × settings.projectionAnnualRatePercent (OQ-3).

import { computed, type ComputedRef } from 'vue'
import {
  calcCompoundGrowth,
  calcHypotheticalSavings,
  type CompoundGrowthPoint,
  type HypotheticalSavingsPoint,
} from '@/lib/calculations/savings-projection'
import { useAllocationStore } from '@/stores/allocationStore'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useNetIncome } from './useNetIncome'
import { useSettingsStore } from '@/stores/settingsStore'

const MONTHS_AHEAD = 12

export interface UseSavingsProjection {
  hypothetical: ComputedRef<HypotheticalSavingsPoint[]>
  compound: ComputedRef<CompoundGrowthPoint[]>
  hasConfiguredRate: ComputedRef<boolean>
  projectionRatePercent: ComputedRef<number>
  liquidTotal: ComputedRef<number>
}

export function useSavingsProjection(): UseSavingsProjection {
  const allocation = useAllocationStore()
  const settings = useSettingsStore()
  const { liquidAssets } = useLiquidMetrics()
  const { netIncome } = useNetIncome()

  const projectionRatePercent = computed(() => settings.state.projectionAnnualRatePercent)
  const liquidTotal = computed(() => liquidAssets.value)
  const hasConfiguredRate = computed(() => projectionRatePercent.value > 0 && liquidTotal.value > 0)

  const hypothetical = computed(() =>
    calcHypotheticalSavings({
      netIncome: netIncome.value,
      savingsRatePercent: allocation.state.savings,
      monthsAhead: MONTHS_AHEAD,
    })
  )

  const compound = computed(() =>
    calcCompoundGrowth(
      [
        {
          balance: liquidTotal.value,
          annualRatePercent: projectionRatePercent.value,
        },
      ],
      MONTHS_AHEAD
    )
  )

  return {
    hypothetical,
    compound,
    hasConfiguredRate,
    projectionRatePercent,
    liquidTotal,
  }
}
