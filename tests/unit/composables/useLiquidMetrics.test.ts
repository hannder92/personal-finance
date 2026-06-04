import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLiquidMetrics } from '@/composables/useLiquidMetrics'
import { useAssetsStore } from '@/stores/assetsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

describe('composables/useLiquidMetrics', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-U-004 (AC-1.2, AC-2.2): living expense = fixed + variable spent; liquid from eligible assets', () => {
    const expenses = useExpensesStore()
    expenses.add({ name: 'Arriendo', amount: 4_000_000, category: 'vivienda' })

    const variable = useVariableExpensesStore()
    variable.add({ name: 'Comida', budget: 2_000_000, spent: 1_000_000 })

    const assets = useAssetsStore()
    assets.add({ name: 'Portafolio', value: 50_000_000, type: 'investment' })
    assets.add({ name: 'Casa', value: 200_000_000, type: 'property' })

    const { liquidAssets, monthlyLivingExpense } = useLiquidMetrics()

    expect(monthlyLivingExpense.value).toBe(5_000_000)
    expect(liquidAssets.value).toBe(50_000_000)
  })

  it('TC-U-004 (AC-2.2): cash, savings, and investment all count toward liquid total', () => {
    const assets = useAssetsStore()
    assets.add({ name: 'Efectivo', value: 1_000_000, type: 'cash' })
    assets.add({ name: 'Ahorros', value: 2_000_000, type: 'savings' })
    assets.add({ name: 'CDT', value: 3_000_000, type: 'investment' })

    const { liquidAssets } = useLiquidMetrics()
    expect(liquidAssets.value).toBe(6_000_000)
  })
})
