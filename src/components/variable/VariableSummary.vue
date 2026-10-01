<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    totalBudget?: number
    totalSpent?: number
    currency?: string
  }>(),
  { totalBudget: 0, totalSpent: 0, currency: 'COP' }
)

const { t } = useI18n()
const excess = computed(() => Math.max(0, props.totalSpent - props.totalBudget))
const state = computed<'ok' | 'over'>(() => (props.totalSpent > props.totalBudget ? 'over' : 'ok'))
</script>

<template>
  <div
    :data-state="state"
    :class="[
      'flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm',
      state === 'over'
        ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
        : 'border-slate-200',
    ]"
  >
    <span>{{
      t('variable.summary.budget', { amount: formatCurrency(totalBudget, currency) })
    }}</span>
    <span>{{ t('variable.summary.spent', { amount: formatCurrency(totalSpent, currency) }) }}</span>
    <span v-if="state === 'over'">
      {{ t('variable.summary.excess', { amount: formatCurrency(excess, currency) }) }}
    </span>
  </div>
</template>
