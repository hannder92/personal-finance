// Stub for TDD RED phase. Full impl in T-047.
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface AllocationState {
  needs: number
  wants: number
  savings: number
}

export const useAllocationStore = defineStore('allocation', () => {
  const state = reactive<AllocationState>({ needs: 50, wants: 30, savings: 20 })

  function setAllocation(needs: number, wants: number): boolean {
    if (needs < 0 || wants < 0 || needs + wants > 100) return false
    state.needs = needs
    state.wants = wants
    state.savings = 100 - needs - wants
    return true
  }

  return { state, setAllocation }
})
