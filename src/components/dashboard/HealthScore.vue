<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Breakdown values are the component SCORES (0–100) returned by calcHealthScore,
// not the raw ratios — the row status is derived from that score.
export interface HealthBreakdown {
  dti?: number | null
  emergency?: number | null
  housing?: number | null
  savings?: number | null
}

type Status = 'ok' | 'warn' | 'danger' | 'missing'

const props = withDefaults(
  defineProps<{
    score?: number
    label?: string
    breakdown?: HealthBreakdown
    defaultOpen?: boolean
    /** default: score + collapsible breakdown · compact: score + label · breakdown: rows only. */
    variant?: 'default' | 'compact' | 'breakdown'
  }>(),
  {
    score: 0,
    label: '',
    breakdown: () => ({}),
    defaultOpen: false,
    variant: 'default',
  }
)

const { t } = useI18n()
const open = ref(props.defaultOpen)

const isCompact = computed(() => props.variant === 'compact')
const isBreakdownOnly = computed(() => props.variant === 'breakdown')

function statusFor(value: number | null | undefined): Status {
  if (value === null || value === undefined) return 'missing'
  if (value >= 70) return 'ok'
  if (value >= 40) return 'warn'
  return 'danger'
}

const rows = computed(() =>
  (['dti', 'emergency', 'housing', 'savings'] as const).map((key) => {
    const raw = props.breakdown[key]
    const value = raw === null || raw === undefined ? null : Math.round(raw)
    return {
      key,
      label: t(`dashboard.health.breakdown.${key}`),
      value,
      ideal: t(`dashboard.health.breakdown.ideal.${key}`),
    }
  })
)

const STATUS_DOT: Record<Status, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  danger: 'bg-red-500',
  missing: 'bg-slate-300 dark:bg-slate-600',
}
</script>

<template>
  <article
    v-if="!isCompact"
    class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
  >
    <button
      type="button"
      class="flex items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      :aria-expanded="open"
      @click="open = !open"
    >
      <h2
        v-if="isBreakdownOnly"
        class="text-base font-semibold"
      >
        {{ t('dashboard.health.breakdownTitle') }}
      </h2>
      <div
        v-else
        class="flex flex-col items-start"
      >
        <span class="text-xs uppercase tracking-wide text-slate-500">
          {{ t('dashboard.health.scoreTitle') }}
        </span>
        <span class="text-3xl font-bold">{{ score }}</span>
      </div>
      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
        {{ isBreakdownOnly ? `${score} · ${label}` : label }}
      </span>
    </button>

    <ul
      v-if="open"
      class="flex flex-col gap-3 border-t border-slate-200 pt-3 dark:border-slate-700"
      role="list"
    >
      <li
        v-for="row in rows"
        :key="row.key"
        :data-component="row.key"
        :data-status="statusFor(row.value)"
        :data-component-status="statusFor(row.value) === 'missing' ? 'warn' : statusFor(row.value)"
        class="flex flex-col gap-1 text-sm"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="flex items-center gap-2 font-medium">
            <span
              :class="['inline-block h-2 w-2 rounded-full', STATUS_DOT[statusFor(row.value)]]"
              aria-hidden="true"
            />
            {{ row.label }}
          </span>
          <span class="text-xs tabular-nums text-slate-600 dark:text-slate-300">
            {{
              row.value === null
                ? t('dashboard.health.breakdown.noData')
                : t('dashboard.health.breakdown.points', { value: row.value })
            }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ row.ideal }}
        </p>
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
