<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FIXED_EXPENSE_CATEGORIES } from '@/stores/expensesStore'

const emit = defineEmits<{
  (e: 'submit', value: { name: string; amount: number; category: string }): void
}>()

const { t } = useI18n()

const name = ref('')
const amountRaw = ref('')
const category = ref<string>('vivienda')

function onSubmit(event: Event) {
  event.preventDefault()
  const amount = Number.parseInt(amountRaw.value.replace(/\D/g, ''), 10) || 0
  if (!name.value.trim() || amount <= 0) return
  emit('submit', { name: name.value.trim(), amount, category: category.value })
  name.value = ''
  amountRaw.value = ''
}
</script>

<template>
  <form
    class="flex flex-wrap items-end gap-2"
    @submit="onSubmit"
  >
    <label class="flex flex-1 flex-col gap-1">
      <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('expenses.name') }}</span>
      <input
        v-model="name"
        type="text"
        maxlength="60"
        :aria-label="t('expenses.name')"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
    </label>
    <label class="flex flex-1 flex-col gap-1">
      <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('expenses.amount') }}</span>
      <input
        v-model="amountRaw"
        type="text"
        inputmode="numeric"
        :aria-label="t('expenses.amount')"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
    </label>
    <label class="flex flex-1 flex-col gap-1">
      <span class="text-xs text-slate-600 dark:text-slate-300">{{ t('expenses.category') }}</span>
      <select
        v-model="category"
        :aria-label="t('expenses.category')"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
        <option
          v-for="c in FIXED_EXPENSE_CATEGORIES"
          :key="c"
          :value="c"
        >
          {{ t(`expenses.categories.${c}`) }}
        </option>
      </select>
    </label>
    <button
      type="submit"
      class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      {{ t('expenses.add') }}
    </button>
  </form>
</template>
