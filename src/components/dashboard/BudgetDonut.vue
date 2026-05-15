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
  }>(),
  {
    needs: 50,
    wants: 30,
    savings: 20,
    textColor: '#1e293b',
    backgroundColor: '#f8fafc',
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
</script>

<template>
  <div class="relative h-64 w-full">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
