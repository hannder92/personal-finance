import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { useAllocationStore } from '@/stores/allocationStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'
import { useNetIncome } from '@/composables/useNetIncome'

export interface UseDashboardInsights {
  hasDonutData: ComputedRef<boolean>
  hasProjectionData: ComputedRef<boolean>
  donutInsight: ComputedRef<string | null>
  projectionInsight: ComputedRef<string | null>
}

export function useDashboardInsights(): UseDashboardInsights {
  const { t } = useI18n()
  const allocation = useAllocationStore()
  const settings = useSettingsStore()
  const { netIncome } = useNetIncome()
  const { months: projectionMonths } = useCashFlowProjection()

  const hasDonutData = computed(
    () =>
      netIncome.value > 0 &&
      allocation.state.needs + allocation.state.wants + allocation.state.savings > 0
  )

  const hasProjectionData = computed(() => projectionMonths.value.length > 0)

  const savingsObjective = computed(() =>
    Math.round((netIncome.value * allocation.state.savings) / 100)
  )

  const projectionM12 = computed(() => {
    const last = projectionMonths.value[projectionMonths.value.length - 1]
    return last?.projectedBalance ?? 0
  })

  const donutInsight = computed(() => {
    if (!hasDonutData.value) return null
    return t('dashboard.insight.donut', {
      amount: formatCurrency(savingsObjective.value, settings.state.currency),
      percent: allocation.state.savings,
    })
  })

  const projectionInsight = computed(() => {
    if (!hasProjectionData.value) return null
    return t('dashboard.insight.flow', {
      amount: formatCurrency(projectionM12.value, settings.state.currency),
    })
  })

  return {
    hasDonutData,
    hasProjectionData,
    donutInsight,
    projectionInsight,
  }
}
