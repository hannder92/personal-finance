<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    name?: string
    budget?: number
    spent?: number
    currency?: string
  }>(),
  { name: '', budget: 0, spent: 0, currency: 'COP' }
)

const pctRaw = computed(() => (props.budget > 0 ? (props.spent / props.budget) * 100 : 0))
const pctCapped = computed(() => Math.min(100, Math.round(pctRaw.value)))

const status = computed<'ok' | 'warn' | 'over'>(() => {
  if (pctRaw.value > 100) return 'over'
  if (pctRaw.value >= 80) return 'warn'
  return 'ok'
})

const COLOR: Record<string, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  over: 'bg-red-500',
}
</script>

<template>
  <article class="flex flex-col gap-2 rounded border border-slate-200 p-3 dark:border-slate-700">
    <header class="flex items-baseline justify-between">
      <h3 class="text-sm font-semibold">
        {{ name }}
      </h3>
      <span class="text-xs text-slate-500">
        {{ formatCurrency(spent, currency) }} / {{ formatCurrency(budget, currency) }}
      </span>
    </header>
    <div
      role="progressbar"
      :data-status="status"
      :aria-valuenow="pctCapped"
      :aria-valuemin="0"
      :aria-valuemax="100"
      class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
    >
      <div
        :class="['h-full', COLOR[status]]"
        :style="{ width: `${pctCapped}%` }"
      />
    </div>
  </article>
</template>
