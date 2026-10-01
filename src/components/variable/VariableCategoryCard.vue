<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2 } from 'lucide-vue-next'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    name?: string
    budget?: number
    spent?: number
    currency?: string
    removable?: boolean
  }>(),
  { name: '', budget: 0, spent: 0, currency: 'COP', removable: false }
)

const emit = defineEmits<{ remove: [] }>()

const { t } = useI18n()

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

// Status in words as well as color (WCAG 1.4.1).
const statusText = computed(() => {
  const diff = props.budget - props.spent
  if (diff < 0) return t('variable.card.over', { amount: formatCurrency(-diff, props.currency) })
  return t('variable.card.remaining', { amount: formatCurrency(diff, props.currency) })
})
</script>

<template>
  <article class="flex flex-col gap-2 rounded border border-slate-200 p-3 dark:border-slate-700">
    <header class="flex items-baseline justify-between gap-2">
      <h3 class="text-sm font-semibold">
        {{ name }}
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">
          {{ formatCurrency(spent, currency) }} / {{ formatCurrency(budget, currency) }}
        </span>
        <button
          v-if="removable"
          type="button"
          data-testid="variable-remove-btn"
          :aria-label="t('variable.card.remove', { name })"
          class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          @click="emit('remove')"
        >
          <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
    <div
      role="progressbar"
      :data-status="status"
      :aria-valuenow="pctCapped"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuetext="statusText"
      class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
    >
      <div :class="['h-full', COLOR[status]]" :style="{ width: `${pctCapped}%` }" />
    </div>
    <p
      data-testid="variable-status-text"
      :class="[
        'text-xs',
        status === 'over' ? 'font-medium text-red-700 dark:text-red-300' : 'text-slate-500',
      ]"
    >
      {{ statusText }}
    </p>
  </article>
</template>
