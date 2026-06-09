// T-008 — Covers: EC-1, AC-2.1, AC-4.1 · TC-U-009, TC-I-013 (constitution-driven: guard anti doble-snapshot)
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { runMonthRollover } from '@/composables/useMonthRollover'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const BOOT_JUNE = new Date(2026, 5, 9, 8, 0, 0) // 2026-06-09

function seedStores() {
  const settings = useSettingsStore()
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const variable = useVariableExpensesStore()

  settings.setLastMonthSeen('2026-05')
  income.setGrossSalary(5_000_000)
  expenses.add({ name: 'Arriendo', amount: 1_200_000, category: 'housing' })
  variable.add({ name: 'Mercado', budget: 600_000, spent: 0, categoryId: 'food' })
  const catId = variable.state.items[0]!.id
  variable.recordSpending(catId, 450_000)
  return { settings, variable }
}

describe('runMonthRollover (TC-U-009, TC-I-013)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-I-013: on month change appends closed-month snapshot, resets variable spent, updates lastMonthSeen (EC-1)', () => {
    const { settings, variable } = seedStores()
    const snapshots = useSnapshotsStore()

    runMonthRollover(BOOT_JUNE)

    expect(snapshots.state.items).toHaveLength(1)
    const snap = snapshots.state.items[0]!
    expect(snap.month).toBe('2026-05')
    expect(snap.totalVariableSpent).toBe(450_000)
    expect(snap.totalFixedExpenses).toBe(1_200_000)
    expect(typeof snap.debtPayments).toBe('number')
    expect(variable.state.items[0]!.spent).toBe(0)
    expect(settings.state.lastMonthSeen).toBe('2026-06')
  })

  it('TC-U-009: same month boot is a no-op', () => {
    const { settings } = seedStores()
    settings.setLastMonthSeen('2026-06')
    const snapshots = useSnapshotsStore()

    runMonthRollover(BOOT_JUNE)

    expect(snapshots.state.items).toHaveLength(0)
    expect(settings.state.lastMonthSeen).toBe('2026-06')
  })

  it('TC-U-009: does not duplicate a snapshot for an already-captured month (guard)', () => {
    seedStores()
    const snapshots = useSnapshotsStore()

    runMonthRollover(BOOT_JUNE)
    expect(snapshots.state.items).toHaveLength(1)

    // Simulate a second boot in the same scenario (lastMonthSeen stale again).
    const settings = useSettingsStore()
    settings.setLastMonthSeen('2026-05')
    runMonthRollover(BOOT_JUNE)

    expect(snapshots.state.items).toHaveLength(1)
    expect(settings.state.lastMonthSeen).toBe('2026-06')
  })

  it('TC-U-009: first run ever (lastMonthSeen null) only stamps the current month', () => {
    const settings = useSettingsStore()
    const snapshots = useSnapshotsStore()

    runMonthRollover(BOOT_JUNE)

    expect(snapshots.state.items).toHaveLength(0)
    expect(settings.state.lastMonthSeen).toBe('2026-06')
  })
})
