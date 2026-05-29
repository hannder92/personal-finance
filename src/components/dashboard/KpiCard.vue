<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/lib/currency/format'
import LucideIcon from '@/components/common/LucideIcon.vue'

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
</script>

<template>
  <article
    :data-risk="risk"
    :class="['flex flex-col gap-1 rounded border p-3', riskClass]"
  >
    <header class="flex items-center justify-between text-xs text-slate-500">
      <span>{{ label }}</span>
      <LucideIcon
        :name="ICONS[risk]"
        icon-class="h-3 w-3"
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
