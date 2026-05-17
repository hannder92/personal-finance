// Tests for the useHealthScore composable.
// Feature: 20260515-fix-calculos-financieros · Covers AC-3.1, AC-3.2, AC-3.3, EC-9.
// These tests expect the FULL impl (T-022). The current stub returns null/0 for all
// components, so every assertion below FAILS — confirmed RED phase.

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHealthScore } from '@/composables/useHealthScore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useAssetsStore } from '@/stores/assetsStore'

describe('useHealthScore — fix-calculos-financieros', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-006 (AC-3.2): emergency months denominator = fixedExpenses + debt obligations', () => {
    // 6M liquid assets / (1.5M fixed expenses + 0.5M debt min) = 3 months → scoreEmergency(3) = 50.
    const income = useIncomeStore()
    income.setGrossSalary(10_000_000)

    const expenses = useExpensesStore()
    expenses.add({ name: 'Arriendo', amount: 1_500_000, category: 'vivienda' })

    const cards = useCardsStore()
    cards.addCard({
      type: 'card',
      name: 'Visa',
      balance: 1_000_000,
      limit: 5_000_000,
      apr: 24,
      minPayment: 500_000,
      dueDate: null,
      installments: [],
    })

    const assets = useAssetsStore()
    assets.add({ name: 'Ahorro', value: 6_000_000, type: 'savings' })

    const { result } = useHealthScore()
    expect(result.value.components.emergency).not.toBeNull()
    expect(result.value.components.emergency).toBe(50)
  })

  it('TC-U-007 (AC-3.3): savings rate = sum(goal.monthlyContrib) / netIncome', () => {
    // 800K monthly contributions / 10M netIncome = 8% → scoreSavings(8) = 40 (lerp 0-10 → 0-50).
    const income = useIncomeStore()
    income.setGrossSalary(10_000_000)

    const goals = useGoalsStore()
    goals.add({
      name: 'A',
      target: 1_000_000,
      saved: 0,
      monthlyContrib: 500_000,
      targetDate: null,
    })
    goals.add({
      name: 'B',
      target: 1_000_000,
      saved: 0,
      monthlyContrib: 300_000,
      targetDate: null,
    })

    const { result } = useHealthScore()
    expect(result.value.components.savings).not.toBeNull()
    expect(result.value.components.savings).toBe(40)
  })

  it('TC-U-025 (EC-9): goals exist but monthlyContrib === 0 → savings component = 0', () => {
    // Distinct from "no goals at all". Here goals exist; contributions are 0.
    // Score should be 0 (rate at bad threshold), NOT null.
    const income = useIncomeStore()
    income.setGrossSalary(10_000_000)

    const goals = useGoalsStore()
    goals.add({
      name: 'idle',
      target: 1_000_000,
      saved: 0,
      monthlyContrib: 0,
      targetDate: null,
    })

    const { result } = useHealthScore()
    expect(result.value.components.savings).toBe(0)
  })
})
