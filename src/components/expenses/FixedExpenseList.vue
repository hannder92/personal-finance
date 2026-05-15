<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ExpenseForm from './ExpenseForm.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useExpensesStore } from '@/stores/expensesStore'
import { useIncomeStore } from '@/stores/incomeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const expenses = useExpensesStore()
const income = useIncomeStore()
const settings = useSettingsStore()

const total = computed(() => expenses.state.items.reduce((acc, e) => acc + e.amount, 0))
const remaining = computed(() => income.state.grossSalary - total.value)
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
          <span class="text-xs text-slate-500">{{ item.category }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm">{{ formatCurrency(item.amount, currency) }}</span>
          <button
            type="button"
            aria-label="Eliminar"
            class="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            @click="askDelete(item.id)"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>

    <footer
      class="flex justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-700"
    >
      <span>Total: {{ formatCurrency(total, currency) }}</span>
      <span>Restante: {{ formatCurrency(remaining, currency) }}</span>
    </footer>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Eliminar gasto"
      message="¿Confirmas que deseas eliminar este gasto?"
      confirm-label="Confirmar"
      cancel-label="Cancelar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
