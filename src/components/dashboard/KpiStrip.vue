<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { useDTI } from '@/composables/useDTI'
import { useNetIncome } from '@/composables/useNetIncome'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { totalMonthlyIncome, fixedExpensesTotal, variableBudgetTotal } = useNetIncome()
const { dti: dtiPct, totalDebtObligation } = useDTI()
</script>

<template>
  <div
    data-testid="kpi-strip"
    class="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <KpiCard
      class="min-w-[9rem] shrink-0"
      :label="t('dashboard.kpi.netIncome')"
      :value="totalMonthlyIncome"
      type="income"
      :currency="settings.state.currency"
    />
    <KpiCard
      class="min-w-[9rem] shrink-0"
      :label="t('dashboard.kpi.fixedExpenses')"
      :value="fixedExpensesTotal"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      v-if="variableBudgetTotal > 0"
      class="min-w-[9rem] shrink-0"
      :label="t('dashboard.kpi.variableExpenses')"
      :value="variableBudgetTotal"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      class="min-w-[9rem] shrink-0"
      :label="t('dashboard.kpi.debtPayments')"
      :value="totalDebtObligation"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      class="min-w-[9rem] shrink-0"
      :label="t('dashboard.kpi.dti')"
      :value="dtiPct"
      type="dti"
      :threshold="36"
      :currency="settings.state.currency"
    />
  </div>
</template>
