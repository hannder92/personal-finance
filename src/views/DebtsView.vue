<script setup lang="ts">
import { ref } from 'vue'
import CardCard from '@/components/debts/CardCard.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DebtPayoffSummary from '@/components/debts/DebtPayoffSummary.vue'
import DebtPayoffSimulator from '@/components/debts/DebtPayoffSimulator.vue'
import DebtPriorityList from '@/components/debts/DebtPriorityList.vue'
import DueDateAlerts from '@/components/debts/DueDateAlerts.vue'
import InstallmentList from '@/components/debts/InstallmentList.vue'
import { useCardsStore } from '@/stores/cardsStore'
import { useSettingsStore } from '@/stores/settingsStore'

const cards = useCardsStore()
const settings = useSettingsStore()

const showForm = ref(false)
const debtType = ref<'card' | 'loan'>('card')

const form = ref({
  name: '',
  balance: '',
  limit: '',
  apr: '',
  minPayment: '',
  dueDate: '',
  remainingInstallments: '',
})

const confirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

function resetForm() {
  form.value = {
    name: '',
    balance: '',
    limit: '',
    apr: '',
    minPayment: '',
    dueDate: '',
    remainingInstallments: '',
  }
}

function onSubmit() {
  const name = form.value.name.trim()
  if (!name) return
  const balance = Number(form.value.balance) || 0
  const apr = Number(form.value.apr) || 0
  const minPayment = Number(form.value.minPayment) || 0

  if (debtType.value === 'card') {
    cards.addCard({
      type: 'card',
      name,
      balance,
      limit: Number(form.value.limit) || 0,
      apr,
      minPayment,
      dueDate: form.value.dueDate || null,
      installments: [],
    })
  } else {
    cards.addLoan({
      type: 'loan',
      name,
      balance,
      apr,
      minPayment,
      remainingInstallments: parseInt(form.value.remainingInstallments) || 0,
    })
  }

  resetForm()
  showForm.value = false
}

function askDelete(id: string) {
  pendingDeleteId.value = id
  confirmOpen.value = true
}
function confirmDelete() {
  if (pendingDeleteId.value) cards.remove(pendingDeleteId.value)
  pendingDeleteId.value = null
  confirmOpen.value = false
}
function cancelDelete() {
  pendingDeleteId.value = null
  confirmOpen.value = false
}
</script>

<template>
  <section class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">
        Deudas
      </h1>
      <button
        type="button"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Cancelar' : '+ Agregar' }}
      </button>
    </header>

    <DebtPayoffSummary />

    <DebtPriorityList />

    <DueDateAlerts
      :items="cards.state.items"
      :currency="settings.state.currency"
    />

    <form
      v-if="showForm"
      class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
      @submit.prevent="onSubmit"
    >
      <div class="flex gap-3">
        <label class="flex items-center gap-1.5 text-sm">
          <input
            v-model="debtType"
            type="radio"
            value="card"
          >
          Tarjeta de crédito
        </label>
        <label class="flex items-center gap-1.5 text-sm">
          <input
            v-model="debtType"
            type="radio"
            value="loan"
          >
          Préstamo
        </label>
      </div>

      <label class="flex flex-col gap-1">
        <span class="text-xs text-slate-600 dark:text-slate-300">Nombre *</span>
        <input
          v-model="form.name"
          type="text"
          placeholder="ej. Visa Bancolombia"
          class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Saldo actual *</span>
          <input
            v-model="form.balance"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label
          v-if="debtType === 'card'"
          class="flex flex-col gap-1"
        >
          <span class="text-xs text-slate-600 dark:text-slate-300">Cupo total</span>
          <input
            v-model="form.limit"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label
          v-if="debtType === 'loan'"
          class="flex flex-col gap-1"
        >
          <span class="text-xs text-slate-600 dark:text-slate-300">Cuotas restantes</span>
          <input
            v-model="form.remainingInstallments"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Tasa EA %</span>
          <input
            v-model="form.apr"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Pago mínimo *</span>
          <input
            v-model="form.minPayment"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label
          v-if="debtType === 'card'"
          class="flex flex-col gap-1"
        >
          <span class="text-xs text-slate-600 dark:text-slate-300">Fecha de corte</span>
          <input
            v-model="form.dueDate"
            type="date"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>
      </div>

      <button
        type="submit"
        class="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Guardar
      </button>
    </form>

    <div
      v-if="cards.state.items.length === 0 && !showForm"
      class="rounded border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      Sin deudas registradas. Presiona <strong>+ Agregar</strong> para comenzar.
    </div>

    <div class="flex flex-col gap-4">
      <div
        v-for="item in cards.state.items"
        :key="item.id"
        class="flex flex-col gap-2"
      >
        <div class="flex items-start gap-2">
          <CardCard
            :card="item"
            :currency="settings.state.currency"
            class="flex-1"
          />
          <button
            type="button"
            aria-label="Eliminar deuda"
            class="mt-1 rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            @click="askDelete(item.id)"
          >
            Eliminar
          </button>
        </div>

        <DebtPayoffSimulator
          v-if="item.type === 'card'"
          :debt-id="item.id"
        />

        <div v-if="item.type === 'card' && item.installments && item.installments.length > 0">
          <h2 class="mb-2 text-sm font-semibold">
            Cuotas — {{ item.name }}
          </h2>
          <InstallmentList
            :items="item.installments"
            :currency="settings.state.currency"
          />
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Eliminar deuda"
      message="¿Confirmas que deseas eliminar esta deuda?"
      confirm-label="Confirmar"
      cancel-label="Cancelar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
