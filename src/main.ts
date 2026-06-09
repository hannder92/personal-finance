import { createApp, nextTick, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { loadAppState, saveAppState } from './lib/storage/useAppStorage'
import { runMonthRollover } from './composables/useMonthRollover'
import { useStorageError } from './composables/useStorageError'
import type { AppStateV5 } from './lib/storage/schema'
import { useAllocationStore } from './stores/allocationStore'
import { useAssetsStore } from './stores/assetsStore'
import { useCardsStore } from './stores/cardsStore'
import { useExpensesStore } from './stores/expensesStore'
import { useGoalsStore } from './stores/goalsStore'
import { useIncomeStore } from './stores/incomeStore'
import { useSettingsStore } from './stores/settingsStore'
import { useSnapshotsStore } from './stores/snapshotsStore'
import { useVariableExpensesStore } from './stores/variableExpensesStore'
import './style.css'

const pinia = createPinia()

// Set to true during hydrateStores so the persist watcher does not fire while
// store state is being repopulated from localStorage. Cleared on nextTick after mount.
let isHydrating = true

// Hydrate stores from localStorage before the router guard runs.
function hydrateStores() {
  const { state } = loadAppState()
  if (!state) return

  const settings = useSettingsStore()
  settings.setLang(state.settings.lang)
  settings.setCurrency(state.settings.currency)
  settings.setTheme(state.settings.theme)
  settings.setPayoffMethod(state.settings.payoffMethod)
  settings.setProjectionAnnualRatePercent(state.settings.projectionAnnualRatePercent ?? 0)
  if (state.settings.lastMonthSeen) settings.setLastMonthSeen(state.settings.lastMonthSeen)
  settings.setUserName(state.settings.userName ?? '')

  const income = useIncomeStore()
  income.setGrossSalary(state.income.grossSalary)
  income.state.deductions.splice(0, Infinity, ...state.income.deductions)
  income.state.otherStreams.splice(0, Infinity, ...state.income.otherStreams)
  income.state.nonSalaryBenefits.splice(0, Infinity, ...state.income.nonSalaryBenefits)

  const expenses = useExpensesStore()
  expenses.state.items.splice(0, Infinity, ...state.expenses)

  const cards = useCardsStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cards.state.items.splice(0, Infinity, ...(state.cards as any[]))

  const goals = useGoalsStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals.state.items.splice(0, Infinity, ...(state.goals as any[]))

  const assets = useAssetsStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets.state.items.splice(0, Infinity, ...(state.assets as any[]))

  const variable = useVariableExpensesStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variable.state.items.splice(0, Infinity, ...(state.variableExpenses as any[]))

  const snapshots = useSnapshotsStore()
  snapshots.setAll(state.snapshots)

  const allocation = useAllocationStore()
  allocation.setAllocation(state.allocation.needs, state.allocation.wants)
}

// Watches all store states and persists to localStorage on any change.
function persistStores(): void {
  const settings = useSettingsStore()
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const variable = useVariableExpensesStore()
  const snapshots = useSnapshotsStore()
  const allocation = useAllocationStore()

  const { setError, registerRetrySource } = useStorageError()

  function buildPayload(): AppStateV5 {
    return {
      schemaVersion: 5,
      settings: {
        lang: settings.state.lang,
        currency: settings.state.currency,
        theme: settings.state.theme,
        payoffMethod: settings.state.payoffMethod,
        lastMonthSeen: settings.state.lastMonthSeen,
        onboarding: { done: true, currentStep: 0 },
        projectionAnnualRatePercent: settings.state.projectionAnnualRatePercent,
        userName: settings.state.userName,
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
  // Register the payload provider so the retry button can re-attempt the save.
  registerRetrySource(buildPayload)

  watch(
    () => [
      settings.state,
      income.state,
      expenses.state,
      cards.state,
      goals.state,
      assets.state,
      variable.state,
      snapshots.state,
      allocation.state,
    ],
    () => {
      if (isHydrating) return
      const result = saveAppState(buildPayload())
      if (!result.ok) setError(result.reason)
    },
    { deep: true }
  )
}

// Pinia must be active before stores are accessed.
const app = createApp(App)
app.use(pinia)
hydrateStores()
persistStores()
app.use(router).use(i18n).mount('#app')
nextTick(() => {
  isHydrating = false
  // ADR-1: run after the hydration flag clears so the persist watcher saves the
  // closed-month snapshot and the variable-spent reset.
  runMonthRollover()
})
