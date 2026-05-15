<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const FREQUENCY_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

const props = withDefaults(
  defineProps<{
    label?: string
    amount?: number
    frequency?: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
    currency?: string
  }>(),
  { label: '', amount: 0, frequency: 'monthly', currency: 'COP' }
)

const monthlyAmount = computed(() => {
  const months = FREQUENCY_MONTHS[props.frequency] ?? 1
  return props.amount / months
})

const monthlyLabel = computed(() => formatCurrency(monthlyAmount.value, props.currency))
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
  >
    <span class="font-medium">{{ label }}</span>
    <span class="text-sm text-slate-600 dark:text-slate-300"> ≈ {{ monthlyLabel }} / mes </span>
  </div>
</template>
