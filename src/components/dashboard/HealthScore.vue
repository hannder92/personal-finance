<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { useFinancialGlossary, type GlossaryKey } from '@/composables/useFinancialGlossary'

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
  }>(),
  { score: 0, label: '', breakdown: () => ({}), defaultOpen: false }
)

const open = ref(props.defaultOpen)

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

const ROW_GLOSSARY: Record<keyof HealthBreakdown, GlossaryKey> = {
  dti: 'dti',
  emergency: 'emergency',
  housing: 'housing',
  savings: 'savings',
}

const { getTerm } = useFinancialGlossary()

const rows = computed(() => [
  { key: 'dti' as const, label: 'DTI', value: props.breakdown.dti ?? null, ideal: '≤ 30%' },
  {
    key: 'emergency' as const,
    label: 'Emergencia',
    value: props.breakdown.emergency ?? null,
    ideal: '≥ 75%',
  },
  {
    key: 'housing' as const,
    label: 'Vivienda',
    value: props.breakdown.housing ?? null,
    ideal: '≤ 30%',
  },
  {
    key: 'savings' as const,
    label: 'Ahorros',
    value: props.breakdown.savings ?? null,
    ideal: '≥ 15%',
  },
])

function tooltipBodyFor(key: keyof HealthBreakdown): string {
  const term = getTerm(ROW_GLOSSARY[key])
  if (!term) return ''
  const parts: string[] = [term.body]
  if (term.good !== undefined && term.risky !== undefined) {
    parts.push(`Saludable ≤ ${term.good}% · Riesgoso > ${term.risky}%`)
  } else if (term.recommended !== undefined) {
    parts.push(`Recomendado ≤ ${term.recommended}%`)
  } else if (term.rangeMin !== undefined && term.rangeMax !== undefined) {
    parts.push(`Rango ${term.rangeMin}–${term.rangeMax} meses`)
  }
  return parts.join(' · ')
}

const scoreTerm = computed(() => getTerm('healthScore'))
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <article
      class="flex flex-col gap-3 rounded border border-slate-200 p-4 dark:border-slate-700"
    >
      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="open = !open"
        >
          <div class="flex flex-col items-start">
            <span class="text-xs uppercase tracking-wide text-slate-500">Puntaje de salud</span>
            <span class="text-3xl font-bold">{{ score }}</span>
          </div>
          <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
            {{ label }}
          </span>
        </button>
        <TooltipRoot v-if="scoreTerm">
          <TooltipTrigger
            as="button"
            type="button"
            tabindex="0"
            data-testid="health-tooltip-trigger-score"
            :aria-label="scoreTerm.title"
            class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] leading-none text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            ⓘ
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              :side-offset="4"
              :collision-padding="8"
              :avoid-collisions="true"
              role="tooltip"
              class="z-[60] max-w-[280px] rounded bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg"
            >
              <strong class="block">{{ scoreTerm.title }}</strong>
              <span class="mt-1 block">{{ scoreTerm.body }}</span>
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </div>

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
          :data-component-status="statusFor(row.key, row.value) === 'missing' ? 'warn' : statusFor(row.key, row.value)"
          class="flex items-center justify-between text-sm"
        >
          <span class="flex items-center gap-1 font-medium">
            {{ row.label }}
            <TooltipRoot>
              <TooltipTrigger
                as="button"
                type="button"
                tabindex="0"
                :data-testid="`health-tooltip-trigger-${row.key}`"
                :aria-label="`${row.label}: definición`"
                class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] leading-none text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ⓘ
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  :side-offset="4"
                  :collision-padding="8"
                  :avoid-collisions="true"
                  role="tooltip"
                  class="z-[60] max-w-[260px] rounded bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg"
                >
                  <strong class="block">{{ getTerm(ROW_GLOSSARY[row.key])?.title }}</strong>
                  <span class="mt-1 block">{{ tooltipBodyFor(row.key) }}</span>
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </span>
          <span class="text-xs text-slate-500">
            {{ row.value ?? 'sin datos' }} · meta {{ row.ideal }}
          </span>
        </li>
      </ul>
    </article>
  </TooltipProvider>
</template>
