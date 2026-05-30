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
    data-testid="flow-coverage-block"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('flowCoverage.title') }}
    </h2>
    <dl class="mt-3 grid gap-2 text-sm">
      <div class="flex justify-between gap-2">
        <dt>{{ t('flowCoverage.percentLabel') }}</dt>
        <dd data-testid="flow-coverage-percent">
          {{ t('flowCoverage.percent', { percent: coverage.coveragePercent }) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>
          {{ coverage.isFullyCovered ? t('flowCoverage.covered') : t('flowCoverage.gapLabel') }}
        </dt>
        <dd
          v-if="coverage.isFullyCovered"
          data-testid="flow-coverage-covered"
        >
          {{ t('flowCoverage.covered') }}
        </dd>
        <dd
          v-else
          data-testid="flow-coverage-gap"
        >
          {{ fmt(coverage.monthlyGap) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
