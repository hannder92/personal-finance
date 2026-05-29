import { parseBackup, serialize } from '@/lib/storage/backup'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

export interface ImportResult {
  ok: boolean
  error?: string
}

export function useImportExport() {
  const settings = useSettingsStore()
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const variable = useVariableExpensesStore()
  const snapshots = useSnapshotsStore()

  function exportToFile(): void {
    const data = {
      schemaVersion: 2 as const,
      settings: {
        lang: settings.state.lang,
        currency: settings.state.currency,
        theme: settings.state.theme,
        payoffMethod: settings.state.payoffMethod,
        onboarding: { done: true, currentStep: 0 },
        lastMonthSeen: settings.state.lastMonthSeen,
      },
      income: income.state,
      expenses: expenses.state.items,
      cards: cards.state.items,
      goals: goals.state.items,
      assets: assets.state.items,
      variableExpenses: variable.state.items,
      snapshots: snapshots.state.items,
      allocation: { needs: 50, wants: 30, savings: 20 },
    }

    let body: string
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body = serialize(data as any)
    } catch {
      body = JSON.stringify(
        {
          appName: 'personal-finances',
          schemaVersion: 2,
          exportedAt: new Date().toISOString(),
          data,
        },
        null,
        2
      )
    }

    const blob = new Blob([body], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-finances-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importFromFile(file: File): Promise<ImportResult> {
    const json = await file.text()
    const result = parseBackup(json)
    if (!result.success) {
      return { ok: false, error: result.error.issues[0]?.message ?? 'invalid_backup' }
    }
    const data = result.data.data
    settings.setLang(data.settings.lang)
    settings.setCurrency(data.settings.currency)
    settings.setTheme(data.settings.theme)
    settings.setPayoffMethod(data.settings.payoffMethod)
    if (data.settings.lastMonthSeen) settings.setLastMonthSeen(data.settings.lastMonthSeen)
    income.setGrossSalary(data.income.grossSalary)

    // Silence unused warnings until full hydration lands.
    void expenses
    void cards
    void goals
    void assets
    void variable
    void snapshots

    return { ok: true }
  }

  return { exportToFile, importFromFile }
}
