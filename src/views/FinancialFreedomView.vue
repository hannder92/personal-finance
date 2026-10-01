<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FlowCoverageBlock from '@/components/fi/FlowCoverageBlock.vue'
import { useFinancialFreedom } from '@/composables/useFinancialFreedom'
import { useFormat } from '@/composables/useFormat'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'

const { t } = useI18n()
const fmtx = useFormat()
const { feasible } = useSavingsFeasibility()
const { monthlyLivingExpense, liquidAssets, targetPatrimony, monthsToTarget, targetReached } =
  useFinancialFreedom()

function fmt(n: number): string {
  return fmtx.currency(n)
}

const horizonText = computed(() => {
  const months = monthsToTarget.value
  if (months === null) return null
  const now = new Date()
  const date = fmtx.monthYear(new Date(now.getFullYear(), now.getMonth() + months, 1))
  if (months >= 24) {
    return t('fi.detail.horizonYears', { years: fmtx.number(months / 12, 1), date })
  }
  return t('fi.detail.horizonMonths', { months, date })
})
</script>

<template>
  <section data-testid="financial-freedom-view" class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
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
          <span v-else-if="horizonText">{{ horizonText }}</span>
          <span v-else>{{ t('fi.detail.noFeasibleSavings') }}</span>
        </dd>
      </div>
    </dl>

    <p data-testid="fi-assumptions" class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('fi.detail.assumptions', { monthly: fmt(feasible) }) }}
    </p>

    <FlowCoverageBlock />
  </section>
</template>
