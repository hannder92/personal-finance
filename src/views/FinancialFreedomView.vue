<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { useFinancialFreedom } from '@/composables/useFinancialFreedom'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { monthlyLivingExpense, liquidAssets, targetPatrimony, monthsToTarget, targetReached } =
  useFinancialFreedom()

function fmt(n: number): string {
  return formatCurrency(n, settings.state.currency)
}
</script>

<template>
  <section
    data-testid="financial-freedom-view"
    class="mx-auto flex max-w-2xl flex-col gap-6 p-6"
  >
    <header>
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('fi.detail.title') }}
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {{ t('fi.detail.subtitle') }}
      </p>
    </header>

    <dl class="grid gap-4 text-sm">
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.livingExpense') }}</dt>
        <dd data-testid="fi-living-expense">
          {{ fmt(monthlyLivingExpense) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.liquidAssets') }}</dt>
        <dd data-testid="fi-liquid-assets">
          {{ fmt(liquidAssets) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.target') }}</dt>
        <dd data-testid="fi-target">
          {{ fmt(targetPatrimony) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('fi.detail.horizon') }}</dt>
        <dd data-testid="fi-horizon">
          <span v-if="targetReached">{{ t('fi.detail.targetReached') }}</span>
          <span v-else-if="monthsToTarget !== null">{{ monthsToTarget }} meses</span>
          <span v-else>{{ t('fi.detail.noFeasibleSavings') }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>
