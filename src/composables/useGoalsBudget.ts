// goalCap = (allocation.savings / 100) × netIncome. Reactive to both stores.

import { computed, type ComputedRef } from 'vue'
import { useAllocationStore } from '@/stores/allocationStore'
import { useNetIncome } from './useNetIncome'

export interface UseGoalsBudget {
  goalCap: ComputedRef<number>
}

export function useGoalsBudget(): UseGoalsBudget {
  const allocation = useAllocationStore()
  const { netIncome } = useNetIncome()

  const goalCap = computed(() => (allocation.state.savings / 100) * netIncome.value)

  return { goalCap }
}
