// Bridges variableExpensesStore + snapshotsStore to calcSpendingPace (US-2).
// Previous month total comes from the closed-month snapshot; without it the
// pace is 'none' (neutral copy, no badge).

import { computed, type ComputedRef } from 'vue'
import { calcSpendingPace, type SpendingPaceResult } from '@/lib/calculations/spending-pace'
import { formatYearMonth } from '@/lib/date/month'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

export interface UseSpendingPace {
  pace: ComputedRef<SpendingPaceResult>
}

export function useSpendingPace(now: Date = new Date()): UseSpendingPace {
  const variable = useVariableExpensesStore()
  const snapshots = useSnapshotsStore()

  const previousMonth = formatYearMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const pace = computed(() => {
    const previous = snapshots.state.items.find((s) => s.month === previousMonth)
    return calcSpendingPace({
      currentVariableSpent: variable.state.items.reduce((acc, v) => acc + v.spent, 0),
      previousVariableTotal: previous ? previous.totalVariableSpent : null,
      dayOfMonth: now.getDate(),
      daysInMonth,
    })
  })

  return { pace }
}
