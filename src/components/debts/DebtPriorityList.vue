<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebtPayoffPlan } from '@/composables/useDebtPayoffPlan'
import { useCardsStore } from '@/stores/cardsStore'

const { t } = useI18n()
const cards = useCardsStore()
const { sortedDebtIds } = useDebtPayoffPlan()

const ordered = computed(() =>
  sortedDebtIds.value
    .map((id) => cards.state.items.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)
)
</script>

<template>
  <section
    data-testid="debt-priority-list"
    class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
  >
    <h2 class="text-base font-semibold">
      {{ t('debts.payoff.priority.title') }}
    </h2>
    <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm">
      <li
        v-for="debt in ordered"
        :key="debt.id"
        data-testid="debt-priority-item"
        :data-debt-id="debt.id"
      >
        {{ debt.name }} — {{ debt.apr }}% · {{ debt.balance.toLocaleString() }}
      </li>
    </ol>
  </section>
</template>
