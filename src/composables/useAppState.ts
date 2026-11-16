import type { AppStateV6 } from '@/lib/storage/schema'
import { useAllocationStore } from '@/stores/allocationStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

// Single bridge between the persisted AppStateV6 shape and the Pinia stores. Boot
// hydration, the persist watcher, and backup export/import all go through here so
// the three paths cannot drift apart (the old export wrote a partial v2 payload and
// the old import restored only settings + gross salary).
export function useAppState() {
  const settings = useSettingsStore()
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const variable = useVariableExpensesStore()
  const snapshots = useSnapshotsStore()
  const allocation = useAllocationStore()

  function buildAppState(): AppStateV6 {
    return {
      schemaVersion: 6,
      settings: {
        lang: settings.state.lang,
        currency: settings.state.currency,
        theme: settings.state.theme,
        payoffMethod: settings.state.payoffMethod,
        lastMonthSeen: settings.state.lastMonthSeen,
        onboarding: { done: true, currentStep: 0 },
        projectionAnnualRatePercent: settings.state.projectionAnnualRatePercent,
        userName: settings.state.userName,
        deductRetencion: settings.state.deductRetencion,
      },
      income: {
        grossSalary: income.state.grossSalary,
        deductions: income.state.deductions,
        otherStreams: income.state.otherStreams,
        nonSalaryBenefits: income.state.nonSalaryBenefits,
      },
      expenses: expenses.state.items,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cards: cards.state.items as any,
      goals: goals.state.items,
      assets: assets.state.items,
      variableExpenses: variable.state.items,
      snapshots: snapshots.state.items,
      allocation: {
        needs: allocation.state.needs,
        wants: allocation.state.wants,
        savings: allocation.state.savings,
      },
    }
  }

  // Replaces every store's content with `state`. Callers pass a payload already
  // validated against AppStateSchemaV6.
  function applyAppState(state: AppStateV6): void {
    settings.setLang(state.settings.lang)
    settings.setCurrency(state.settings.currency)
    settings.setTheme(state.settings.theme)
    settings.setPayoffMethod(state.settings.payoffMethod)
    settings.setProjectionAnnualRatePercent(state.settings.projectionAnnualRatePercent ?? 0)
    settings.setDeductRetencion(state.settings.deductRetencion ?? true)
    if (state.settings.lastMonthSeen) settings.setLastMonthSeen(state.settings.lastMonthSeen)
    settings.setUserName(state.settings.userName ?? '')

    income.setGrossSalary(state.income.grossSalary)
    income.state.deductions.splice(0, Infinity, ...state.income.deductions)
    income.state.otherStreams.splice(0, Infinity, ...state.income.otherStreams)
    income.state.nonSalaryBenefits.splice(0, Infinity, ...state.income.nonSalaryBenefits)

    expenses.state.items.splice(0, Infinity, ...state.expenses)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards.state.items.splice(0, Infinity, ...(state.cards as any[]))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goals.state.items.splice(0, Infinity, ...(state.goals as any[]))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets.state.items.splice(0, Infinity, ...(state.assets as any[]))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variable.state.items.splice(0, Infinity, ...(state.variableExpenses as any[]))
    snapshots.setAll(state.snapshots)
    allocation.setAllocation(state.allocation.needs, state.allocation.wants)
  }

  return { buildAppState, applyAppState }
}
