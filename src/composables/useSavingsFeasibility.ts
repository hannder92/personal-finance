import { computed, type ComputedRef } from 'vue'
import { calcSavingsFeasibility } from '@/lib/calculations/savings-feasibility'
import { useAllocationStore } from '@/stores/allocationStore'
import { useNetIncome } from '@/composables/useNetIncome'

export interface UseSavingsFeasibility {
  objective: ComputedRef<number>
  feasible: ComputedRef<number>
  gap: ComputedRef<number>
  isRuleViable: ComputedRef<boolean>
  effectiveGoalCap: ComputedRef<number>
}

export function useSavingsFeasibility(): UseSavingsFeasibility {
  const allocation = useAllocationStore()
  const { netIncome, freeForAllocation } = useNetIncome()

  const result = computed(() =>
    calcSavingsFeasibility({
      netIncome: netIncome.value,
      savingsPercent: allocation.state.savings,
      freeForAllocation: freeForAllocation.value,
    })
  )

  const objective = computed(() => result.value.objective)
  const feasible = computed(() => result.value.feasible)
  const gap = computed(() => result.value.gap)
  const isRuleViable = computed(() => result.value.isRuleViable)
  const effectiveGoalCap = computed(() => Math.min(result.value.objective, result.value.feasible))

  return { objective, feasible, gap, isRuleViable, effectiveGoalCap }
}
