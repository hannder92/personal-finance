<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { useDTI } from '@/composables/useDTI'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { monthlyIncome, fixedExpenses, variableMonthly } = useBaseMetrics()
const { dti: dtiPct, totalDebtObligation } = useDTI()
</script>

<template>
  <!-- Grid instead of horizontal scroll: on a phone all KPIs stay visible (2 per row). -->
  <div
    data-testid="kpi-strip"
    class="grid grid-cols-2 gap-3 md:grid-cols-5"
  >
    <KpiCard
      class="col-span-2 md:col-span-1"
      :label="t('dashboard.kpi.netIncome')"
      :value="monthlyIncome"
      type="income"
      :currency="settings.state.currency"
      :hint="t('dashboard.kpi.hint.netIncome')"
    />
    <KpiCard
      :label="t('dashboard.kpi.fixedExpenses')"
      :value="fixedExpenses"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      :label="t('dashboard.kpi.variable')"
      :value="variableMonthly"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      :label="t('dashboard.kpi.debtPayments')"
      :value="totalDebtObligation"
      type="expenses"
      :currency="settings.state.currency"
    />
    <KpiCard
      :label="t('dashboard.kpi.dti')"
      :value="dtiPct"
      type="dti"
      :threshold="36"
      :currency="settings.state.currency"
      :hint="t('dashboard.kpi.hint.dti')"
    />
  </div>
</template>
