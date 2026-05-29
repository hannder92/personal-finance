import { computed, type ComputedRef } from 'vue'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'

export interface UseGoalsBudget {
  goalCap: ComputedRef<number>
}

export function useGoalsBudget(): UseGoalsBudget {
  const { effectiveGoalCap } = useSavingsFeasibility()
  const goalCap = computed(() => effectiveGoalCap.value)
  return { goalCap }
}
