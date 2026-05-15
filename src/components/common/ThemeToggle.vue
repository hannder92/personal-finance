<script setup lang="ts">
import { onMounted, watch } from 'vue'

type Theme = 'system' | 'light' | 'dark'

const props = withDefaults(
  defineProps<{
    modelValue?: Theme
  }>(),
  { modelValue: 'system' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Theme): void
}>()

const ORDER: Theme[] = ['system', 'light', 'dark']

function nextTheme(current: Theme): Theme {
  const idx = ORDER.indexOf(current)
  return ORDER[(idx + 1) % ORDER.length] ?? 'system'
}

function applyHtmlClass(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system: follow prefers-color-scheme
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

onMounted(() => applyHtmlClass(props.modelValue))

watch(
  () => props.modelValue,
  (val) => applyHtmlClass(val)
)

function onClick() {
  emit('update:modelValue', nextTheme(props.modelValue))
}

const ICONS: Record<Theme, string> = {
  system: 'monitor',
  light: 'sun',
  dark: 'moon',
}

const LABELS: Record<Theme, string> = {
  system: 'Tema: sistema',
  light: 'Tema: claro',
  dark: 'Tema: oscuro',
}
</script>

<template>
  <button
    type="button"
    :aria-label="LABELS[modelValue]"
    class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:hover:bg-slate-800"
    @click="onClick"
  >
    <span
      :data-icon="ICONS[modelValue]"
      class="inline-block h-4 w-4"
      aria-hidden="true"
    />
  </button>
</template>
