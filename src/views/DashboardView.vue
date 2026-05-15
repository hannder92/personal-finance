<script setup lang="ts">
import { computed } from 'vue'
import BudgetDonut from '@/components/dashboard/BudgetDonut.vue'
import ComparisonBadge from '@/components/dashboard/ComparisonBadge.vue'
import HealthScore from '@/components/dashboard/HealthScore.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import ProjectionChart from '@/components/dashboard/ProjectionChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { useAllocationStore } from '@/stores/allocationStore'
import { useCardsStore } from '@/stores/cardsStore'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnapshotsStore } from '@/stores/snapshotsStore'

const settings = useSettingsStore()
const income = useIncomeStore()
const expenses = useExpensesStore()
const cards = useCardsStore()
const allocation = useAllocationStore()
const snapshots = useSnapshotsStore()
const { options: chartTheme } = useChartTheme()

const fixedExpensesTotal = computed(() =>
  expenses.state.items.reduce((acc, e) => acc + e.amount, 0)
)
const debtPaymentsTotal = computed(() =>
  cards.state.items.reduce((acc, c) => acc + c.minPayment, 0)
)
const freeToAllocate = computed(() =>
  Math.max(0, income.state.grossSalary - fixedExpensesTotal.value - debtPaymentsTotal.value)
)
const dtiPct = computed(() => {
  if (income.state.grossSalary <= 0) return 0
  return Math.round((debtPaymentsTotal.value / income.state.grossSalary) * 100)
})

const sortedSnapshots = computed(() =>
  [...snapshots.state.items].sort((a, b) => b.month.localeCompare(a.month))
)
const latestScore = computed(() => sortedSnapshots.value[0]?.healthScore ?? 0)
const previousScore = computed(() => sortedSnapshots.value[1]?.healthScore ?? null)

const projectionMonths = computed(() => {
  const base = income.state.grossSalary - fixedExpensesTotal.value - debtPaymentsTotal.value
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

    <HealthScore
      :score="latestScore"
      label="Saludable"
      :breakdown="{ dti: dtiPct, emergency: 70, housing: 25, savings: allocation.state.savings }"
    />

    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <KpiCard
        label="Ingreso bruto"
        :value="income.state.grossSalary"
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
        :value="debtPaymentsTotal"
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
        :value="freeToAllocate"
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
  </section>
</template>
