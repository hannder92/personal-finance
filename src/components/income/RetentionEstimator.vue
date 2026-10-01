<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBaseMetrics } from '@/composables/useBaseMetrics'
import { useRetencion } from '@/composables/useRetencion'
import { formatCurrency } from '@/lib/currency/format'
import { useSettingsStore } from '@/stores/settingsStore'

const props = withDefaults(
  defineProps<{
    grossSalary?: number
    currency?: string
  }>(),
  { grossSalary: 0, currency: 'COP' }
)

const { t } = useI18n()
const settings = useSettingsStore()
const { hasManualRetencion } = useBaseMetrics()
const { result, year } = useRetencion(() => props.grossSalary)
const formatted = computed(() => formatCurrency(result.value.amount, props.currency))

function onToggle(event: Event) {
  settings.setDeductRetencion((event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded border border-slate-200 px-4 py-3 dark:border-slate-700"
    data-component="retention-estimator"
  >
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-medium">{{ t('income.retencion.title') }}</span>
      <span
        class="text-lg font-semibold"
        data-retention-amount
      >
        {{ formatted }}
      </span>
    </div>
    <p
      v-if="result.belowThreshold"
      class="text-xs text-slate-500"
    >
      {{ t('income.retencion.notApplicable') }}
    </p>
    <template v-else>
      <label
        v-if="!hasManualRetencion"
        class="flex items-center gap-2 text-sm"
      >
        <input
          type="checkbox"
          data-testid="retention-deduct-toggle"
          :checked="settings.state.deductRetencion"
          class="h-4 w-4"
          @change="onToggle"
        >
        {{ t('income.retencion.deduct') }}
      </label>
      <p
        v-else
        data-testid="retention-manual-note"
        class="text-xs text-slate-500"
      >
        {{ t('income.retencion.manual') }}
      </p>
    </template>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('income.retencion.hint', { year }) }}
    </p>
  </div>
</template>
