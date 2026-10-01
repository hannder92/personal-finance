// Bridges multiple stores to lib/calculations/health-score.
// All ratios share one income base (useNetIncome.totalMonthlyIncome) and one monthly
// outflow (fixed + variable budget + debt obligations), so the score agrees with the
// rest of the dashboard.

import { computed, type ComputedRef } from 'vue'
import {
  calcHealthScore,
  healthLevel,
  type HealthLevel,
  type HealthScoreResult,
} from '@/lib/calculations/health-score'
import { calcHousingRatio } from '@/lib/calculations/housing-ratio'
import { calcDTI } from '@/lib/calculations/dti'
import { calcLiquidAssetsTotal } from '@/lib/calculations/liquid-metrics'
import { useExpensesStore } from '@/stores/expensesStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useAssetsStore } from '@/stores/assetsStore'
import { useNetIncome } from './useNetIncome'

export interface HealthMetrics {
  dti: number | null
  emergencyMonths: number | null
  housingRatio: number | null
  savingsRate: number | null
}

export interface HealthComponentLevels {
  dti: HealthLevel | null
  emergency: HealthLevel | null
  housing: HealthLevel | null
  savings: HealthLevel | null
}

export interface UseHealthScore {
  result: ComputedRef<HealthScoreResult>
  metrics: ComputedRef<HealthMetrics>
  level: ComputedRef<HealthLevel>
  componentLevels: ComputedRef<HealthComponentLevels>
}

function levelOrNull(score: number | null): HealthLevel | null {
  return score === null ? null : healthLevel(score)
}

export function useHealthScore(): UseHealthScore {
  const expenses = useExpensesStore()
  const cards = useCardsStore()
  const goals = useGoalsStore()
  const assets = useAssetsStore()
  const { totalMonthlyIncome, fixedExpensesTotal, variableBudgetTotal, debtObligationsTotal } =
    useNetIncome()

  const liquidAssetsTotal = computed(() => calcLiquidAssetsTotal(assets.state.items))

  const totalGoalContrib = computed(() =>
    goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
  )

  // AC-3.4: when there is no signal, component is null and weight is renormalized in calcHealthScore.
  const dti = computed<number | null>(() => {
    if (cards.state.items.length === 0) return null
    if (totalMonthlyIncome.value <= 0) return 0
    return calcDTI(debtObligationsTotal.value, totalMonthlyIncome.value)
  })

  const emergencyMonths = computed<number | null>(() => {
    if (assets.state.items.length === 0) return null
    const denominator =
      fixedExpensesTotal.value + variableBudgetTotal.value + debtObligationsTotal.value
    // No monthly obligations + positive assets → infinite coverage; max score downstream.
    if (denominator <= 0) return liquidAssetsTotal.value > 0 ? Number.POSITIVE_INFINITY : 0
    return liquidAssetsTotal.value / denominator
  })

  const housingRatio = computed<number | null>(() => {
    if (expenses.state.items.length === 0) return null
    return calcHousingRatio(
      expenses.state.items.map((e) => ({ category: e.category, amount: e.amount })),
      totalMonthlyIncome.value
    )
  })

  const savingsRate = computed<number | null>(() => {
    if (goals.state.items.length === 0) return null
    if (totalMonthlyIncome.value <= 0) return 0
    return (totalGoalContrib.value / totalMonthlyIncome.value) * 100
  })

  const metrics = computed<HealthMetrics>(() => ({
    dti: dti.value,
    emergencyMonths: emergencyMonths.value,
    housingRatio: housingRatio.value,
    savingsRate: savingsRate.value,
  }))

  const result = computed<HealthScoreResult>(() => calcHealthScore(metrics.value))

  const level = computed(() => healthLevel(result.value.score))

  const componentLevels = computed<HealthComponentLevels>(() => ({
    dti: levelOrNull(result.value.components.dti),
    emergency: levelOrNull(result.value.components.emergency),
    housing: levelOrNull(result.value.components.housing),
    savings: levelOrNull(result.value.components.savings),
  }))

  return { result, metrics, level, componentLevels }
}
