import { computed, type ComputedRef } from 'vue'
import {
  calcFinancialFreedom,
  type FinancialFreedomResult,
} from '@/lib/calculations/financial-freedom'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useAssetsStore } from '@/stores/assetsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const LIQUID_ASSET_TYPES = new Set(['cash', 'savings', 'investment'])

export type UseFinancialFreedom = {
  [K in keyof FinancialFreedomResult]: ComputedRef<FinancialFreedomResult[K]>
}

export function useFinancialFreedom(): UseFinancialFreedom {
  const expenses = useExpensesStore()
  const assets = useAssetsStore()
  const variable = useVariableExpensesStore()
  const { feasible } = useSavingsFeasibility()

  const monthlyLivingExpense = computed(() => {
    const fixed = expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
    const variableSpent = variable.state.items.reduce((acc, v) => acc + v.spent, 0)
    return fixed + variableSpent
  })

  const liquidAssets = computed(() =>
    assets.state.items
      .filter((a) => LIQUID_ASSET_TYPES.has(a.type))
      .reduce((acc, a) => acc + a.value, 0)
  )

  const result = computed(() =>
    calcFinancialFreedom({
      monthlyLivingExpense: monthlyLivingExpense.value,
      liquidAssets: liquidAssets.value,
      monthlyFeasibleSavings: feasible.value,
    })
  )

  return {
    monthlyLivingExpense: computed(() => result.value.monthlyLivingExpense),
    liquidAssets: computed(() => result.value.liquidAssets),
    targetPatrimony: computed(() => result.value.targetPatrimony),
    progressPercent: computed(() => result.value.progressPercent),
    monthsToTarget: computed(() => result.value.monthsToTarget),
    targetReached: computed(() => result.value.targetReached),
  }
}
