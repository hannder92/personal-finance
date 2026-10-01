// Month close: snapshot of the closed month + variable-expense reset (ADR-7, AC-8.4, AC-13.1).

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMonthRollover } from '@/composables/useMonthRollover'
import { AppStateSchemaV4 } from '@/lib/storage/schema'
import { useAssetsStore } from '@/stores/assetsStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const OCT_2026 = new Date(2026, 9, 1, 9, 0, 0)

function seedData(): void {
  useIncomeStore().setGrossSalary(10_000_000)
  useExpensesStore().add({ name: 'Arriendo', amount: 2_000_000, category: 'vivienda' })
  useCardsStore().addCard({
    type: 'card',
    name: 'Visa',
    balance: 3_000_000,
    limit: 10_000_000,
    apr: 24,
    minPayment: 1_000_000,
    dueDate: null,
    installments: [],
  })
  useAssetsStore().add({
    name: 'Ahorros',
    value: 12_000_000,
    type: 'savings',
    annualRatePercent: 0,
  })
  useGoalsStore().add({
    name: 'Viaje',
    target: 5_000_000,
    saved: 0,
    monthlyContrib: 1_000_000,
    targetDate: null,
  })
  const variable = useVariableExpensesStore()
  variable.add({ name: 'Mercado', budget: 1_000_000, spent: 600_000, categoryId: 'food' })
  variable.add({ name: 'Transporte', budget: 300_000, spent: 150_000, categoryId: 'transport' })
}

describe('useMonthRollover', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('first run: records the current month without a snapshot or reset', () => {
    seedData()
    const { checkRollover } = useMonthRollover()

    expect(checkRollover(OCT_2026)).toBeNull()
    expect(useSettingsStore().state.lastMonthSeen).toBe('2026-10')
    expect(useSnapshotsStore().state.items).toHaveLength(0)
    expect(useVariableExpensesStore().state.items[0]!.spent).toBe(600_000)
  })

  it('same month: does nothing', () => {
    seedData()
    useSettingsStore().setLastMonthSeen('2026-10')
    const { checkRollover } = useMonthRollover()

    expect(checkRollover(OCT_2026)).toBeNull()
    expect(useSnapshotsStore().state.items).toHaveLength(0)
    expect(useVariableExpensesStore().state.items[0]!.spent).toBe(600_000)
  })

  it('new month: snapshots the closed month, resets variable spending, advances lastMonthSeen', () => {
    seedData()
    useSettingsStore().setLastMonthSeen('2026-09')
    const { checkRollover } = useMonthRollover()

    expect(checkRollover(OCT_2026)).toBe('2026-09')

    const [snap] = useSnapshotsStore().state.items
    expect(useSnapshotsStore().state.items).toHaveLength(1)
    expect(snap).toMatchObject({
      month: '2026-09',
      netIncome: 10_000_000,
      totalFixedExpenses: 2_000_000,
      totalVariableSpent: 750_000,
      totalDebt: 3_000_000,
      dti: 10,
      savingsRate: 10,
      netWorth: 9_000_000,
    })
    expect(snap!.healthScore).toBeGreaterThan(0)
    expect(snap!.capturedAt).toBe(OCT_2026.toISOString())

    const variable = useVariableExpensesStore().state.items
    expect(variable.map((v) => v.spent)).toEqual([0, 0])
    expect(variable.map((v) => v.budget)).toEqual([1_000_000, 300_000])
    expect(useSettingsStore().state.lastMonthSeen).toBe('2026-10')
  })

  it('runs once per month: a second check in the same month is a no-op', () => {
    seedData()
    useSettingsStore().setLastMonthSeen('2026-09')
    const { checkRollover } = useMonthRollover()

    checkRollover(OCT_2026)
    useVariableExpensesStore().recordSpending(useVariableExpensesStore().state.items[0]!.id, 50_000)

    expect(checkRollover(new Date(2026, 9, 20))).toBeNull()
    expect(useSnapshotsStore().state.items).toHaveLength(1)
    expect(useVariableExpensesStore().state.items[0]!.spent).toBe(50_000)
  })

  it('empty data: snapshot has a null health score and still passes the storage schema', () => {
    useSettingsStore().setLastMonthSeen('2026-09')
    const { checkRollover } = useMonthRollover()

    checkRollover(OCT_2026)

    const snap = useSnapshotsStore().state.items[0]!
    expect(snap.healthScore).toBeNull()
    expect(AppStateSchemaV4.shape.snapshots.safeParse([snap]).success).toBe(true)
  })
})
