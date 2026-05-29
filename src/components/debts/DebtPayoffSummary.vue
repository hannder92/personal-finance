<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebtPayoffPlan } from '@/composables/useDebtPayoffPlan'

const { t } = useI18n()
const { debtFreeDate } = useDebtPayoffPlan()

const formattedDate = computed(() => {
  const d = debtFreeDate.value
  if (!d) return '—'
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
})
</script>

<template>
  <section
    data-testid="debt-payoff-summary"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('debts.payoff.summary.title') }}
    </h2>
    <p
      data-testid="debt-payoff-date"
      class="mt-2 text-sm text-slate-700 dark:text-slate-300"
    >
      {{ t('debts.payoff.summary.estimated', { date: formattedDate }) }}
    </p>
  </section>
</template>
