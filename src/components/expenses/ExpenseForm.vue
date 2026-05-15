<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit', value: { name: string; amount: number; category: string }): void
}>()

const name = ref('')
const amountRaw = ref('')
const category = ref('vivienda')

function onSubmit(event: Event) {
  event.preventDefault()
  const amount = Number.parseInt(amountRaw.value.replace(/\D/g, ''), 10) || 0
  if (!name.value || amount <= 0) return
  emit('submit', { name: name.value, amount, category: category.value })
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
      <span class="text-xs text-slate-600 dark:text-slate-300">Nombre</span>
      <input
        v-model="name"
        type="text"
        aria-label="Nombre"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
    </label>
    <label class="flex flex-1 flex-col gap-1">
      <span class="text-xs text-slate-600 dark:text-slate-300">Monto</span>
      <input
        v-model="amountRaw"
        type="text"
        inputmode="numeric"
        aria-label="Monto"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
    </label>
    <label class="flex flex-1 flex-col gap-1">
      <span class="text-xs text-slate-600 dark:text-slate-300">Categoría</span>
      <select
        v-model="category"
        aria-label="Categoría"
        class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="vivienda">Vivienda</option>
        <option value="utilities">Servicios</option>
        <option value="transporte">Transporte</option>
        <option value="alimentacion">Alimentación</option>
        <option value="otros">Otros</option>
      </select>
    </label>
    <button
      type="submit"
      class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
    >
      Agregar
    </button>
  </form>
</template>
