// Month close: when the app opens in a new calendar month, store a snapshot of the
// month that just ended, reset variable spending and remember the new month.

import { calcNetWorth } from '@/lib/calculations/net-worth'
import { buildSnapshot } from '@/lib/calculations/snapshot'
import { detectMonthRollover, formatYearMonth } from '@/lib/date/month'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'
import { useBaseMetrics } from './useBaseMetrics'
import { useDTI } from './useDTI'
import { useHealthScore } from './useHealthScore'

export interface UseMonthClose {
  /** Returns true when a month was closed. */
  runMonthClose: (now?: Date) => boolean
}

export function useMonthClose(): UseMonthClose {
  const settings = useSettingsStore()
  const snapshots = useSnapshotsStore()
  const variable = useVariableExpensesStore()
  const assets = useAssetsStore()
  const cards = useCardsStore()
  const base = useBaseMetrics()
  const { dti } = useDTI()
  const { result: health } = useHealthScore()

  function runMonthClose(now: Date = new Date()): boolean {
    const current = formatYearMonth(now)
    const last = settings.state.lastMonthSeen
    if (!last) {
      settings.setLastMonthSeen(current)
      return false
    }
    if (!detectMonthRollover(last, current) || last > current) return false

    const income = base.monthlyIncome.value
    const savingsRate = income > 0 ? (base.freeForAllocation.value / income) * 100 : 0
    const snapshot = buildSnapshot(
      {
        month: last,
        netIncome: Math.max(0, income),
        totalFixedExpenses: base.fixedExpenses.value,
        totalVariableSpent: variable.state.items.reduce((acc, v) => acc + v.spent, 0),
        totalDebt: cards.state.items.reduce((acc, c) => acc + c.balance, 0),
        // netIncome is already net of libranzas; the flow chart subtracts debtPayments.
        debtPayments: base.cashDebtObligation.value,
        dti: Math.min(1000, Math.max(0, dti.value)),
        savingsRate,
        netWorth: calcNetWorth(assets.state.items, cards.state.items),
        healthScore: health.value.missing.length === 4 ? null : health.value.score,
      },
      now
    )
    snapshots.append(snapshot)
    variable.resetAllSpent()
    settings.setLastMonthSeen(current)
    return true
  }

  return { runMonthClose }
}
