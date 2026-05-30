import { computed, type ComputedRef } from 'vue'
import { calcLiquidAssetsTotal, calcMonthlyLivingExpense } from '@/lib/calculations/liquid-metrics'
import { useAssetsStore } from '@/stores/assetsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

export interface UseLiquidMetrics {
  liquidAssets: ComputedRef<number>
  monthlyLivingExpense: ComputedRef<number>
}

export function useLiquidMetrics(): UseLiquidMetrics {
  const assets = useAssetsStore()
  const expenses = useExpensesStore()
  const variable = useVariableExpensesStore()

  const liquidAssets = computed(() => calcLiquidAssetsTotal(assets.state.items))
  const monthlyLivingExpense = computed(() =>
    calcMonthlyLivingExpense(
      expenses.state.items.reduce((acc, e) => acc + e.amount, 0),
      variable.state.items.reduce((acc, v) => acc + v.spent, 0)
    )
  )

  return { liquidAssets, monthlyLivingExpense }
}
