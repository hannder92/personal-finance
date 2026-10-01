<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { formatCurrency } from '@/lib/currency/format'
import { formatCompactCurrency } from '@/lib/format/locale'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = withDefaults(
  defineProps<{
    months?: Array<{ label: string; balance: number }>
    textColor?: string
    gridColor?: string
    insight?: string | null
    emptyMessage?: string
    datasetLabel?: string
    currency?: string
  }>(),
  {
    months: () => [],
    textColor: '#1e293b',
    gridColor: '#cbd5e1',
    insight: null,
    emptyMessage: '',
    datasetLabel: '',
    currency: 'COP',
  }
)

const chartData = computed(() => ({
  labels: props.months.map((m) => m.label),
  datasets: [
    {
      label: props.datasetLabel,
      data: props.months.map((m) => m.balance),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.15)',
      tension: 0.3,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: props.textColor } },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number | null } }) =>
          formatCurrency(ctx.parsed.y ?? 0, props.currency),
      },
    },
  },
  scales: {
    x: {
      ticks: { color: props.textColor },
      grid: { color: props.gridColor },
    },
    y: {
      ticks: {
        color: props.textColor,
        callback: (value: number | string) => formatCompactCurrency(Number(value), props.currency),
      },
      grid: { color: props.gridColor },
    },
  },
}))

const showChart = computed(() => !props.emptyMessage)
</script>

<template>
  <div
    class="flex flex-col gap-2"
    data-testid="projection-chart"
    :data-month-5-balance="months[4]?.balance ?? 0"
    :data-month-6-balance="months[5]?.balance ?? 0"
    :data-month-7-balance="months[6]?.balance ?? 0"
  >
    <div
      v-if="showChart"
      class="relative h-72 w-full"
    >
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <p
      v-else
      data-testid="projection-empty"
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600"
    >
      {{ emptyMessage }}
    </p>
    <p
      v-if="insight"
      data-testid="projection-insight"
      class="text-sm text-slate-600 dark:text-slate-300"
    >
      {{ insight }}
    </p>
  </div>
</template>
