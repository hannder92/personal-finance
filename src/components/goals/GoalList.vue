<script setup lang="ts">
import { computed, ref } from 'vue'
import GoalCard from './GoalCard.vue'
import { formatCurrency } from '@/lib/currency/format'
import { useGoalsStore } from '@/stores/goalsStore'

const props = withDefaults(
  defineProps<{
    savingsBucket?: number
    currency?: string
  }>(),
  { savingsBucket: 0, currency: 'COP' }
)

const goals = useGoalsStore()
const totalMonthlyContrib = computed(() =>
  goals.state.items.reduce((acc, g) => acc + g.monthlyContrib, 0)
)
const overBudget = computed(() => totalMonthlyContrib.value > props.savingsBucket)

function move(idx: number, dir: -1 | 1): void {
  const next = idx + dir
  if (next < 0 || next >= goals.state.items.length) return
  const order = goals.state.items.map((g) => g.id)
  const [moved] = order.splice(idx, 1)
  if (moved !== undefined) order.splice(next, 0, moved)
  goals.reorder(order)
}

const showForm = ref(false)
const form = ref({ name: '', target: '', saved: '', monthlyContrib: '', targetDate: '' })

function onSubmit() {
  const name = form.value.name.trim()
  if (!name) return
  goals.add({
    name,
    target: Number(form.value.target) || 0,
    saved: Number(form.value.saved) || 0,
    monthlyContrib: Number(form.value.monthlyContrib) || 0,
    targetDate: form.value.targetDate || null,
  })
  form.value = { name: '', target: '', saved: '', monthlyContrib: '', targetDate: '' }
  showForm.value = false
}

function removeGoal(id: string) {
  goals.remove(id)
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex justify-end">
      <button
        type="button"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Cancelar' : '+ Nueva meta' }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
      @submit.prevent="onSubmit"
    >
      <label class="flex flex-col gap-1">
        <span class="text-xs text-slate-600 dark:text-slate-300">Nombre de la meta *</span>
        <input
          v-model="form.name"
          type="text"
          placeholder="ej. Fondo de emergencia"
          class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Meta total *</span>
          <input
            v-model="form.target"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Ya ahorrado</span>
          <input
            v-model="form.saved"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Aporte mensual</span>
          <input
            v-model="form.monthlyContrib"
            type="number"
            min="0"
            placeholder="0"
            class="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs text-slate-600 dark:text-slate-300">Fecha límite</span>
          <input
            v-model="form.targetDate"
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
      v-if="overBudget"
      role="alert"
      class="rounded border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950"
    >
      El total de aportes mensuales ({{ formatCurrency(totalMonthlyContrib, currency) }}) excede tu
      presupuesto de ahorro ({{ formatCurrency(savingsBucket, currency) }}).
    </div>

    <div
      v-if="goals.state.items.length === 0 && !showForm"
      class="rounded border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      Sin metas registradas. Presiona <strong>+ Nueva meta</strong> para comenzar.
    </div>

    <div
      v-for="(g, idx) in goals.state.items"
      :key="g.id"
      class="flex items-stretch gap-2"
    >
      <GoalCard
        :goal="g"
        :currency="currency"
        class="flex-1"
      />
      <div class="flex flex-col gap-1">
        <button
          type="button"
          aria-label="Subir"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Bajar"
          class="rounded border px-2 py-1 text-xs"
          @click="move(idx, 1)"
        >
          ↓
        </button>
        <button
          type="button"
          aria-label="Eliminar meta"
          class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          @click="removeGoal(g.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </section>
</template>
