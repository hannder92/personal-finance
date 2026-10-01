<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { CalendarCheck } from 'lucide-vue-next'
import { formatCurrency } from '@/lib/currency/format'
import type { DayCoverageView } from '@/composables/useDayOverview'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{
  coverage: DayCoverageView
}>()

const { t } = useI18n()
const settings = useSettingsStore()

const badgeClass = computed(() => {
  switch (props.coverage.status) {
    case 'covered':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100'
    case 'shortfall':
      return 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100'
    case 'no_liquid':
      return 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200'
  }
})

const badgeText = computed(() => {
  const c = props.coverage
  if (c.status === 'covered') return t('day.coverage.ok')
  if (c.status === 'shortfall') {
    return t('day.coverage.shortfall', {
      amount: formatCurrency(c.shortfallAmount, settings.state.currency),
    })
  }
  if (c.status === 'no_liquid') return t('day.coverage.noLiquidCta')
  return t('day.coverage.noDue')
})
</script>

<template>
  <section
    data-testid="day-coverage-card"
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
      <CalendarCheck
        data-testid="day-section-icon"
        class="h-4 w-4"
        aria-hidden="true"
      />
      <span>{{ t('day.coverage.title') }}</span>
    </div>
    <p
      data-testid="coverage-badge"
      :data-coverage-status="coverage.status"
      class="mt-3 inline-flex rounded-lg border px-3 py-2 text-xl font-bold"
      :class="badgeClass"
    >
      {{ badgeText }}
    </p>
    <p
      v-if="coverage.status !== 'no_due_today'"
      data-testid="liquid-secondary"
      data-liquid-secondary
      class="mt-3 text-sm text-slate-600 dark:text-slate-400"
    >
      <span class="font-medium">{{ t('day.coverage.liquidLabel') }}:</span>
      {{ formatCurrency(coverage.liquidTotal, settings.state.currency) }}
    </p>
    <p
      v-if="coverage.status !== 'no_due_today'"
      class="mt-1 text-xs text-slate-500"
    >
      {{ t('day.coverage.context') }}
    </p>
    <RouterLink
      v-if="coverage.status === 'no_liquid'"
      data-testid="cta-patrimonio"
      data-cta-patrimonio
      to="/networth"
      class="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
    >
      {{ t('day.coverage.noLiquidCta') }} →
    </RouterLink>
  </section>
</template>
