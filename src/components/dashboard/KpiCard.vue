<script setup lang="ts">
import { computed } from 'vue'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { formatCurrency } from '@/lib/currency/format'
import { useFinancialGlossary, type GlossaryKey } from '@/composables/useFinancialGlossary'

type Risk = 'ok' | 'warn' | 'danger'

const props = withDefaults(
  defineProps<{
    label?: string
    value?: number
    type?: string
    threshold?: number
    currency?: string
    context?: string
  }>(),
  {
    label: '',
    value: 0,
    type: 'income',
    threshold: 0,
    currency: 'COP',
    context: '',
  }
)

const risk = computed<Risk>(() => {
  if (props.type === 'dti' && props.threshold > 0) {
    if (props.value >= props.threshold * 1.25) return 'danger'
    if (props.value > props.threshold) return 'warn'
  }
  return 'ok'
})

const displayValue = computed(() => {
  if (props.type === 'dti') return `${props.value}%`
  if (props.type === 'health') return String(props.value)
  return formatCurrency(props.value, props.currency)
})

const riskClass = computed(() => {
  switch (risk.value) {
    case 'danger':
      return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950'
    case 'warn':
      return 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950'
    default:
      return 'border-slate-200 dark:border-slate-700'
  }
})

const ICONS: Record<Risk, string> = {
  ok: 'check-circle',
  warn: 'alert-triangle',
  danger: 'alert-octagon',
}

const contextOrDefault = computed(() => {
  if (props.context) return props.context
  if (props.type === 'dti' && risk.value !== 'ok') return 'Riesgo de deuda alto'
  return ''
})

const GLOSSARY_KEY_BY_TYPE: Record<string, GlossaryKey> = {
  dti: 'dti',
  housing: 'housing',
  emergency: 'emergency',
  savings: 'savings',
  health: 'healthScore',
}

const { getTerm } = useFinancialGlossary()
const glossaryTerm = computed(() => {
  const key = GLOSSARY_KEY_BY_TYPE[props.type]
  return key ? getTerm(key) : null
})

const tooltipText = computed(() => {
  const term = glossaryTerm.value
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
})
</script>

<template>
  <article
    :data-risk="risk"
    :class="['flex flex-col gap-1 rounded border p-3', riskClass]"
  >
    <header class="flex items-center justify-between text-xs text-slate-500">
      <span class="flex items-center gap-1">
        {{ label }}
        <TooltipProvider
          v-if="glossaryTerm"
          :delay-duration="0"
        >
          <TooltipRoot>
            <TooltipTrigger
              as="button"
              type="button"
              tabindex="0"
              data-testid="kpi-card-tooltip-trigger"
              :aria-label="`${label}: ${glossaryTerm.title}`"
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
                <strong class="block">{{ glossaryTerm.title }}</strong>
                <span class="mt-1 block">{{ tooltipText }}</span>
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </TooltipProvider>
      </span>
      <span
        :data-icon="ICONS[risk]"
        class="inline-block h-3 w-3"
        aria-hidden="true"
      />
    </header>
    <p class="text-lg font-semibold">
      {{ displayValue }}
    </p>
    <p
      v-if="contextOrDefault"
      class="text-xs text-slate-600 dark:text-slate-300"
    >
      {{ contextOrDefault }}
    </p>
  </article>
</template>
