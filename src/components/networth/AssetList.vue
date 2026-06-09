<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import { useAssetsStore, type AssetType } from '@/stores/assetsStore'

const props = withDefaults(
  defineProps<{
    currency?: string
  }>(),
  { currency: 'COP' }
)

const assets = useAssetsStore()
const total = computed(() => assets.state.items.reduce((acc, a) => acc + a.value, 0))

const name = ref('')
const valueRaw = ref('')
const type = ref<AssetType>('savings')
const rateRaw = ref('')

// annualRatePercent is only meaningful for savings/investment per OQ-P2 (2-plan.md).
const showRateInput = computed(() => type.value === 'savings' || type.value === 'investment')

function onSubmit(event: Event) {
  event.preventDefault()
  const value = Number.parseInt(valueRaw.value.replace(/\D/g, ''), 10) || 0
  if (!name.value || value <= 0) return
  const rate = showRateInput.value
    ? Math.min(100, Math.max(0, Number.parseFloat(rateRaw.value) || 0))
    : 0
  assets.add({ name: name.value, value, type: type.value, annualRatePercent: rate })
  name.value = ''
  valueRaw.value = ''
  rateRaw.value = ''
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <form
      class="flex flex-wrap items-end gap-2"
      @submit="onSubmit"
    >
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">Nombre</span>
        <input
          v-model="name"
          type="text"
          aria-label="Nombre"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">Valor</span>
        <input
          v-model="valueRaw"
          type="text"
          inputmode="numeric"
          aria-label="Valor"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <label class="flex flex-1 flex-col gap-1">
        <span class="text-xs">Tipo</span>
        <select
          v-model="type"
          aria-label="Tipo"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="savings">Ahorros</option>
          <option value="investment">Inversión</option>
          <option value="property">Inmueble</option>
          <option value="vehicle">Vehículo</option>
          <option value="other">Otro</option>
        </select>
      </label>
      <label
        v-if="showRateInput"
        class="flex flex-1 flex-col gap-1"
      >
        <span class="text-xs">Tasa anual (E.A. %)</span>
        <input
          v-model="rateRaw"
          type="number"
          min="0"
          max="100"
          step="0.01"
          aria-label="Tasa anual"
          placeholder="0"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <button
        type="submit"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
      >
        Agregar
      </button>
    </form>

    <ul
      v-if="assets.state.items.length > 0"
      class="flex flex-col gap-2"
      role="list"
    >
      <li
        v-for="a in assets.state.items"
        :key="a.id"
        class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
      >
        <span class="font-medium">{{ a.name }}</span>
        <span class="text-sm">{{ formatCurrency(a.value, props.currency) }}</span>
      </li>
    </ul>

    <footer class="border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
      Total activos: {{ formatCurrency(total, props.currency) }}
    </footer>
  </section>
</template>
