// Feature: 20260529-metricas-runway-ingresos · T-015 RED — GREEN in T-035
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFinancialFreedom } from '@/composables/useFinancialFreedom'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useAssetsStore } from '@/stores/assetsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

describe('composables/useFinancialFreedom (20260529-metricas-runway-ingresos)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-C-061 (AC-2.1, AC-2.2): liquidAssets matches useLiquidMetrics for the same store state', () => {
    const assets = useAssetsStore()
    assets.add({ name: 'CDT', value: 50_000_000, type: 'investment' })
    assets.add({ name: 'Casa', value: 200_000_000, type: 'property' })

    const expenses = useExpensesStore()
    expenses.add({ name: 'Arriendo', amount: 4_000_000, category: 'vivienda' })

    const variable = useVariableExpensesStore()
    variable.add({ name: 'Comida', budget: 2_000_000, spent: 1_000_000 })

    const ff = useFinancialFreedom()
    const liquid = useLiquidMetrics()

    expect(ff.liquidAssets.value).toBe(liquid.liquidAssets.value)
    expect(ff.liquidAssets.value).toBe(50_000_000)
  })

  it('TC-C-061 (AC-2.1): monthlyLivingExpense matches useLiquidMetrics', () => {
    const expenses = useExpensesStore()
    expenses.add({ name: 'Arriendo', amount: 3_000_000, category: 'vivienda' })

    const variable = useVariableExpensesStore()
    variable.add({ name: 'Transporte', budget: 1_000_000, spent: 500_000 })

    const ff = useFinancialFreedom()
    const liquid = useLiquidMetrics()

    expect(ff.monthlyLivingExpense.value).toBe(liquid.monthlyLivingExpense.value)
    expect(ff.monthlyLivingExpense.value).toBe(3_500_000)
  })
})
