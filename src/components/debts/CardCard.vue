<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import IconButton from '@/components/common/IconButton.vue'
import { calcDebtTimeline } from '@/lib/calculations/amortization'
import { formatCurrency } from '@/lib/currency/format'
import type { Debt } from '@/stores/cardsStore'

const props = withDefaults(
  defineProps<{
    card?: Debt
    currency?: string
    showDelete?: boolean
  }>(),
  { currency: 'COP', showDelete: false }
)

const emit = defineEmits<{
  delete: []
}>()

const { t } = useI18n()

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
    class="flex w-full flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <header class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold">
          {{ card.name }}
        </h3>
        <span class="text-sm text-slate-500">{{ formatCurrency(card.balance, currency) }}</span>
      </div>
      <IconButton
        v-if="showDelete"
        data-testid="debt-delete-btn"
        :label="t('common.delete')"
        :icon="Trash2"
        @click="emit('delete')"
      />
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
