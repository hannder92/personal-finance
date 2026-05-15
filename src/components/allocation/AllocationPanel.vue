<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import { useAllocationStore } from '@/stores/allocationStore'

const props = withDefaults(
  defineProps<{
    totalIncome?: number
    currency?: string
  }>(),
  { totalIncome: 0, currency: 'COP' }
)

const allocation = useAllocationStore()
const needsInput = ref(allocation.state.needs)
const wantsInput = ref(allocation.state.wants)

watch(
  () => [allocation.state.needs, allocation.state.wants] as const,
  ([n, w]) => {
    needsInput.value = n
    wantsInput.value = w
  }
)

const overage = computed(() => needsInput.value + wantsInput.value > 100)
const savingsValue = computed(() =>
  Math.max(0, 100 - allocation.state.needs - allocation.state.wants)
)

function tryApply() {
  if (!overage.value) {
    allocation.setAllocation(needsInput.value, wantsInput.value)
  }
}

function onNeedsInput(event: Event) {
  needsInput.value = Number((event.target as HTMLInputElement).value) || 0
  tryApply()
}
function onWantsInput(event: Event) {
  wantsInput.value = Number((event.target as HTMLInputElement).value) || 0
  tryApply()
}

function bucketAmount(pct: number): number {
  return Math.round((pct / 100) * props.totalIncome)
}
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
    aria-label="Allocation"
  >
    <h2 class="text-base font-semibold">
      Distribución 50/30/20
    </h2>

    <label class="flex items-center justify-between gap-3">
      <span>Necesidades</span>
      <input
        :value="needsInput"
        type="number"
        min="0"
        max="100"
        :data-invalid="overage ? 'true' : 'false'"
        aria-label="Necesidades"
        :class="[
          'w-20 rounded border px-2 py-1 text-right',
          overage ? 'border-red-500 text-red-700' : 'border-slate-300 dark:border-slate-700',
        ]"
        @input="onNeedsInput"
      >
      <span class="text-xs text-slate-500">{{
        formatCurrency(bucketAmount(allocation.state.needs), currency)
      }}</span>
    </label>

    <label class="flex items-center justify-between gap-3">
      <span>Deseos</span>
      <input
        :value="wantsInput"
        type="number"
        min="0"
        max="100"
        :data-invalid="overage ? 'true' : 'false'"
        aria-label="Deseos"
        :class="[
          'w-20 rounded border px-2 py-1 text-right',
          overage ? 'border-red-500 text-red-700' : 'border-slate-300 dark:border-slate-700',
        ]"
        @input="onWantsInput"
      >
      <span class="text-xs text-slate-500">{{
        formatCurrency(bucketAmount(allocation.state.wants), currency)
      }}</span>
    </label>

    <label class="flex items-center justify-between gap-3">
      <span>Ahorros (savings)</span>
      <input
        :value="savingsValue"
        type="number"
        readonly
        disabled
        aria-label="Ahorros"
        class="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-right text-slate-500 dark:border-slate-700 dark:bg-slate-800"
      >
      <span class="text-xs text-slate-500">{{
        formatCurrency(bucketAmount(savingsValue), currency)
      }}</span>
    </label>

    <p
      v-if="overage"
      class="text-xs text-red-600"
      role="alert"
    >
      La suma excede 100%. Ajusta los valores.
    </p>
  </section>
</template>
