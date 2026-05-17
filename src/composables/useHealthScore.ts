// Bridges multiple stores to lib/calculations/health-score.
// Computes DTI, emergency months, housing ratio, and savings rate from real store data.

import { computed, type ComputedRef } from 'vue'
import { calcHealthScore, type HealthScoreResult } from '@/lib/calculations/health-score'
import { calcHousingRatio } from '@/lib/calculations/housing-ratio'
import { calcDTI } from '@/lib/calculations/dti'
import { calcCardObligation } from '@/lib/calculations/installments'
import { useIncomeStore } from '@/stores/incomeStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useNetIncome } from './useNetIncome'

const LIQUID_ASSET_TYPES = new Set(['cash', 'savings'])

export interface UseHealthScore {
  result: ComputedRef<HealthScoreResult>
}

export function useHealthScore(): UseHealthScore {
  const income = useIncomeStore()
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const { netIncome } = useNetIncome()

  const fixedExpensesTotal = computed(() =>
    expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
  )

  const debtObligationsTotal = computed(() =>
    cards.state.items.reduce((acc, c) => {
      if (c.type === 'card') {
        return acc + calcCardObligation({ minPayment: c.minPayment, installmentsList: c.installments })
      }
      return acc + c.minPayment
    }, 0)
  )

  const liquidAssetsTotal = computed(() =>
    assets.state.items
      .filter((a) => LIQUID_ASSET_TYPES.has(a.type))
      .reduce((acc, a) => acc + a.value, 0)
  )

  const totalGoalContrib = computed(() =>
    goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
  )

  // AC-3.4: when there is no signal, component is null and weight is renormalized in calcHealthScore.
  const dti = computed<number | null>(() => {
    if (cards.state.items.length === 0) return null
    if (netIncome.value <= 0) return 0
    return calcDTI(debtObligationsTotal.value, netIncome.value)
  })

  const emergencyMonths = computed<number | null>(() => {
    if (assets.state.items.length === 0) return null
    const denominator = fixedExpensesTotal.value + debtObligationsTotal.value
    // No monthly obligations + positive assets → infinite coverage; max score downstream.
    if (denominator <= 0) return liquidAssetsTotal.value > 0 ? Number.POSITIVE_INFINITY : 0
    return liquidAssetsTotal.value / denominator
  })

  const housingRatio = computed<number | null>(() => {
    if (expenses.state.items.length === 0) return null
    return calcHousingRatio(
      expenses.state.items.map((e) => ({ category: e.category, amount: e.amount })),
      income.state.grossSalary > 0 ? income.state.grossSalary : netIncome.value
    )
  })

  const savingsRate = computed<number | null>(() => {
    if (goals.state.items.length === 0) return null
    if (netIncome.value <= 0) return 0
    return (totalGoalContrib.value / netIncome.value) * 100
  })

  const result = computed<HealthScoreResult>(() =>
    calcHealthScore({
      dti: dti.value,
      emergencyMonths: emergencyMonths.value,
      housingRatio: housingRatio.value,
      savingsRate: savingsRate.value,
    })
  )

  return { result }
}
