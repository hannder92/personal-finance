<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/lib/currency/format'
import { useFinancialFreedom } from '@/composables/useFinancialFreedom'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { progressPercent, targetPatrimony, targetReached } = useFinancialFreedom()
</script>

<template>
  <section
    data-testid="financial-freedom-compact"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('fi.compact.title') }}
    </h2>
    <p
      data-testid="fi-compact-progress"
      class="mt-2 text-sm text-slate-700 dark:text-slate-300"
    >
      {{
        targetReached
          ? t('fi.detail.targetReached')
          : t('fi.compact.progress', { percent: Math.round(progressPercent) })
      }}
    </p>
    <p
      data-testid="fi-compact-target"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      {{ formatCurrency(targetPatrimony, settings.state.currency) }}
    </p>
    <RouterLink
      to="/financial-freedom"
      class="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
    >
      {{ t('fi.compact.viewDetail') }}
    </RouterLink>
  </section>
</template>
