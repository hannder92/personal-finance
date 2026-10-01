<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/currency/format'
import { useSavingsFeasibility } from '@/composables/useSavingsFeasibility'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settings = useSettingsStore()
const { objective, feasible, gap, isRuleViable } = useSavingsFeasibility()

// When the feasible saving beats the rule, show the surplus instead of a flat $0 gap.
const surplus = computed(() => Math.max(0, feasible.value - objective.value))

function fmt(amount: number): string {
  return formatCurrency(amount, settings.state.currency)
}
</script>

<template>
  <section
    data-testid="savings-gap-card"
    class="card"
  >
    <h2 class="card-title">
      {{ t('dashboard.savingsGap.title') }}
    </h2>
    <dl class="mt-3 grid gap-2 text-sm">
      <div class="flex justify-between gap-2">
        <dt>{{ t('dashboard.savingsGap.objective') }}</dt>
        <dd
          data-testid="savings-gap-objective"
          class="tabular-nums"
        >
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
      <div
        v-if="surplus > 0"
        class="flex justify-between gap-2 border-t border-slate-100 pt-2 font-medium dark:border-slate-800"
      >
        <dt>{{ t('dashboard.savingsGap.surplus') }}</dt>
        <dd
          data-testid="savings-gap-surplus"
          class="tabular-nums text-emerald-700 dark:text-emerald-400"
        >
          +{{ fmt(surplus) }}
        </dd>
      </div>
      <div
        v-else
        class="flex justify-between gap-2 border-t border-slate-100 pt-2 font-medium dark:border-slate-800"
      >
        <dt>{{ t('dashboard.savingsGap.gap') }}</dt>
        <dd
          data-testid="savings-gap-gap"
          class="tabular-nums"
          :class="gap > 0 ? 'text-amber-700 dark:text-amber-400' : ''"
        >
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
