// Bridges snapshotsStore to buildMonthlyFlow for the cash flow chart (US-4).

import { computed, type ComputedRef } from 'vue'
import { buildMonthlyFlow, type MonthlyFlowPoint } from '@/lib/calculations/monthly-flow'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

export interface UseMonthlyFlow {
  points: ComputedRef<MonthlyFlowPoint[]>
}

export function useMonthlyFlow(): UseMonthlyFlow {
  const snapshots = useSnapshotsStore()
  const points = computed(() => buildMonthlyFlow(snapshots.state.items))
  return { points }
}
