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
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import { useChartTheme } from '@/composables/useChartTheme'
import { useSavingsProjection } from '@/composables/useSavingsProjection'
import { formatCurrency } from '@/lib/currency/format'
import { formatCompactCurrency, projectionMonthLabels } from '@/lib/format/locale'
import { useSettingsStore } from '@/stores/settingsStore'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const { t } = useI18n()
const settings = useSettingsStore()
const { options: chartTheme } = useChartTheme()
const {
  hypothetical,
  compound,
  hasConfiguredRate,
  projectionRatePercent,
  liquidTotal,
  monthlyContribution,
} = useSavingsProjection()

const now = new Date()
const labels = computed(() =>
  projectionMonthLabels(
    now.getFullYear(),
    now.getMonth(),
    hypothetical.value.length,
    settings.state.lang
  )
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: t('savings.projection.hypothetical.label'),
      data: hypothetical.value.map((p) => p.cumulativeAmount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderDash: [] as number[],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
    },
    {
      label: t('savings.projection.compoundGrowth.label'),
      data: compound.value.map((p) => p.totalValue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
      hidden: !hasConfiguredRate.value,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: chartTheme.value.color, usePointStyle: true, pointStyle: 'line' },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
          `${ctx.dataset.label ?? ''}: ${formatCurrency(ctx.parsed.y ?? 0, settings.state.currency)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: chartTheme.value.color, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: chartTheme.value.color,
        maxTicksLimit: 5,
        callback: (value: number | string) =>
          formatCompactCurrency(Number(value), settings.state.currency),
      },
      grid: { color: chartTheme.value.gridColor },
      border: { display: false },
    },
  },
}))

const assumptions = computed(() =>
  t('savings.projection.assumptions', {
    liquid: formatCurrency(liquidTotal.value, settings.state.currency),
    monthly: formatCurrency(monthlyContribution.value, settings.state.currency),
  })
)

const seriesCount = computed(() => (hasConfiguredRate.value ? 2 : 1))
const hypotheticalFinal = computed(() => {
  const last = hypothetical.value[hypothetical.value.length - 1]
  return last ? last.cumulativeAmount : 0
})
const compoundFinal = computed(() => {
  const last = compound.value[compound.value.length - 1]
  return last ? last.totalValue : 0
})

const chartLabels = computed(() => chartData.value.datasets.map((d) => d.label).join('|'))

const showHintNeedRate = computed(() => liquidTotal.value > 0 && projectionRatePercent.value <= 0)
const showHintNeedAssets = computed(() => projectionRatePercent.value > 0 && liquidTotal.value <= 0)

const rateModel = computed({
  get: () => settings.state.projectionAnnualRatePercent,
  set: (value: number) => settings.setProjectionAnnualRatePercent(value),
})
</script>

<template>
  <article
    data-testid="savings-projection-chart"
    :data-series-count="seriesCount"
    :data-hypothetical-final="hypotheticalFinal"
    :data-compound-final="compoundFinal"
    :data-chart-labels="chartLabels"
    class="card flex flex-col gap-3"
  >
    <header class="flex flex-col gap-2">
      <h2 class="card-title">
        {{ t('savings.projection.sectionTitle') }}
      </h2>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ t('savings.projection.rateLabel') }}</span>
        <input
          v-model.number="rateModel"
          data-testid="projection-rate-input"
          type="number"
          min="0"
          max="100"
          step="0.1"
          class="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        >
        <span class="text-xs text-slate-500">{{ t('savings.projection.rateHint') }}</span>
      </label>
    </header>

    <p
      v-if="showHintNeedRate"
      data-testid="projection-hint-need-rate"
      class="text-sm text-slate-500"
    >
      {{ t('savings.projection.hintNeedRate') }}
    </p>
    <p
      v-else-if="showHintNeedAssets"
      data-testid="projection-hint-need-assets"
      class="text-sm text-slate-500"
    >
      {{ t('savings.projection.hintNeedAssets') }}
    </p>

    <div class="relative h-64">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <p
      data-testid="savings-projection-assumptions"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ assumptions }}
    </p>
  </article>
</template>
