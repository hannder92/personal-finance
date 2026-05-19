<script setup lang="ts">
import { computed } from 'vue'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'
import ComparisonBadge from '@/components/dashboard/ComparisonBadge.vue'
import EmptyStateGuide from '@/components/dashboard/EmptyStateGuide.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'
import SavingsProjectionChart from '@/components/dashboard/SavingsProjectionChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { useDTI } from '@/composables/useDTI'
import { useHealthScore } from '@/composables/useHealthScore'
import { useNetIncome } from '@/composables/useNetIncome'
import { useAllocationStore } from '@/stores/allocationStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

const settings = useSettingsStore()
const expenses = useExpensesStore()
const allocation = useAllocationStore()
const snapshots = useSnapshotsStore()
const { options: chartTheme } = useChartTheme()
const { netIncome, freeForAllocation } = useNetIncome()
const { dti: dtiPct, totalDebtObligation } = useDTI()
const { result: healthScoreResult } = useHealthScore()

const fixedExpensesTotal = computed(() =>
  expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
)

const sortedSnapshots = computed(() =>
  [...snapshots.state.items].sort((a, b) => b.month.localeCompare(a.month))
)
const latestScore = computed(() => healthScoreResult.value.score)
const previousScore = computed(() => sortedSnapshots.value[0]?.healthScore ?? null)

// Project net income forward over 12 months. Periodic income streams are not yet
// folded into this view (out of scope for T-028; calendar-aware projection is a
// future enhancement noted in T-006).
const projectionMonths = computed(() => {
  const base = freeForAllocation.value
  return Array.from({ length: 12 }, (_, i) => ({
    label: `M${i + 1}`,
    balance: base * (i + 1),
  }))
})
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6 p-6">
    <header class="flex items-baseline justify-between">
      <h1 class="text-2xl font-semibold">
        Dashboard
      </h1>
      <ComparisonBadge
        :current="latestScore"
        :previous="previousScore"
        label="vs mes anterior"
      />
    </header>

    <EmptyStateGuide />

    <HealthScore
      :score="latestScore"
      label="Saludable"
      :breakdown="healthScoreResult.components"
      :default-open="true"
    />

    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <KpiCard
        label="Ingreso neto"
        :value="netIncome"
        type="income"
        :currency="settings.state.currency"
      />
      <KpiCard
        label="Gastos fijos"
        :value="fixedExpensesTotal"
        type="expenses"
        :currency="settings.state.currency"
      />
      <KpiCard
        label="Pagos deuda"
        :value="totalDebtObligation"
        type="expenses"
        :currency="settings.state.currency"
      />
      <KpiCard
        label="DTI"
        :value="dtiPct"
        type="dti"
        :threshold="36"
        :currency="settings.state.currency"
      />
      <KpiCard
        label="Disponible"
        :value="freeForAllocation"
        type="free"
        :currency="settings.state.currency"
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <BudgetDonut
        :needs="allocation.state.needs"
        :wants="allocation.state.wants"
        :savings="allocation.state.savings"
        :text-color="chartTheme.color"
        :background-color="chartTheme.backgroundColor"
      />
      <ProjectionChart
        :months="projectionMonths"
        :text-color="chartTheme.color"
        :grid-color="chartTheme.gridColor"
      />
    </div>

    <SavingsProjectionChart />
  </section>
</template>
