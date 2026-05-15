<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    totalBudget?: number
    totalSpent?: number
    currency?: string
  }>(),
  { totalBudget: 0, totalSpent: 0, currency: 'COP' }
)

const excess = computed(() => Math.max(0, props.totalSpent - props.totalBudget))
const state = computed<'ok' | 'over'>(() => (props.totalSpent > props.totalBudget ? 'over' : 'ok'))
</script>

<template>
  <div
    :data-state="state"
    :class="[
      'flex items-center justify-between rounded border px-3 py-2 text-sm',
      state === 'over'
        ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
        : 'border-slate-200',
    ]"
  >
    <span>Presupuesto: {{ formatCurrency(totalBudget, currency) }}</span>
    <span>Gastado: {{ formatCurrency(totalSpent, currency) }}</span>
    <span v-if="state === 'over'">Exceso: {{ formatCurrency(excess, currency) }}</span>
  </div>
</template>
