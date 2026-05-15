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

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = withDefaults(
  defineProps<{
    months?: Array<{ label: string; balance: number }>
    textColor?: string
    gridColor?: string
  }>(),
  {
    months: () => [],
    textColor: '#1e293b',
    gridColor: '#cbd5e1',
  }
)

const chartData = computed(() => ({
  labels: props.months.map((m) => m.label),
  datasets: [
    {
      label: 'Balance proyectado',
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
  },
  scales: {
    x: {
      ticks: { color: props.textColor },
      grid: { color: props.gridColor },
    },
    y: {
      ticks: { color: props.textColor },
      grid: { color: props.gridColor },
    },
  },
}))
</script>

<template>
  <div class="relative h-72 w-full">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
