<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    label?: string
    amount?: number
    currency?: string
  }>(),
  { label: '', amount: 0, currency: 'COP' }
)

const formatted = computed(() => formatCurrency(props.amount, props.currency))
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded border border-emerald-300 bg-emerald-50/50 px-3 py-2 dark:border-emerald-700 dark:bg-emerald-900/30"
  >
    <span class="font-medium">{{ label }}</span>
    <span class="text-sm text-emerald-700 dark:text-emerald-200">
      + {{ formatted }} (no afecta base)
    </span>
  </div>
</template>
