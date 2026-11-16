<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ExpenseForm from './ExpenseForm.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useExpensesStore } from '@/stores/expensesStore'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { useSettingsStore } from '@/stores/settingsStore'

const expenses = useExpensesStore()
const { monthlyIncome } = useBaseMetrics()
const { t, te } = useI18n()
const settings = useSettingsStore()

const total = computed(() => expenses.state.items.reduce((acc, e) => acc + e.amount, 0))
// What is left of the net monthly income (after deductions, retención, libranzas, plus
// prorated streams) once fixed expenses are paid. Gross salary overstated it.
const remaining = computed(() => monthlyIncome.value - total.value)

function categoryLabel(category: string): string {
  const key = `expenses.categories.${category}`
  return te(key) ? t(key) : category
}
const currency = computed(() => settings.state.currency)

const confirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

function onAdd(value: { name: string; amount: number; category: string }) {
  expenses.add(value)
}

function askDelete(id: string) {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

function confirmDelete() {
  if (pendingDeleteId.value) expenses.remove(pendingDeleteId.value)
  pendingDeleteId.value = null
  confirmOpen.value = false
}

function cancelDelete() {
  pendingDeleteId.value = null
  confirmOpen.value = false
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <ExpenseForm @submit="onAdd" />

    <ul
      v-if="expenses.state.items.length > 0"
      class="flex flex-col gap-2"
      role="list"
    >
      <li
        v-for="item in expenses.state.items"
        :key="item.id"
        class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
      >
        <div class="flex flex-col">
          <span class="font-medium">{{ item.name }}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{
            categoryLabel(item.category)
          }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm">{{ formatCurrency(item.amount, currency) }}</span>
          <button
            type="button"
            :aria-label="t('common.delete')"
            class="rounded border border-red-200 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
            @click="askDelete(item.id)"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </li>
    </ul>

    <footer
      class="flex justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-700"
    >
      <span>{{ t('expenses.total', { amount: formatCurrency(total, currency) }) }}</span>
      <span
        :title="t('expenses.remainingHint')"
        :class="remaining < 0 ? 'text-red-600 dark:text-red-400' : ''"
      >
        {{ t('expenses.remaining', { amount: formatCurrency(remaining, currency) }) }}
      </span>
    </footer>

    <ConfirmDialog
      v-model:open="confirmOpen"
      :title="t('expenses.confirmTitle')"
      :message="t('expenses.confirmMessage')"
      :confirm-label="t('expenses.confirm')"
      :cancel-label="t('expenses.cancel')"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
