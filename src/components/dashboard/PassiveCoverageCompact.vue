<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePassiveCoverage } from '@/composables/usePassiveCoverage'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency } from '@/lib/currency/format'

const { t } = useI18n()
const settings = useSettingsStore()
const { coverage } = usePassiveCoverage()

function fmt(amount: number): string {
  return formatCurrency(amount, settings.state.currency)
}
</script>

<template>
  <section
    data-testid="passive-coverage-compact"
    :data-covered="coverage.isFullyCovered ? 'true' : 'false'"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('flowCoverage.title') }}
    </h2>
    <p
      data-testid="flow-coverage-percent"
      class="mt-2 text-2xl font-bold tabular-nums"
    >
      {{ t('flowCoverage.percent', { percent: coverage.coveragePercent }) }}
    </p>
    <p
      v-if="coverage.isFullyCovered"
      data-testid="flow-coverage-covered"
      class="mt-1 text-sm text-emerald-600 dark:text-emerald-400"
    >
      {{ t('flowCoverage.covered') }}
    </p>
    <p
      v-else
      data-testid="flow-coverage-gap"
      class="mt-1 text-sm text-slate-600 dark:text-slate-400"
    >
      {{ t('flowCoverage.gap', { amount: fmt(coverage.monthlyGap) }) }}
    </p>
  </section>
</template>
