import { createApp, nextTick, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { loadAppState, saveAppState } from './lib/storage/useAppStorage'
import { useStorageError } from './composables/useStorageError'
import { useMonthClose } from './composables/useMonthClose'
import { useAppState } from './composables/useAppState'
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
  useAppState().applyAppState(state)
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
  const { buildAppState } = useAppState()

  const { setError, registerRetrySource } = useStorageError()

  // Register the payload provider so the retry button can re-attempt the save.
  registerRetrySource(buildAppState)

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
      const result = saveAppState(buildAppState())
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
  // Runs after hydration so the snapshot and the variable reset are persisted.
  const { runMonthClose } = useMonthClose()
  runMonthClose()
  // Catch a month change while the tab stays open in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') runMonthClose()
  })
})
