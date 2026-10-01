<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { formatMonthYear } from '@/lib/format/locale'
import type { Snapshot } from '@/stores/snapshotsStore'

const props = withDefaults(
  defineProps<{
    snapshots?: Snapshot[]
    currency?: string
  }>(),
  { snapshots: () => [], currency: 'COP' }
)

const { t, locale } = useI18n()

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return formatMonthYear(new Date(y ?? 1970, (m ?? 1) - 1, 1), locale.value)
}

const ordered = computed(() => [...props.snapshots].sort((a, b) => b.month.localeCompare(a.month)))
</script>

<template>
  <div>
    <ul v-if="ordered.length > 0" class="flex flex-col gap-2" role="list">
      <li
        v-for="s in ordered"
        :key="s.id"
        :data-month="s.month"
        class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
      >
        <div class="flex flex-col">
          <span class="text-sm font-semibold">{{ monthLabel(s.month) }}</span>
          <span class="text-xs text-slate-500">{{
            s.healthScore === null
              ? t('history.noScore')
              : t('history.score', { score: Math.round(s.healthScore) })
          }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-sm">{{ formatCurrency(s.netIncome, currency) }}</span>
          <span class="text-xs text-slate-500">{{
            t('history.netWorth', { amount: formatCurrency(s.netWorth, currency) })
          }}</span>
        </div>
      </li>
    </ul>
    <p
      v-else
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
    >
      {{ t('history.empty') }}
    </p>
  </div>
</template>
