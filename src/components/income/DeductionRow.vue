<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    label?: string
    amount?: number
    type?: 'fixed' | 'percent'
    grossSalary?: number
    currency?: string
  }>(),
  {
    label: '',
    amount: 0,
    type: 'fixed',
    grossSalary: 0,
    currency: 'COP',
  }
)

const equivalent = computed(() => {
  if (props.type === 'percent') return (props.amount / 100) * props.grossSalary
  return props.amount
})

const equivalentLabel = computed(() => formatCurrency(equivalent.value, props.currency))
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
  >
    <span class="font-medium">{{ label }}</span>
    <div class="flex items-baseline gap-2 text-sm">
      <span
        v-if="type === 'percent'"
        class="text-slate-500"
      >{{ amount }}%</span>
      <span class="text-slate-700 dark:text-slate-200">{{ equivalentLabel }}</span>
    </div>
  </div>
</template>
