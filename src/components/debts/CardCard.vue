<script setup lang="ts">
import { computed } from 'vue'
import { calcDebtTimeline } from '@/lib/calculations/amortization'
import { formatCurrency } from '@/lib/currency/format'
import type { Debt } from '@/stores/cardsStore'

const props = withDefaults(
  defineProps<{
    card?: Debt
    currency?: string
  }>(),
  { currency: 'COP' }
)

const utilizationPct = computed(() => {
  if (!props.card || props.card.type !== 'card') return null
  if (props.card.limit <= 0) return 0
  return Math.round((props.card.balance / props.card.limit) * 100)
})

const months = computed(() => {
  if (!props.card) return 0
  const timeline = calcDebtTimeline({
    type: props.card.type,
    balance: props.card.balance,
    apr: props.card.apr,
    minPayment: props.card.minPayment,
    ...(props.card.type === 'loan'
      ? { remainingInstallments: props.card.remainingInstallments }
      : {}),
  } as Debt)
  return timeline.months
})
</script>

<template>
  <article
    v-if="card"
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <header class="flex items-baseline justify-between">
      <h3 class="text-base font-semibold">
        {{ card.name }}
      </h3>
      <span class="text-sm text-slate-500">{{ formatCurrency(card.balance, currency) }}</span>
    </header>

    <template v-if="card.type === 'card'">
      <div
        role="progressbar"
        :aria-valuenow="utilizationPct ?? 0"
        :aria-valuemin="0"
        :aria-valuemax="100"
        class="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700"
      >
        <div
          class="h-full bg-blue-600"
          :style="{ width: `${utilizationPct ?? 0}%` }"
        />
      </div>
      <p class="text-xs text-slate-500">
        Utilización: {{ utilizationPct }}%
      </p>
      <p class="text-sm">
        Pago en {{ Math.ceil(months) }} meses
      </p>
    </template>

    <template v-else>
      <p class="text-sm">
        {{ card.remainingInstallments }} cuotas restantes
      </p>
    </template>
  </article>
</template>
