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
import { useSavingsProjection } from '@/composables/useSavingsProjection'
import { useSettingsStore } from '@/stores/settingsStore'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const { t } = useI18n()
const settings = useSettingsStore()
const { hypothetical, compound, hasConfiguredRate, projectionRatePercent, liquidTotal } =
  useSavingsProjection()

const labels = computed(() => hypothetical.value.map((p) => `M${p.month + 1}`))

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: t('savings.projection.hypothetical.label'),
      data: hypothetical.value.map((p) => p.cumulativeAmount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderDash: [] as number[],
      tension: 0.2,
    },
    {
      label: t('savings.projection.compoundGrowth.label'),
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
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <header class="flex flex-col gap-2">
      <h2 class="text-base font-semibold">
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
  </article>
</template>
