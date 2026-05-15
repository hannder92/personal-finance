import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { loadAppState } from './lib/storage/useAppStorage'
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

// Hydrate stores from localStorage before the router guard runs.
function hydrateStores() {
  const { state } = loadAppState()
  if (!state) return

  const settings = useSettingsStore()
  settings.setLang(state.settings.lang)
  settings.setCurrency(state.settings.currency)
  settings.setTheme(state.settings.theme)
  settings.setPayoffMethod(state.settings.payoffMethod)
  if (state.settings.lastMonthSeen) settings.setLastMonthSeen(state.settings.lastMonthSeen)
  settings.setOnboardingDone(state.settings.onboarding.done)
  settings.state.onboarding.currentStep = state.settings.onboarding.currentStep

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshots.setAll(state.snapshots as any)

  const allocation = useAllocationStore()
  allocation.setAllocation(state.allocation.needs, state.allocation.wants)
}

// Pinia must be active before stores are accessed.
const app = createApp(App)
app.use(pinia)
hydrateStores()
app.use(router).use(i18n).mount('#app')
