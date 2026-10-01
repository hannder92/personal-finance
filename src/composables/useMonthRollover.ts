// Month close (ADR-7, AC-13.1, AC-8.4): when the app sees a new calendar month, it saves a
// snapshot of the month that just ended and resets variable-expense spending for the new one.
// The snapshot keeps totalVariableSpent, so the reset loses no history.

import { computed } from 'vue'
import { buildSnapshot } from '@/lib/calculations/snapshot'
import { calcNetWorth } from '@/lib/calculations/net-worth'
import { formatYearMonth, getMonthToClose } from '@/lib/date/month'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'
import { useDTI } from './useDTI'
import { useHealthScore } from './useHealthScore'
import { useNetIncome } from './useNetIncome'

// SnapshotSchema bounds dti to [0, 1000].
const MAX_DTI = 1000
const HEALTH_COMPONENTS = 4

export function useMonthRollover() {
  const settings = useSettingsStore()
  const expenses = useExpensesStore()
  const variable = useVariableExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const snapshots = useSnapshotsStore()
  const { netIncome } = useNetIncome()
  const { dti } = useDTI()
  const { result: health } = useHealthScore()

  const savingsRate = computed(() => {
    if (netIncome.value <= 0) return 0
    const contrib = goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
    return (contrib / netIncome.value) * 100
  })

  // Returns the closed month (YYYY-MM) when a rollover happened, otherwise null.
  function checkRollover(now: Date = new Date()): string | null {
    const currentMonth = formatYearMonth(now)
    const lastSeen = settings.state.lastMonthSeen
    const monthToClose = getMonthToClose(lastSeen, currentMonth)

    if (!monthToClose) {
      if (!lastSeen) settings.setLastMonthSeen(currentMonth)
      return null
    }

    const dtiValue = Number.isFinite(dti.value) ? Math.min(Math.max(dti.value, 0), MAX_DTI) : 0
    snapshots.append(
      buildSnapshot(
        {
          month: monthToClose,
          netIncome: Math.max(0, netIncome.value),
          totalFixedExpenses: expenses.state.items.reduce((acc, e) => acc + e.amount, 0),
          totalVariableSpent: variable.state.items.reduce((acc, v) => acc + v.spent, 0),
          totalDebt: cards.state.items.reduce((acc, c) => acc + c.balance, 0),
          dti: dtiValue,
          savingsRate: savingsRate.value,
          netWorth: calcNetWorth(assets.state.items, cards.state.items),
          healthScore: health.value.missing.length >= HEALTH_COMPONENTS ? null : health.value.score,
        },
        now
      )
    )
    variable.resetAllSpent()
    settings.setLastMonthSeen(currentMonth)
    return monthToClose
  }

  return { checkRollover }
}
