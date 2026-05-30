<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
    variant?: 'default' | 'compact'
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

function statusFor(component: keyof HealthBreakdown, value: number | null | undefined): Status {
  if (value === null || value === undefined) return 'missing'
  switch (component) {
    case 'dti':
      if (value <= 30) return 'ok'
      if (value <= 45) return 'warn'
      return 'danger'
    case 'emergency':
      if (value >= 75) return 'ok'
      if (value >= 40) return 'warn'
      return 'danger'
    case 'housing':
      if (value <= 30) return 'ok'
      if (value <= 40) return 'warn'
      return 'danger'
    case 'savings':
      if (value >= 15) return 'ok'
      if (value >= 5) return 'warn'
      return 'danger'
  }
}

const rows = computed(() => [
  {
    key: 'dti' as const,
    label: t('dashboard.health.breakdown.dti'),
    value: props.breakdown.dti ?? null,
    ideal: '≤ 30%',
  },
  {
    key: 'emergency' as const,
    label: t('dashboard.health.breakdown.emergency'),
    value: props.breakdown.emergency ?? null,
    ideal: '≥ 75%',
  },
  {
    key: 'housing' as const,
    label: t('dashboard.health.breakdown.housing'),
    value: props.breakdown.housing ?? null,
    ideal: '≤ 30%',
  },
  {
    key: 'savings' as const,
    label: t('dashboard.health.breakdown.savings'),
    value: props.breakdown.savings ?? null,
    ideal: '≥ 15%',
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
            {{ row.value ?? t('dashboard.health.breakdown.noData') }} · meta {{ row.ideal }}
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
