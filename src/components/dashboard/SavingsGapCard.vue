<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { objective, feasible, gap, isRuleViable } = useSavingsFeasibility()

function fmt(amount: number): string {
  return formatCurrency(amount, settings.state.currency)
}
</script>

<template>
  <section
    data-testid="savings-gap-card"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('dashboard.savingsGap.title') }}
    </h2>
    <dl class="mt-3 grid gap-2 text-sm">
      <div class="flex justify-between gap-2">
        <dt>{{ t('dashboard.savingsGap.objective') }}</dt>
        <dd data-testid="savings-gap-objective">
          {{ fmt(objective) }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('dashboard.savingsGap.feasible') }}</dt>
        <dd
          v-if="feasible > 0"
          data-testid="savings-gap-feasible"
        >
          {{ fmt(feasible) }}
        </dd>
        <dd
          v-else
          data-testid="savings-gap-feasible"
          data-unavailable="true"
          class="text-slate-500"
        >
          {{ t('dashboard.savingsGap.unavailable') }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt>{{ t('dashboard.savingsGap.gap') }}</dt>
        <dd data-testid="savings-gap-gap">
          {{ fmt(gap) }}
        </dd>
      </div>
    </dl>
    <p
      v-if="!isRuleViable && feasible > 0"
      role="alert"
      class="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      {{ t('dashboard.savingsGap.notViable') }}
    </p>
  </section>
</template>
