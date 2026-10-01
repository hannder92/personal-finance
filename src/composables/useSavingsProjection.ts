// Bridges liquid assets + realistic monthly saving to lib/calculations/savings-projection.
// Both curves start from the same liquid balance and add the same monthly contribution
// (the saving that is both on-rule and affordable); the compound curve also earns
// settings.projectionAnnualRatePercent, so the gap between them is the return.

import { computed, type ComputedRef } from 'vue'
import {
  calcContributionGrowth,
  type CompoundGrowthPoint,
  type HypotheticalSavingsPoint,
} from '@/lib/calculations/savings-projection'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useSettingsStore } from '@/stores/settingsStore'

const MONTHS_AHEAD = 12

export interface UseSavingsProjection {
  /** Liquid balance + monthly contributions, no returns. */
  hypothetical: ComputedRef<HypotheticalSavingsPoint[]>
  /** Same contributions compounding at the projection rate. */
  compound: ComputedRef<CompoundGrowthPoint[]>
  hasConfiguredRate: ComputedRef<boolean>
  projectionRatePercent: ComputedRef<number>
  liquidTotal: ComputedRef<number>
  monthlyContribution: ComputedRef<number>
}

export function useSavingsProjection(): UseSavingsProjection {
  const settings = useSettingsStore()
  const { liquidAssets } = useLiquidMetrics()
  const { effectiveGoalCap } = useSavingsFeasibility()

  const projectionRatePercent = computed(() => settings.state.projectionAnnualRatePercent)
  const liquidTotal = computed(() => liquidAssets.value)
  const monthlyContribution = computed(() => Math.max(0, effectiveGoalCap.value))
  const hasConfiguredRate = computed(
    () =>
      projectionRatePercent.value > 0 && (liquidTotal.value > 0 || monthlyContribution.value > 0)
  )

  const series = computed(() =>
    calcContributionGrowth({
      startingBalance: liquidTotal.value,
      monthlyContribution: monthlyContribution.value,
      annualRatePercent: projectionRatePercent.value,
      monthsAhead: MONTHS_AHEAD,
    })
  )

  const hypothetical = computed(() =>
    series.value.map((p) => ({ month: p.month, cumulativeAmount: p.contributed }))
  )
  const compound = computed(() =>
    series.value.map((p) => ({ month: p.month, totalValue: p.withReturns }))
  )

  return {
    hypothetical,
    compound,
    hasConfiguredRate,
    projectionRatePercent,
    liquidTotal,
    monthlyContribution,
  }
}
