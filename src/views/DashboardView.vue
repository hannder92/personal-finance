<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import FinancialFreedomCompact from '@/components/dashboard/FinancialFreedomCompact.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import KpiStrip from '@/components/dashboard/KpiStrip.vue'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'
import SavingsGapCard from '@/components/dashboard/SavingsGapCard.vue'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'
import { useDashboardInsights } from '@/composables/useDashboardInsights'
import { useHealthScore } from '@/composables/useHealthScore'
import { useAllocationStore } from '@/stores/allocationStore'

const { t } = useI18n()
const allocation = useAllocationStore()
const { options: chartTheme } = useChartTheme()
const { months: cashflowMonths } = useCashFlowProjection()
const { result: healthScoreResult } = useHealthScore()
const { hasDonutData, hasProjectionData, donutInsight, projectionInsight } = useDashboardInsights()

const latestScore = computed(() => healthScoreResult.value.score)

const healthLabel = computed(() => {
  const score = latestScore.value
  if (score >= 70) return t('dashboard.health.labelOk')
  if (score >= 50) return t('dashboard.health.labelWarn')
  return t('dashboard.health.labelDanger')
})

const projectionMonths = computed(() =>
  cashflowMonths.value.map((m, i) => ({
    label: `M${i + 1}`,
    balance: m.projectedBalance,
  }))
)
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

    <HealthScore
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
        :empty-message="hasProjectionData ? '' : t('dashboard.empty.projection')"
      />
    </div>

    <SavingsProjectionChart />
  </section>
</template>
