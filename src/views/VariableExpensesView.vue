<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QuickAddFAB from '@/components/variable/QuickAddFAB.vue'
import VariableCategoryCard from '@/components/variable/VariableCategoryCard.vue'
import VariableSummary from '@/components/variable/VariableSummary.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVariableExpensesStore } from '@/stores/variableExpensesStore'

const { t } = useI18n()
const settings = useSettingsStore()
const variable = useVariableExpensesStore()

const totalBudget = computed(() => variable.state.items.reduce((acc, c) => acc + c.budget, 0))
const totalSpent = computed(() => variable.state.items.reduce((acc, c) => acc + c.spent, 0))

const form = ref({ name: '', budget: '' })
const canSubmit = computed(
  () => form.value.name.trim().length > 0 && parseAmount(form.value.budget) > 0
)

function parseAmount(raw: string): number {
  return Number.parseInt(raw.replace(/\D/g, ''), 10) || 0
}

function onAddCategory(event: Event) {
  event.preventDefault()
  if (!canSubmit.value) return
  variable.add({ name: form.value.name.trim(), budget: parseAmount(form.value.budget) })
  form.value = { name: '', budget: '' }
}

function onRecord(payload: { categoryId: string; amount: number }) {
  variable.recordSpending(payload.categoryId, payload.amount)
}
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-xl font-semibold">
        {{ t('variable.title') }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ t('variable.resetHint') }}
      </p>
    </header>

    <VariableSummary
      :total-budget="totalBudget"
      :total-spent="totalSpent"
      :currency="settings.state.currency"
    />

    <form
      data-testid="variable-add-form"
      class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-end"
      @submit="onAddCategory"
    >
      <label class="flex flex-1 flex-col gap-1 text-sm">
        <span>{{ t('variable.form.name') }}</span>
        <input
          v-model="form.name"
          data-testid="variable-name-input"
          type="text"
          maxlength="60"
          class="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        >
      </label>
      <label class="flex flex-1 flex-col gap-1 text-sm">
        <span>{{ t('variable.form.budget') }}</span>
        <input
          v-model="form.budget"
          data-testid="variable-budget-input"
          type="text"
          inputmode="numeric"
          class="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        >
      </label>
      <button
        type="submit"
        data-testid="variable-add-btn"
        :disabled="!canSubmit"
        class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {{ t('variable.form.submit') }}
      </button>
    </form>

    <p
      v-if="variable.state.items.length === 0"
      data-testid="variable-empty"
      class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600"
    >
      {{ t('variable.empty') }}
    </p>

    <div
      v-else
      class="grid gap-3 sm:grid-cols-2"
    >
      <VariableCategoryCard
        v-for="c in variable.state.items"
        :key="c.id"
        :name="c.name"
        :budget="c.budget"
        :spent="c.spent"
        :currency="settings.state.currency"
        removable
        @remove="variable.remove(c.id)"
      />
    </div>

    <QuickAddFAB
      v-if="variable.state.items.length > 0"
      route="/variable"
      :categories="variable.state.items"
      @record="onRecord"
    />
  </section>
</template>
