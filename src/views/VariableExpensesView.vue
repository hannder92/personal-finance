<script setup lang="ts">
import { computed } from 'vue'
import QuickAddFAB from '@/components/variable/QuickAddFAB.vue'
import VariableCategoryCard from '@/components/variable/VariableCategoryCard.vue'
import VariableSummary from '@/components/variable/VariableSummary.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const settings = useSettingsStore()
const variable = useVariableExpensesStore()

const totalBudget = computed(() => variable.state.items.reduce((acc, c) => acc + c.budget, 0))
const totalSpent = computed(() => variable.state.items.reduce((acc, c) => acc + c.spent, 0))

function onRecord(payload: { categoryId: string; amount: number }) {
  variable.recordSpending(payload.categoryId, payload.amount)
}
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header>
      <h1 class="text-xl font-semibold">
        Gastos variables
      </h1>
    </header>

    <VariableSummary
      :total-budget="totalBudget"
      :total-spent="totalSpent"
      :currency="settings.state.currency"
    />

    <div class="grid gap-3 sm:grid-cols-2">
      <VariableCategoryCard
        v-for="c in variable.state.items"
        :key="c.id"
        :name="c.name"
        :budget="c.budget"
        :spent="c.spent"
        :currency="settings.state.currency"
      />
    </div>

    <QuickAddFAB
      route="/variable"
      :categories="variable.state.items"
      @record="onRecord"
    />
  </section>
</template>
