<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface HealthBreakdown {
  dti?: number | null
  emergency?: number | null
  housing?: number | null
  savings?: number | null
}

// Raw indicators behind each sub-score (percentages, months of coverage).
export interface HealthMetricsProp {
  dti?: number | null
  emergencyMonths?: number | null
  housingRatio?: number | null
  savingsRate?: number | null
}

type Level = 'ok' | 'warn' | 'danger'
type Status = Level | 'missing'

const props = withDefaults(
  defineProps<{
    score?: number
    label?: string
    breakdown?: HealthBreakdown
    // Per-component level computed by useHealthScore (same cutoffs as the overall label).
    levels?: Partial<Record<keyof HealthBreakdown, Level | null>>
    metrics?: HealthMetricsProp
    defaultOpen?: boolean
    variant?: 'default' | 'compact'
  }>(),
  {
    score: 0,
    label: '',
    breakdown: () => ({}),
    levels: () => ({}),
    metrics: () => ({}),
    defaultOpen: false,
    variant: 'default',
  }
)

const { t } = useI18n()
const open = ref(props.defaultOpen)

const isCompact = computed(() => props.variant === 'compact')

function statusFor(component: keyof HealthBreakdown, value: number | null | undefined): Status {
  if (value === null || value === undefined) return 'missing'
  return props.levels[component] ?? 'missing'
}

const pct = (n: number): string => `${Math.round(n)}%`

function formatMonths(n: number): string {
  if (!Number.isFinite(n)) return '∞'
  return t('dashboard.health.breakdown.months', { n: n.toFixed(1) })
}

// Shows the raw indicator when available; falls back to the 0-100 sub-score.
function display(
  score: number | null | undefined,
  metric: number | null | undefined,
  format: (n: number) => string
): string {
  if (score === null || score === undefined) return t('dashboard.health.breakdown.noData')
  if (metric === null || metric === undefined) return `${Math.round(score)}/100`
  return format(metric)
}

// Targets mirror the "good" cutoffs in lib/health/thresholds.ts.
const rows = computed(() => [
  {
    key: 'dti' as const,
    label: t('dashboard.health.breakdown.dti'),
    value: props.breakdown.dti ?? null,
    shown: display(props.breakdown.dti, props.metrics.dti, pct),
    ideal: '≤ 20%',
  },
  {
    key: 'emergency' as const,
    label: t('dashboard.health.breakdown.emergency'),
    value: props.breakdown.emergency ?? null,
    shown: display(props.breakdown.emergency, props.metrics.emergencyMonths, formatMonths),
    ideal: t('dashboard.health.breakdown.months', { n: '≥ 6' }),
  },
  {
    key: 'housing' as const,
    label: t('dashboard.health.breakdown.housing'),
    value: props.breakdown.housing ?? null,
    shown: display(props.breakdown.housing, props.metrics.housingRatio, pct),
    ideal: '≤ 30%',
  },
  {
    key: 'savings' as const,
    label: t('dashboard.health.breakdown.savings'),
    value: props.breakdown.savings ?? null,
    shown: display(props.breakdown.savings, props.metrics.savingsRate, pct),
    ideal: '≥ 20%',
  },
])
</script>

<template>
  <article
    v-if="!isCompact"
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <button
      type="button"
      class="flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="open = !open"
    >
      <div class="flex flex-col items-start">
        <span class="text-xs uppercase tracking-wide text-slate-500">
          {{ t('dashboard.health.scoreTitle') }}
        </span>
        <span class="text-3xl font-bold">{{ score }}</span>
      </div>
      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
        {{ label }}
      </span>
    </button>

    <ul
      v-if="open"
      class="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
      role="list"
    >
      <li
        v-for="row in rows"
        :key="row.key"
        :data-component="row.key"
        :data-status="statusFor(row.key, row.value)"
        :data-component-status="
          statusFor(row.key, row.value) === 'missing' ? 'warn' : statusFor(row.key, row.value)
        "
        class="flex flex-col gap-1 text-sm"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ row.label }}</span>
          <span class="text-xs text-slate-500">
            {{ row.shown }} · {{ t('dashboard.health.breakdown.target') }} {{ row.ideal }}
          </span>
        </div>
        <p
          v-if="row.key === 'emergency'"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          {{ t('dashboard.health.breakdown.emergencyHint') }}
        </p>
      </li>
    </ul>
  </article>

  <div
    v-else
    class="flex items-center gap-2"
  >
    <span class="text-xl font-bold tabular-nums">{{ score }}</span>
    <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
      {{ label }}
    </span>
  </div>
</template>
