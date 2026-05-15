<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import type { Goal } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    goal?: Goal
    currency?: string
  }>(),
  { currency: 'COP' }
)

const completed = computed(() => !!props.goal && props.goal.saved >= props.goal.target)

const progressPct = computed(() => {
  if (!props.goal || props.goal.target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((props.goal.saved / props.goal.target) * 100)))
})

const etaMonths = computed(() => {
  if (!props.goal) return 0
  const remaining = Math.max(0, props.goal.target - props.goal.saved)
  if (props.goal.monthlyContrib <= 0) return Number.POSITIVE_INFINITY
  return Math.ceil(remaining / props.goal.monthlyContrib)
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
        ✓ Completada
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
      <span v-if="!completed && etaMonths !== Infinity">{{ etaMonths }} meses</span>
    </div>
  </article>
</template>
