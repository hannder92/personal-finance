import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMonthClose } from '@/composables/useMonthClose'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

describe('composables/useMonthClose', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('first run only remembers the current month', () => {
    const settings = useSettingsStore()
    const closed = useMonthClose().runMonthClose(new Date(2026, 9, 5))
    expect(closed).toBe(false)
    expect(settings.state.lastMonthSeen).toBe('2026-10')
    expect(useSnapshotsStore().state.items).toHaveLength(0)
  })

  it('same month does nothing', () => {
    const settings = useSettingsStore()
    settings.setLastMonthSeen('2026-10')
    expect(useMonthClose().runMonthClose(new Date(2026, 9, 20))).toBe(false)
  })

  it('a new month stores a snapshot of the closed month and resets variable spending', () => {
    const settings = useSettingsStore()
    settings.setLastMonthSeen('2026-09')
    settings.setDeductRetencion(false)
    useIncomeStore().setGrossSalary(5_000_000)
    const variable = useVariableExpensesStore()
    variable.add({ name: 'Mercado', budget: 800_000, spent: 650_000 })

    const closed = useMonthClose().runMonthClose(new Date(2026, 9, 1))

    expect(closed).toBe(true)
    const [snap] = useSnapshotsStore().state.items
    expect(snap).toMatchObject({
      month: '2026-09',
      netIncome: 5_000_000,
      totalVariableSpent: 650_000,
    })
    expect(variable.state.items[0]!.spent).toBe(0)
    expect(settings.state.lastMonthSeen).toBe('2026-10')
  })
})
