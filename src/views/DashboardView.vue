<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DayOverview from '@/components/dashboard/day/DayOverview.vue'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'
import CashFlowChart from '@/components/dashboard/CashFlowChart.vue'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting.vue'
import DashboardHero from '@/components/dashboard/DashboardHero.vue'
import DashboardTier2Toggle from '@/components/dashboard/DashboardTier2Toggle.vue'
import FinancialFreedomCompact from '@/components/dashboard/FinancialFreedomCompact.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import KpiStrip from '@/components/dashboard/KpiStrip.vue'
import MonthActivityCard from '@/components/dashboard/MonthActivityCard.vue'
import NetWorthCards from '@/components/dashboard/NetWorthCards.vue'
import PassiveCoverageCompact from '@/components/dashboard/PassiveCoverageCompact.vue'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'
import RunwayCard from '@/components/dashboard/RunwayCard.vue'
import SavingsGapCard from '@/components/dashboard/SavingsGapCard.vue'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { useCashFlowProjection } from '@/composables/useCashFlowProjection'
import { useDashboardInsights } from '@/composables/useDashboardInsights'
import { useDashboardTier2 } from '@/composables/useDashboardTier2'
import { useHealthScore } from '@/composables/useHealthScore'
import { useMonthlyFlow } from '@/composables/useMonthlyFlow'
import { useAllocationStore } from '@/stores/allocationStore'

const { t } = useI18n()
const allocation = useAllocationStore()
const { options: chartTheme } = useChartTheme()
const { months: cashflowMonths } = useCashFlowProjection()
const { result: healthScoreResult } = useHealthScore()
const { hasDonutData, hasProjectionData, donutInsight, projectionInsight } = useDashboardInsights()
const { tier2Visible, canToggle, isExpanded, toggle } = useDashboardTier2()
const { points: monthlyFlowPoints } = useMonthlyFlow()

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
    <DashboardGreeting />

    <DayOverview />

    <DashboardHero />

    <NetWorthCards />

    <div
      data-testid="dashboard-flow-grid"
      class="grid gap-6 md:grid-cols-2"
    >
      <section
        data-testid="dashboard-flow-section"
        :aria-label="t('dashboard.flow.title')"
      >
        <h2 class="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {{ t('dashboard.flow.title') }}
        </h2>
        <CashFlowChart
          :points="monthlyFlowPoints"
          :text-color="chartTheme.color"
          :grid-color="chartTheme.gridColor"
        />
      </section>
      <div data-testid="dashboard-activity-section">
        <MonthActivityCard />
      </div>
    </div>

    <DashboardTier2Toggle
      v-if="canToggle"
      :expanded="isExpanded"
      @toggle="toggle"
    />

    <div
      v-if="tier2Visible"
      data-testid="dashboard-tier-2"
      class="flex flex-col gap-6"
    >
      <SavingsGapCard />

      <KpiStrip />

      <FinancialFreedomCompact />

      <div class="grid gap-4 md:grid-cols-2">
        <RunwayCard />
        <PassiveCoverageCompact />
      </div>

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
    </div>
  </section>
</template>
