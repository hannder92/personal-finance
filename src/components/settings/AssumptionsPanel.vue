<script setup lang="ts">
// Projection assumptions (20261002-proyecciones-reales, US-1). The return field edits the
// same projection rate as the home savings projection (AC-1.5).
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAssumptions } from '@/composables/useAssumptions'
import { useFormat } from '@/composables/useFormat'
import { useSettingsStore } from '@/stores/settingsStore'

type Field = 'inflation' | 'return' | 'withdrawal'

const { t } = useI18n()
const fmtx = useFormat()
const settings = useSettingsStore()
const {
  inflationPercent,
  annualReturnPercent,
  withdrawalRatePercent,
  realRate,
  optimistic,
  reference,
} = useAssumptions()

const RANGES: Record<Field, { min: number; max: number }> = {
  inflation: { min: 0, max: 30 },
  return: { min: 0, max: 100 },
  withdrawal: { min: 1, max: 10 },
}

const drafts = reactive<Record<Field, string>>({
  inflation: String(inflationPercent.value),
  return: String(annualReturnPercent.value),
  withdrawal: String(withdrawalRatePercent.value),
})
const errors = reactive<Record<Field, boolean>>({
  inflation: false,
  return: false,
  withdrawal: false,
})

// Keep drafts in sync when values change elsewhere (reference button, home projection).
watch(inflationPercent, (v) => setDraft('inflation', v))
watch(annualReturnPercent, (v) => setDraft('return', v))
watch(withdrawalRatePercent, (v) => setDraft('withdrawal', v))

function setDraft(field: Field, value: number): void {
  if (Number(drafts[field]) !== value) drafts[field] = String(value)
  errors[field] = false
}

function onInput(field: Field, raw: string): void {
  drafts[field] = raw
  const value = Number(raw)
  const { min, max } = RANGES[field]
  if (raw.trim() === '' || !Number.isFinite(value) || value < min || value > max) {
    errors[field] = true
    return
  }
  errors[field] = false
  if (field === 'inflation') settings.setInflationPercent(value)
  else if (field === 'return') settings.setProjectionAnnualRatePercent(value)
  else settings.setWithdrawalRatePercent(value)
}

// Inflation 0 is the post-migration default, so it signals "not configured yet" (AC-1.1).
const configured = computed(() => inflationPercent.value > 0)
const usingReference = computed(
  () =>
    inflationPercent.value === reference.inflationPercent &&
    annualReturnPercent.value === reference.annualReturnPercent &&
    withdrawalRatePercent.value === reference.withdrawalRatePercent
)
const referenceDate = computed(() => {
  const [y, m] = reference.asOf.split('-').map(Number)
  return fmtx.monthYear(new Date(y ?? 2026, (m ?? 1) - 1, 1))
})

const fields: Array<{ key: Field; label: string; hint?: string; step: string }> = [
  { key: 'inflation', label: 'settings.assumptions.inflation', step: '0.1' },
  {
    key: 'return',
    label: 'settings.assumptions.return',
    hint: 'settings.assumptions.returnHint',
    step: '0.1',
  },
  {
    key: 'withdrawal',
    label: 'settings.assumptions.withdrawal',
    hint: 'settings.assumptions.withdrawalHint',
    step: '0.1',
  },
]
</script>

<template>
  <section
    id="assumptions"
    data-testid="assumptions-panel"
    class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
  >
    <header>
      <h2 class="text-base font-semibold">
        {{ t('settings.assumptions.title') }}
      </h2>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {{ t('settings.assumptions.subtitle') }}
      </p>
    </header>

    <p
      v-if="!configured"
      data-testid="assumptions-suggestion"
      class="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      {{ t('settings.assumptions.suggestion') }}
    </p>

    <button
      type="button"
      data-testid="assumptions-use-reference"
      class="min-h-11 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="settings.applyColombiaReference()"
    >
      {{ t('settings.assumptions.useReference') }}
    </button>

    <div class="grid gap-4 sm:grid-cols-3">
      <label
        v-for="field in fields"
        :key="field.key"
        class="flex flex-col gap-1 text-sm"
      >
        <span class="font-medium">{{ t(field.label) }}</span>
        <input
          :value="drafts[field.key]"
          :data-testid="`assumption-${field.key}`"
          type="number"
          inputmode="decimal"
          :min="RANGES[field.key].min"
          :max="RANGES[field.key].max"
          :step="field.step"
          :aria-invalid="errors[field.key]"
          class="min-h-11 rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600"
          @input="onInput(field.key, ($event.target as HTMLInputElement).value)"
        >
        <span
          v-if="errors[field.key]"
          :data-testid="`assumption-${field.key}-error`"
          role="alert"
          class="text-xs text-red-600 dark:text-red-400"
        >
          {{
            t('settings.assumptions.range', {
              min: RANGES[field.key].min,
              max: RANGES[field.key].max,
            })
          }}
        </span>
        <span
          v-else-if="field.hint"
          class="text-xs text-slate-500 dark:text-slate-400"
        >{{
          t(field.hint)
        }}</span>
      </label>
    </div>

    <p
      data-testid="assumptions-real-rate"
      class="text-sm font-medium"
      :class="
        realRate < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'
      "
    >
      {{ t('settings.assumptions.realRate', { rate: fmtx.percent(realRate, 2) }) }}
    </p>
    <p
      v-if="optimistic"
      data-testid="assumptions-optimistic"
      role="status"
      class="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      {{ t('settings.assumptions.optimistic') }}
    </p>

    <p
      v-if="usingReference"
      data-testid="assumptions-source"
      class="text-xs text-slate-500 dark:text-slate-400"
    >
      {{ t('settings.assumptions.source', { date: referenceDate }) }}
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('settings.assumptions.disclaimer') }}
    </p>
  </section>
</template>
