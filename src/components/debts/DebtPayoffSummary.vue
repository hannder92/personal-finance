<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebtPayoffPlan } from '@/composables/useDebtPayoffPlan'
import { useFormat } from '@/composables/useFormat'

const { t } = useI18n()
const fmt = useFormat()
const { debtFreeOutlook, totalBalance, totalInterest } = useDebtPayoffPlan()

const message = computed(() => {
  const outlook = debtFreeOutlook.value
  if (outlook.kind === 'none') return t('debts.payoff.summary.none')
  if (outlook.kind === 'never') return t('debts.payoff.summary.never')
  return t('debts.payoff.summary.estimated', { date: fmt.monthYear(outlook.date) })
})
</script>

<template>
  <section
    data-testid="debt-payoff-summary"
    :data-outlook="debtFreeOutlook.kind"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('debts.payoff.summary.title') }}
    </h2>
    <p
      data-testid="debt-payoff-date"
      :class="[
        'mt-2 text-sm',
        debtFreeOutlook.kind === 'never'
          ? 'font-medium text-red-700 dark:text-red-300'
          : 'text-slate-700 dark:text-slate-300',
      ]"
    >
      {{ message }}
    </p>
    <template v-if="debtFreeOutlook.kind !== 'none'">
      <p
        data-testid="debt-total-balance"
        class="mt-1 text-sm text-slate-600 dark:text-slate-400"
      >
        {{ t('debts.payoff.summary.totalBalance', { amount: fmt.currency(totalBalance) }) }}
      </p>
      <p
        v-if="Number.isFinite(totalInterest)"
        data-testid="debt-total-interest"
        class="text-sm text-slate-600 dark:text-slate-400"
      >
        {{ t('debts.payoff.summary.totalInterest', { amount: fmt.currency(totalInterest) }) }}
      </p>
    </template>
  </section>
</template>
