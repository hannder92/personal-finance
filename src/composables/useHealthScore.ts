// Bridges the base metrics to lib/calculations/health-score.
// Bases: DTI and housing on gross monthly income (their thresholds are defined on
// gross); savings rate on net monthly income; emergency fund = liquid assets /
// monthly outflow (fixed + variable + debt), the same coverage the runway card shows.

import { computed, type ComputedRef } from 'vue'
import { calcHealthScore, type HealthScoreResult } from '@/lib/calculations/health-score'
import { calcHousingRatio } from '@/lib/calculations/housing-ratio'
import { calcDTI } from '@/lib/calculations/dti'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useBaseMetrics } from './useBaseMetrics'

export interface UseHealthScore {
  result: ComputedRef<HealthScoreResult>
  /** i18n key under dashboard.health.labels for the lib's label (same cutoffs everywhere). */
  labelKey: ComputedRef<string>
}

const LABEL_KEYS: Record<HealthScoreResult['label'], string> = {
  critical: 'dashboard.health.labels.critical',
  'at-risk': 'dashboard.health.labels.atRisk',
  regular: 'dashboard.health.labels.regular',
  good: 'dashboard.health.labels.good',
  excellent: 'dashboard.health.labels.excellent',
}

export function useHealthScore(): UseHealthScore {
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const { monthlyIncome, grossMonthlyIncome, debtObligation, liquidAssets, monthlyOutflow } =
    useBaseMetrics()

  const totalGoalContrib = computed(() =>
    goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
  )

  // AC-3.4: when there is no signal, component is null and weight is renormalized in calcHealthScore.
  const dti = computed<number | null>(() => {
    if (cards.state.items.length === 0) return null
    if (grossMonthlyIncome.value <= 0) return 0
    return calcDTI(debtObligation.value, grossMonthlyIncome.value)
  })

  const emergencyMonths = computed<number | null>(() => {
    if (assets.state.items.length === 0) return null
    // No monthly obligations + positive assets → infinite coverage; max score downstream.
    if (monthlyOutflow.value <= 0) return liquidAssets.value > 0 ? Number.POSITIVE_INFINITY : 0
    return liquidAssets.value / monthlyOutflow.value
  })

  const housingRatio = computed<number | null>(() => {
    if (expenses.state.items.length === 0) return null
    return calcHousingRatio(
      expenses.state.items.map((e) => ({ category: e.category, amount: e.amount })),
      grossMonthlyIncome.value
    )
  })

  const savingsRate = computed<number | null>(() => {
    if (goals.state.items.length === 0) return null
    if (monthlyIncome.value <= 0) return 0
    return (totalGoalContrib.value / monthlyIncome.value) * 100
  })

  const result = computed<HealthScoreResult>(() =>
    calcHealthScore({
      dti: dti.value,
      emergencyMonths: emergencyMonths.value,
      housingRatio: housingRatio.value,
      savingsRate: savingsRate.value,
    })
  )

  const labelKey = computed(() => LABEL_KEYS[result.value.label])

  return { result, labelKey }
}
