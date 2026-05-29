<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = withDefaults(
  defineProps<{
    needs?: number
    wants?: number
    savings?: number
    textColor?: string
    backgroundColor?: string
    insight?: string | null
    emptyMessage?: string
  }>(),
  {
    needs: 50,
    wants: 30,
    savings: 20,
    textColor: '#1e293b',
    backgroundColor: '#f8fafc',
    insight: null,
    emptyMessage: '',
  }
)

const chartData = computed(() => ({
  labels: ['Necesidades', 'Deseos', 'Ahorros'],
  datasets: [
    {
      data: [props.needs, props.wants, props.savings],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderColor: props.backgroundColor,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: props.textColor },
    },
  },
}))

const showChart = computed(() => !props.emptyMessage)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-if="showChart"
      class="relative h-64 w-full"
    >
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <p
      v-else
      data-testid="donut-empty"
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600"
    >
      {{ emptyMessage }}
    </p>
    <p
      v-if="insight"
      data-testid="donut-insight"
      class="text-sm text-slate-600 dark:text-slate-300"
    >
      {{ insight }}
    </p>
  </div>
</template>
