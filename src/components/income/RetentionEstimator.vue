<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import { calcRetencion } from '@/lib/tax/colombia/retencion'

const props = withDefaults(
  defineProps<{
    grossSalary?: number
    currency?: string
  }>(),
  { grossSalary: 0, currency: 'COP' }
)

const result = computed(() => calcRetencion(props.grossSalary))
const formatted = computed(() => formatCurrency(result.value.amount, props.currency))
</script>

<template>
  <div
    class="rounded border border-slate-200 px-4 py-3 dark:border-slate-700"
    data-component="retention-estimator"
  >
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-medium"> Retención en la fuente ({{ result.label }}) </span>
      <span
        class="text-lg font-semibold"
        data-retention-amount
      >
        {{ formatted }}
      </span>
    </div>
    <p
      v-if="result.belowThreshold"
      class="mt-1 text-xs text-slate-500"
    >
      No aplica para este nivel salarial.
    </p>
  </div>
</template>
