<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    totalAssets?: number
    totalLiabilities?: number
    currency?: string
  }>(),
  { totalAssets: 0, totalLiabilities: 0, currency: 'COP' }
)

const net = computed(() => props.totalAssets - props.totalLiabilities)
const colorState = computed<'positive' | 'negative' | 'neutral'>(() => {
  if (net.value > 0) return 'positive'
  if (net.value < 0) return 'negative'
  return 'neutral'
})

const stateClass = computed(() => {
  switch (colorState.value) {
    case 'positive':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    case 'negative':
      return 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-slate-100 dark:bg-slate-800'
  }
})
</script>

<template>
  <section
    :data-color-state="colorState"
    :class="['rounded-lg border border-slate-200 p-4 dark:border-slate-700', stateClass]"
  >
    <h2 class="text-sm font-semibold uppercase tracking-wide">
      Patrimonio neto
    </h2>
    <p class="mt-1 text-2xl font-bold">
      {{ formatCurrency(net, currency) }}
    </p>
    <dl class="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div>
        <dt class="text-slate-500">
          Activos
        </dt>
        <dd>{{ formatCurrency(totalAssets, currency) }}</dd>
      </div>
      <div>
        <dt class="text-slate-500">
          Pasivos
        </dt>
        <dd>{{ formatCurrency(totalLiabilities, currency) }}</dd>
      </div>
    </dl>
  </section>
</template>
