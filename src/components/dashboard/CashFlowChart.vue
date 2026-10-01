<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import type { MonthlyFlowPoint } from '@/lib/calculations/monthly-flow'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = withDefaults(
  defineProps<{
    points?: MonthlyFlowPoint[]
    textColor?: string
    gridColor?: string
  }>(),
  {
    points: () => [],
    textColor: '#1e293b',
    gridColor: '#cbd5e1',
  }
)

const { t, locale } = useI18n()

// A single closed month is not a "flow" yet — the comparison needs ≥ 2 bars.
const showChart = computed(() => props.points.length >= 2)

const INCOME_COLOR = '#10b981' // emerald-500
const EXPENSES_COLOR = '#ef4444' // red-500

function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return new Date(year!, m! - 1, 1).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
    month: 'short',
  })
}

const chartData = computed(() => ({
  labels: props.points.map((p) => monthLabel(p.month)),
  datasets: [
    {
      label: t('dashboard.flow.income'),
      data: props.points.map((p) => p.income),
      backgroundColor: INCOME_COLOR,
      borderRadius: 4,
    },
    {
      label: t('dashboard.flow.expenses'),
      data: props.points.map((p) => p.expenses),
      backgroundColor: EXPENSES_COLOR,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // Legend is rendered in HTML below (accessible + testable in jsdom).
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { color: props.textColor },
      grid: { display: false },
    },
    y: {
      ticks: { color: props.textColor },
      grid: { color: props.gridColor },
    },
  },
}))
</script>

<template>
  <div
    data-testid="cashflow-chart"
    class="flex flex-col gap-2"
    :data-months="points.length"
  >
    <template v-if="showChart">
      <div class="relative h-56 w-full">
        <Bar
          :data="chartData"
          :options="chartOptions"
        />
      </div>
      <div
        data-testid="cashflow-legend"
        class="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300"
      >
        <span class="inline-flex items-center gap-1.5">
          <span
            class="size-2.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          {{ t('dashboard.flow.income') }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span
            class="size-2.5 rounded-full bg-red-500"
            aria-hidden="true"
          />
          {{ t('dashboard.flow.expenses') }}
        </span>
      </div>
    </template>
    <p
      v-else
      data-testid="cashflow-empty"
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400"
    >
      {{ t('dashboard.flow.empty') }}
    </p>
  </div>
</template>
