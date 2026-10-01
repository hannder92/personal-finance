<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { formatMonthYear } from '@/lib/format/locale'
import { useGoalStatus } from '@/composables/useGoalStatus'
import type { Goal } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    goal?: Goal
    currency?: string
  }>(),
  { currency: 'COP' }
)

const { t, locale } = useI18n()
const { eta, targetDate, requiredMonthly } = useGoalStatus(() => props.goal)

const completed = computed(() => !!props.goal && props.goal.saved >= props.goal.target)

const progressPct = computed(() => {
  if (!props.goal || props.goal.target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((props.goal.saved / props.goal.target) * 100)))
})

const etaMonths = computed(() => eta.value?.months ?? 0)

function monthYear(date: Date): string {
  return formatMonthYear(date, locale.value)
}

// One warning line at most: overdue > behind schedule > no contribution.
const warning = computed<string | null>(() => {
  if (completed.value || !eta.value) return null
  if (eta.value.overdue) return t('goals.card.overdue')
  if (eta.value.behindSchedule && eta.value.estimatedDate && requiredMonthly.value !== null) {
    return t('goals.card.behind', {
      date: monthYear(eta.value.estimatedDate),
      amount: formatCurrency(Math.ceil(requiredMonthly.value), props.currency),
    })
  }
  if (etaMonths.value === Infinity) return t('goals.card.noContrib')
  return null
})
</script>

<template>
  <article
    v-if="goal"
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <header class="flex items-baseline justify-between">
      <h3 class="text-base font-semibold">
        {{ goal.name }}
      </h3>
      <span
        v-if="completed"
        class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      >
        {{ t('goals.card.completed') }}
      </span>
    </header>

    <div
      role="progressbar"
      :aria-valuenow="progressPct"
      :aria-valuemin="0"
      :aria-valuemax="100"
      class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
    >
      <div
        class="h-full bg-emerald-600"
        :style="{ width: `${progressPct}%` }"
      />
    </div>

    <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
      <span>{{ formatCurrency(goal.saved, currency) }} /
        {{ formatCurrency(goal.target, currency) }}</span>
      <span v-if="!completed && etaMonths !== Infinity">{{
        t('goals.card.months', { count: etaMonths })
      }}</span>
    </div>

    <p
      v-if="targetDate && !completed"
      data-testid="goal-target-date"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ t('goals.card.targetDate', { date: monthYear(targetDate) }) }}
    </p>
    <p
      v-if="warning"
      data-testid="goal-warning"
      class="text-xs font-medium text-amber-700 dark:text-amber-300"
    >
      {{ warning }}
    </p>
  </article>
</template>
