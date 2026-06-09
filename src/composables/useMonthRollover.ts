// Month rollover at boot (ADR-1, 20260609-dashboard-fintech-redesign).
// Before this feature the rollover libs (detectMonthRollover, buildSnapshot,
// resetAllSpent) existed but nothing invoked them at runtime, so snapshots were
// never captured in production. main.ts calls runMonthRollover() once after
// hydration (when the persist watcher is live, so the closed month is saved).

import { detectMonthRollover, formatYearMonth } from '@/lib/date/month'
import { buildSnapshot } from '@/lib/calculations/snapshot'
import { calcNetWorth } from '@/lib/calculations/net-worth'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'
import { useDTI } from './useDTI'
import { useHealthScore } from './useHealthScore'
import { useNetIncome } from './useNetIncome'

export function runMonthRollover(now: Date = new Date()): void {
  const settings = useSettingsStore()
  const currentMonth = formatYearMonth(now)
  const lastMonthSeen = settings.state.lastMonthSeen

  // First boot ever: nothing to close, just stamp the current month.
  if (!lastMonthSeen) {
    settings.setLastMonthSeen(currentMonth)
    return
  }
  if (!detectMonthRollover(lastMonthSeen, currentMonth)) return

  const snapshots = useSnapshotsStore()
  const variable = useVariableExpensesStore()

  // Guard: never capture the same closed month twice (e.g. stale lastMonthSeen
  // after a partial boot or imported state).
  const alreadyCaptured = snapshots.state.items.some((s) => s.month === lastMonthSeen)
  if (!alreadyCaptured) {
    const expenses = useExpensesStore()
    const cards = useCardsStore()
    const assets = useAssetsStore()
    const { netIncome } = useNetIncome()
    const { dti, totalDebtObligation } = useDTI()
    const { result: health } = useHealthScore()

    const totalFixedExpenses = expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
    const totalVariableSpent = variable.state.items.reduce((acc, v) => acc + v.spent, 0)
    const totalDebt = cards.state.items.reduce((acc, c) => acc + c.balance, 0)
    const netIncomeValue = netIncome.value
    const savingsRate =
      netIncomeValue > 0
        ? ((netIncomeValue - totalFixedExpenses - totalVariableSpent - totalDebtObligation.value) /
            netIncomeValue) *
          100
        : 0

    snapshots.append(
      buildSnapshot(
        {
          month: lastMonthSeen,
          netIncome: netIncomeValue,
          totalFixedExpenses,
          totalVariableSpent,
          totalDebt,
          debtPayments: totalDebtObligation.value,
          dti: dti.value,
          savingsRate,
          netWorth: calcNetWorth(assets.state.items, cards.state.items),
          healthScore: health.value.score,
        },
        now
      )
    )
  }

  variable.resetAllSpent()
  settings.setLastMonthSeen(currentMonth)
}
