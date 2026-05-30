// Integration tests for the persistence cycle (store mutation → saveAppState → loadAppState → state intact).
// Feature: 20260515-fix-calculos-financieros
// Covers AC-1.1, AC-1.2, AC-1.3, AC-7.3 · TCs TC-I-001, TC-I-002, TC-I-003, TC-I-004
//
// Mocking strategy: real localStorage (jsdom default) per Constitution.
// stubActions: false so store actions actually mutate state.

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useAllocationStore } from '@/stores/allocationStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'
import { loadAppState, saveAppState } from '@/lib/storage/useAppStorage'
import type { AppStateV4 } from '@/lib/storage/schema'

// Builds the AppStateV4 payload from current store states (mirrors main.ts persistStores logic).
function snapshotState(): AppStateV4 {
  const settings = useSettingsStore()
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const variable = useVariableExpensesStore()
  const allocation = useAllocationStore()
  const snapshots = useSnapshotsStore()
  return {
    schemaVersion: 4,
    settings: {
      lang: settings.state.lang,
      currency: settings.state.currency,
      theme: settings.state.theme,
      payoffMethod: settings.state.payoffMethod,
      lastMonthSeen: settings.state.lastMonthSeen,
      onboarding: { done: true, currentStep: 0 },
      projectionAnnualRatePercent: settings.state.projectionAnnualRatePercent,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshots: snapshots.state.items as any,
    allocation: {
      needs: allocation.state.needs,
      wants: allocation.state.wants,
      savings: allocation.state.savings,
    },
  }
}

describe('persistence cycle — fix-calculos-financieros', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('TC-I-001 (AC-1.1): full state round-trips with all fields intact', () => {
    // Seed many domains at once.
    useIncomeStore().setGrossSalary(10_000_000)
    useExpensesStore().add({ name: 'Arriendo', amount: 2_000_000, category: 'vivienda' })
    useGoalsStore().add({
      name: 'Vacaciones',
      target: 5_000_000,
      saved: 0,
      monthlyContrib: 300_000,
      targetDate: null,
    })

    const saveResult = saveAppState(snapshotState())
    expect(saveResult.ok).toBe(true)

    const load = loadAppState()
    expect(load.parseError).toBeNull()
    expect(load.state).not.toBeNull()
    expect(load.state!.income.grossSalary).toBe(10_000_000)
    expect(load.state!.expenses.length).toBe(1)
    expect(load.state!.expenses[0]!.name).toBe('Arriendo')
    expect(load.state!.goals.length).toBe(1)
    expect(load.state!.goals[0]!.monthlyContrib).toBe(300_000)
  })

  it('TC-I-002 (AC-1.2): debt persists with all fields after reload', () => {
    useCardsStore().addCard({
      type: 'card',
      name: 'Visa',
      balance: 3_000_000,
      limit: 10_000_000,
      apr: 28,
      minPayment: 200_000,
      dueDate: '2026-06-15',
      installments: [],
    })

    saveAppState(snapshotState())
    const load = loadAppState()
    expect(load.parseError).toBeNull()
    const card = load.state!.cards[0]
    expect(card).toBeTruthy()
    expect(card!.name).toBe('Visa')
    expect((card as { balance: number }).balance).toBe(3_000_000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((card as any).limit).toBe(10_000_000)
    expect((card as { apr: number }).apr).toBe(28)
    expect((card as { minPayment: number }).minPayment).toBe(200_000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((card as any).dueDate).toBe('2026-06-15')
  })

  it('TC-I-003 (AC-1.3): debt + deduction coexist after reload (neither cancels the other)', () => {
    useCardsStore().addCard({
      type: 'card',
      name: 'MasterCard',
      balance: 1_500_000,
      limit: 5_000_000,
      apr: 30,
      minPayment: 100_000,
      dueDate: null,
      installments: [],
    })
    useIncomeStore().addDeduction({ label: 'Salud', amount: 4, type: 'percent' })

    saveAppState(snapshotState())
    const load = loadAppState()
    expect(load.parseError).toBeNull()
    expect(load.state!.cards.length).toBe(1)
    expect(load.state!.income.deductions.length).toBe(1)
    expect(load.state!.income.deductions[0]!.label).toBe('Salud')
  })

  it('TC-I-004 (AC-7.3): editing __prima__ amount persists after reload', () => {
    const income = useIncomeStore()
    income.setGrossSalary(10_000_000)
    income.addPrimaPreset()
    expect(income.state.otherStreams.length).toBe(1)

    // Edit prima amount. updateStream is introduced in T-019; cast bypasses TS until then.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(income as any).updateStream('__prima__', { amount: 4_500_000 })

    saveAppState(snapshotState())
    const load = loadAppState()
    expect(load.parseError).toBeNull()
    const prima = load.state!.income.otherStreams.find((s) => s.id === '__prima__')
    expect(prima).toBeTruthy()
    expect(prima!.amount).toBe(4_500_000)
  })

  it('TC-I-004 (AC-7.3): deleting __prima__ removes it after reload', () => {
    const income = useIncomeStore()
    income.setGrossSalary(10_000_000)
    income.addPrimaPreset()
    income.removeStream('__prima__')

    saveAppState(snapshotState())
    const load = loadAppState()
    expect(load.parseError).toBeNull()
    const prima = load.state!.income.otherStreams.find((s) => s.id === '__prima__')
    expect(prima).toBeUndefined()
  })
})
