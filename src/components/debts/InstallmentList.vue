<script setup lang="ts">
import { formatCurrency } from '@/lib/currency/format'
import type { Installment } from '@/stores/cardsStore'

withDefaults(
  defineProps<{
    items?: Installment[]
    currency?: string
  }>(),
  { items: () => [], currency: 'COP' }
)
</script>

<template>
  <ul
    v-if="items.length > 0"
    class="flex flex-col gap-2"
    role="list"
  >
    <li
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
    >
      <div class="flex flex-col">
        <span class="font-medium">{{ item.name }}</span>
        <span class="text-xs text-slate-500">{{ formatCurrency(item.total, currency) }}</span>
      </div>
      <span class="text-sm text-slate-600 dark:text-slate-300">
        {{ item.paid }} / {{ item.installments }}
      </span>
    </li>
  </ul>
</template>
