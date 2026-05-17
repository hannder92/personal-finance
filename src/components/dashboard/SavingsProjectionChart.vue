<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { useSavingsProjection } from '@/composables/useSavingsProjection'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const { hypothetical, compound, hasConfiguredRate } = useSavingsProjection()

const labels = computed(() => hypothetical.value.map((p) => `M${p.month + 1}`))

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Ahorro hipotético',
      data: hypothetical.value.map((p) => p.cumulativeAmount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderDash: [] as number[],
      tension: 0.2,
    },
    {
      label: 'Interés compuesto',
      data: compound.value.map((p) => p.totalValue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderDash: [5, 5],
      tension: 0.2,
      hidden: !hasConfiguredRate.value,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}

const seriesCount = computed(() => (hasConfiguredRate.value ? 2 : 1))
const hypotheticalFinal = computed(() => {
  const last = hypothetical.value[hypothetical.value.length - 1]
  return last ? last.cumulativeAmount : 0
})
const compoundFinal = computed(() => {
  const last = compound.value[compound.value.length - 1]
  return last ? last.totalValue : 0
})
</script>

<template>
  <article
    data-testid="savings-projection-chart"
    :data-series-count="seriesCount"
    :data-hypothetical-final="hypotheticalFinal"
    :data-compound-final="compoundFinal"
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <header>
      <h2 class="text-base font-semibold">Proyección de ahorro (12 meses)</h2>
    </header>

    <div v-if="!hasConfiguredRate" data-testid="savings-no-rate-empty" class="text-sm text-slate-500">
      Configura una tasa de rendimiento en un activo de tipo ahorro o inversión para ver la
      proyección de interés compuesto.
    </div>

    <div class="relative h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </article>
</template>
