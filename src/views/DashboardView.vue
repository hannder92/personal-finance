<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import FinancialFreedomCompact from '@/components/dashboard/FinancialFreedomCompact.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import KpiStrip from '@/components/dashboard/KpiStrip.vue'
import PassiveCoverageCompact from '@/components/dashboard/PassiveCoverageCompact.vue'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'
import RunwayCard from '@/components/dashboard/RunwayCard.vue'
import SavingsGapCard from '@/components/dashboard/SavingsGapCard.vue'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import QuickAddFAB from '@/components/variable/QuickAddFAB.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'
import { useDashboardInsights } from '@/composables/useDashboardInsights'
import { useHealthScore } from '@/composables/useHealthScore'
import { projectionMonthLabels } from '@/lib/format/locale'
import { useAllocationStore } from '@/stores/allocationStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const { t } = useI18n()
const allocation = useAllocationStore()
const settings = useSettingsStore()
const variable = useVariableExpensesStore()
const { options: chartTheme } = useChartTheme()
const { months: cashflowMonths, startCalendarMonth, startYear } = useCashFlowProjection()
const { result: healthScoreResult, labelKey } = useHealthScore()
const { hasDonutData, hasProjectionData, donutInsight, projectionInsight } = useDashboardInsights()

const latestScore = computed(() => healthScoreResult.value.score)

const healthLabel = computed(() => t(labelKey.value))

const projectionMonths = computed(() => {
  const labels = projectionMonthLabels(
    startYear.value,
    startCalendarMonth.value,
    cashflowMonths.value.length,
    settings.state.lang
  )
  return cashflowMonths.value.map((m, i) => ({
    label: labels[i] ?? `M${i + 1}`,
    balance: m.projectedBalance,
  }))
})
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6 p-6">
    <h1 class="text-2xl font-semibold">
      {{ t('dashboard.title') }}
    </h1>

    <DashboardHero />

    <SavingsGapCard />

    <KpiStrip />

    <FinancialFreedomCompact />

    <div class="grid gap-4 md:grid-cols-2">
      <RunwayCard />
      <PassiveCoverageCompact />
    </div>

    <HealthScore
      variant="breakdown"
      :score="latestScore"
      :label="healthLabel"
      :breakdown="healthScoreResult.components"
      :default-open="false"
    />

    <div class="grid gap-6 md:grid-cols-2">
      <BudgetDonut
        :needs="allocation.state.needs"
        :wants="allocation.state.wants"
        :savings="allocation.state.savings"
        :text-color="chartTheme.color"
        :background-color="chartTheme.backgroundColor"
        :insight="donutInsight"
        :empty-message="hasDonutData ? '' : t('dashboard.empty.donut')"
      />
      <ProjectionChart
        :months="projectionMonths"
        :text-color="chartTheme.color"
        :grid-color="chartTheme.gridColor"
        :insight="projectionInsight"
        :dataset-label="t('dashboard.projection.datasetLabel')"
        :currency="settings.state.currency"
        :empty-message="hasProjectionData ? '' : t('dashboard.empty.projection')"
      />
    </div>

    <SavingsProjectionChart />

    <QuickAddFAB
      v-if="variable.state.items.length > 0"
      route="/dashboard"
      :categories="variable.state.items"
      @record="(p) => variable.recordSpending(p.categoryId, p.amount)"
    />
  </section>
</template>
