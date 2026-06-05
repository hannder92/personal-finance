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
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
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
      class="mt-4 flex flex-col gap-2"
      role="list"
    >
      <li
        v-for="row in agenda"
        :key="row.offset"
        data-testid="data-agenda-row"
        class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
      >
        <span>{{ rowLabel(row.offset) }}</span>
        <span
          v-if="row.paymentCount === 0"
          data-agenda-count="0"
          class="text-slate-500"
        >
          {{ t('day.agenda.none') }}
        </span>
        <span
          v-else
          :data-agenda-count="row.paymentCount"
          class="tabular-nums"
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
