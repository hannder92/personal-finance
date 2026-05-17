// Bridges assets/income/allocation stores to lib/calculations/savings-projection.
// Returns both the hypothetical (linear) and compound (per-asset rate) series.
// hasConfiguredRate is false when no qualifying asset (savings | investment with rate > 0)
// exists — drives the AC-8.5 empty state inside SavingsProjectionChart.

import { computed, type ComputedRef } from 'vue'
import {
  calcCompoundGrowth,
  calcHypotheticalSavings,
  type CompoundGrowthPoint,
  type HypotheticalSavingsPoint,
} from '@/lib/calculations/savings-projection'
import { useAllocationStore } from '@/stores/allocationStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useNetIncome } from './useNetIncome'

const COMPOUND_ELIGIBLE_TYPES = new Set(['savings', 'investment'])
const MONTHS_AHEAD = 12

export interface UseSavingsProjection {
  hypothetical: ComputedRef<HypotheticalSavingsPoint[]>
  compound: ComputedRef<CompoundGrowthPoint[]>
  hasConfiguredRate: ComputedRef<boolean>
}

export function useSavingsProjection(): UseSavingsProjection {
  const allocation = useAllocationStore()
  const assets = useAssetsStore()
  const { netIncome } = useNetIncome()

  const qualifyingAssets = computed(() =>
    assets.state.items.filter(
      (a) => COMPOUND_ELIGIBLE_TYPES.has(a.type) && a.annualRatePercent > 0
    )
  )

  const hasConfiguredRate = computed(() => qualifyingAssets.value.length > 0)

  const hypothetical = computed(() =>
    calcHypotheticalSavings({
      netIncome: netIncome.value,
      savingsRatePercent: allocation.state.savings,
      monthsAhead: MONTHS_AHEAD,
    })
  )

  const compound = computed(() =>
    calcCompoundGrowth(
      qualifyingAssets.value.map((a) => ({
        balance: a.value,
        annualRatePercent: a.annualRatePercent,
      })),
      MONTHS_AHEAD
    )
  )

  return { hypothetical, compound, hasConfiguredRate }
}
