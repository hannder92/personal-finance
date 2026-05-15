<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrency, getCurrencyConfig } from '@/lib/currency/format'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    currency?: string
    placeholder?: string
  }>(),
  {
    modelValue: 0,
    currency: 'COP',
    placeholder: '',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const focused = ref(false)

const displayValue = computed(() => {
  if (focused.value) {
    // While focused, show grouped plain number (no currency symbol).
    if (!props.modelValue) return ''
    const { locale } = getCurrencyConfig(props.currency)
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(props.modelValue)
  }
  if (!props.modelValue) return ''
  return formatCurrency(props.modelValue, props.currency)
})

const inputValue = ref(displayValue.value)

watch(displayValue, (next) => {
  inputValue.value = next
})

function parseAmount(raw: string): number {
  // Remove every non-digit character; locale separators ($, ., space, NBSP, ,) all drop.
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? 0 : Number.parseInt(digits, 10)
}

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  inputValue.value = raw
  emit('update:modelValue', parseAmount(raw))
}

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
  inputValue.value = displayValue.value
}
</script>

<template>
  <input
    type="text"
    inputmode="numeric"
    :value="inputValue"
    :placeholder="placeholder"
    class="w-full rounded border border-slate-300 px-3 py-2 text-right dark:border-slate-700 dark:bg-slate-900"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  >
</template>
