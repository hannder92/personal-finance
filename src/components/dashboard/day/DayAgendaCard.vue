<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CalendarDays } from 'lucide-vue-next'
import { formatCurrency } from '@/lib/currency/format'
import type { AgendaDayRow } from '@/lib/calculations/day-obligations'
import { useSettingsStore } from '@/stores/settingsStore'

defineProps<{
  agenda: AgendaDayRow[]
}>()

const { t } = useI18n()
const settings = useSettingsStore()

function rowLabel(offset: 0 | 1 | 2): string {
  if (offset === 0) return t('day.agenda.day0')
  if (offset === 1) return t('day.agenda.day1')
  return t('day.agenda.day2')
}
</script>

<template>
  <section
    data-testid="day-agenda-card"
    class="py-3 first:pt-0 last:pb-0"
  >
    <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
      <CalendarDays
        data-testid="day-section-icon"
        class="h-4 w-4"
        aria-hidden="true"
      />
      <span>{{ t('day.agenda.title') }}</span>
    </div>
    <ul
      class="mt-2 grid grid-cols-3 gap-2"
      role="list"
    >
      <li
        v-for="row in agenda"
        :key="row.offset"
        data-testid="data-agenda-row"
        class="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
      >
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
          {{ rowLabel(row.offset) }}
        </span>
        <span
          v-if="row.paymentCount === 0"
          data-agenda-count="0"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          {{ t('day.agenda.none') }}
        </span>
        <span
          v-else
          :data-agenda-count="row.paymentCount"
          class="text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100"
        >
          {{
            t('day.agenda.row', {
              count: row.paymentCount,
              amount: formatCurrency(row.totalMinPayment, settings.state.currency),
            })
          }}
        </span>
      </li>
    </ul>
  </section>
</template>
