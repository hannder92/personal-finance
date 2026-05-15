<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import type { Debt } from '@/stores/cardsStore'

const props = withDefaults(
  defineProps<{
    cards?: Debt[]
    today?: Date
    currency?: string
  }>(),
  { cards: () => [], today: () => new Date(), currency: 'COP' }
)

const upcoming = computed(() => {
  const todayMs = props.today.getTime()
  const limit = todayMs + 7 * 24 * 60 * 60 * 1000
  return props.cards.filter((c) => {
    if (c.type !== 'card' || !c.dueDate) return false
    const due = new Date(c.dueDate).getTime()
    return due >= todayMs && due <= limit
  })
})
</script>

<template>
  <ul
    v-if="upcoming.length > 0"
    class="flex flex-col gap-2"
    role="list"
  >
    <li
      v-for="c in upcoming"
      :key="c.id"
      class="rounded border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950"
    >
      {{ c.name }} — pago mínimo {{ formatCurrency(c.minPayment, currency) }}
    </li>
  </ul>
</template>
